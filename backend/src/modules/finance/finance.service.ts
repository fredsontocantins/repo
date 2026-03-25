import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { PayableStatus, ReceivableStatus } from '@prisma/client'
import { normalizePagination } from '../../common/utils/pagination'

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /** Atualiza status para VENCIDO em registros vencidos */
  private async syncExpired(orgId: number) {
    const now = new Date()
    await Promise.all([
      this.prisma.payable.updateMany({
        where: { organizationId: orgId, status: PayableStatus.A_PAGAR, vencimento: { lt: now } },
        data: { status: PayableStatus.VENCIDO },
      }),
      this.prisma.receivable.updateMany({
        where: { organizationId: orgId, status: ReceivableStatus.A_RECEBER, vencimento: { lt: now } },
        data: { status: ReceivableStatus.VENCIDO },
      }),
    ])
  }

  private fmtWhere(orgId: number, f: Record<string, any> = {}) {
    const where: any = { organizationId: orgId }
    if (f.status) where.status = f.status
    if (f.categoria) where.categoria = f.categoria
    if (f.search) {
      where.OR = [
        { descricao: { contains: f.search, mode: 'insensitive' } },
        { fornecedor: { contains: f.search, mode: 'insensitive' } },
        { pagador: { contains: f.search, mode: 'insensitive' } },
      ]
    }
    if (f.mes) {
      const d = new Date(f.mes)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      where.vencimento = { gte: start, lte: end }
    }
    return where
  }

  // ─── DASHBOARD FINANCEIRO ────────────────────────────────────────────────────

  async getDashboard(orgId: number) {
    await this.syncExpired(orgId)
    const now = new Date()
    const windows = [7, 30, 60, 90]
    const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const formatMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
    const trendMonths = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
      return { label: date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }), key: formatMonthKey(date) }
    })

    const [
      payTotals, recTotals,
      payByStatus, recByStatus,
      proximosVencPay, proximosVencRec,
      payRecentActivity, recRecentActivity,
    ] = await Promise.all([
      this.prisma.payable.aggregate({
        where: { organizationId: orgId, status: { in: ['A_PAGAR', 'VENCIDO', 'PAGO'] } },
        _sum: { valor: true, valorPago: true },
      }),
      this.prisma.receivable.aggregate({
        where: { organizationId: orgId, status: { in: ['A_RECEBER', 'VENCIDO', 'RECEBIDO'] } },
        _sum: { valor: true, valorRecebido: true },
      }),
      this.prisma.payable.groupBy({
        by: ['status'],
        where: { organizationId: orgId },
        _count: true,
        _sum: { valor: true },
      }),
      this.prisma.receivable.groupBy({
        by: ['status'],
        where: { organizationId: orgId },
        _count: true,
        _sum: { valor: true },
      }),
      this.prisma.payable.findMany({
        where: {
          organizationId: orgId,
          status: PayableStatus.A_PAGAR,
          vencimento: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { vencimento: 'asc' },
        take: 5,
      }),
      this.prisma.receivable.findMany({
        where: {
          organizationId: orgId,
          status: ReceivableStatus.A_RECEBER,
          vencimento: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { vencimento: 'asc' },
        take: 5,
      }),
      this.prisma.payable.findMany({
        where: { organizationId: orgId, status: PayableStatus.PAGO },
        orderBy: { dataPagamento: 'desc' },
        take: 5,
      }),
      this.prisma.receivable.findMany({
        where: { organizationId: orgId, status: ReceivableStatus.RECEBIDO },
        orderBy: { dataRecebimento: 'desc' },
        take: 5,
      }),
    ])

    const [
      categoryPay,
      categoryRec,
      payTrendRecords,
      recTrendRecords,
      payAgingRecords,
      recAgingRecords,
      overdueTop,
      plannedPayAgg,
      plannedRecAgg,
      payLast30,
      recLast30,
    ] = await Promise.all([
      this.prisma.payable.groupBy({
        by: ['categoria'],
        where: { organizationId: orgId },
        _sum: { valor: true },
      }),
      this.prisma.receivable.groupBy({
        by: ['categoria'],
        where: { organizationId: orgId },
        _sum: { valor: true },
      }),
      this.prisma.payable.findMany({
        where: { organizationId: orgId, vencimento: { gte: trendStart } },
        select: { valor: true, vencimento: true },
      }),
      this.prisma.receivable.findMany({
        where: { organizationId: orgId, vencimento: { gte: trendStart } },
        select: { valor: true, vencimento: true },
      }),
      this.prisma.payable.findMany({
        where: {
          organizationId: orgId,
          status: { in: [PayableStatus.A_PAGAR, PayableStatus.VENCIDO] },
        },
        select: { valor: true, vencimento: true },
      }),
      this.prisma.receivable.findMany({
        where: {
          organizationId: orgId,
          status: { in: [ReceivableStatus.A_RECEBER, ReceivableStatus.VENCIDO] },
        },
        select: { valor: true, vencimento: true },
      }),
      this.prisma.payable.findMany({
        where: {
          organizationId: orgId,
          status: { in: [PayableStatus.A_PAGAR, PayableStatus.VENCIDO] },
        },
        orderBy: { valor: 'desc' },
        take: 3,
      }),
      this.prisma.payable.aggregate({
        where: { organizationId: orgId, status: { in: [PayableStatus.A_PAGAR, PayableStatus.VENCIDO] } },
        _sum: { valor: true },
      }),
      this.prisma.receivable.aggregate({
        where: { organizationId: orgId, status: { in: [ReceivableStatus.A_RECEBER, ReceivableStatus.VENCIDO] } },
        _sum: { valor: true },
      }),
      this.prisma.payable.aggregate({
        where: {
          organizationId: orgId,
          status: PayableStatus.PAGO,
          dataPagamento: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { valorPago: true },
      }),
      this.prisma.receivable.aggregate({
        where: {
          organizationId: orgId,
          status: ReceivableStatus.RECEBIDO,
          dataRecebimento: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { valorRecebido: true },
      }),
    ])

    const payWindowResults = await Promise.all(windows.map(days =>
      this.prisma.payable.aggregate({
        where: {
          organizationId: orgId,
          status: { in: [PayableStatus.A_PAGAR, PayableStatus.VENCIDO] },
          vencimento: { gte: now, lte: new Date(now.getTime() + days * 24 * 60 * 60 * 1000) },
        },
        _sum: { valor: true },
      })
    ))
    const recWindowResults = await Promise.all(windows.map(days =>
      this.prisma.receivable.aggregate({
        where: {
          organizationId: orgId,
          status: { in: [ReceivableStatus.A_RECEBER, ReceivableStatus.VENCIDO] },
          vencimento: { gte: now, lte: new Date(now.getTime() + days * 24 * 60 * 60 * 1000) },
        },
        _sum: { valor: true },
      })
    ))

    const totalRecebido = recTotals._sum.valorRecebido || 0
    const totalPago = payTotals._sum.valorPago || 0
    const saldoAtual = totalRecebido - totalPago
    const netFlowLast30 = (recLast30._sum.valorRecebido || 0) - (payLast30._sum.valorPago || 0)
    const monthlyOutflow = Math.max(payLast30._sum.valorPago || 0, 1)
    const runwayDays = monthlyOutflow === 0 ? 999 : Math.max(0, Math.floor((saldoAtual / (monthlyOutflow / 30)) || 0))

    const payVencido = payByStatus.find(s => s.status === 'VENCIDO')
    const recVencido = recByStatus.find(s => s.status === 'VENCIDO')

    const payTrendMap: Record<string, number> = {}
    payTrendRecords.forEach(r => {
      const key = formatMonthKey(r.vencimento)
      payTrendMap[key] = (payTrendMap[key] || 0) + r.valor
    })
    const recTrendMap: Record<string, number> = {}
    recTrendRecords.forEach(r => {
      const key = formatMonthKey(r.vencimento)
      recTrendMap[key] = (recTrendMap[key] || 0) + r.valor
    })

    const bucketAging = (records: { valor: number; vencimento: Date }[]) => {
      const buckets = { future: 0, upTo30: 0, upTo60: 0, over60: 0 }
      const msPerDay = 24 * 60 * 60 * 1000
      records.forEach(rec => {
        const diff = Math.floor((now.getTime() - rec.vencimento.getTime()) / msPerDay)
        if (diff < 0) buckets.future += rec.valor
        else if (diff <= 30) buckets.upTo30 += rec.valor
        else if (diff <= 60) buckets.upTo60 += rec.valor
        else buckets.over60 += rec.valor
      })
      return [
        { label: 'Até vencer', value: buckets.future },
        { label: '0-30 dias', value: buckets.upTo30 },
        { label: '31-60 dias', value: buckets.upTo60 },
        { label: '+60 dias', value: buckets.over60 },
      ]
    }

    const execSummary = {
      cashOnHand: saldoAtual,
      netFlowLast30,
      runwayDays: runwayDays >= 999 ? null : runwayDays,
      runRisk: runwayDays <= 30,
      receivableCoverage: plannedRecAgg._sum.valor
        ? totalRecebido / plannedRecAgg._sum.valor
        : 1,
    }

    const cashFlowTrend = trendMonths.map(month => ({
      label: month.label,
      payables: payTrendMap[month.key] || 0,
      receivables: recTrendMap[month.key] || 0,
      net: (recTrendMap[month.key] || 0) - (payTrendMap[month.key] || 0),
    }))

    return {
      resumo: {
        saldoAtual,
        totalAPagar: payByStatus.find(s => s.status === 'A_PAGAR')?._sum?.valor || 0,
        totalAReceber: recByStatus.find(s => s.status === 'A_RECEBER')?._sum?.valor || 0,
        totalPago,
        totalRecebido,
        payVencidoCount: payVencido?._count || 0,
        payVencidoValor: payVencido?._sum?.valor || 0,
        recVencidoCount: recVencido?._count || 0,
        recVencidoValor: recVencido?._sum?.valor || 0,
      },
      execSummary,
      cashFlowTrend,
      budgetComparison: {
        payables: {
          planned: plannedPayAgg._sum.valor || 0,
          actual: totalPago,
          variance: totalPago - (plannedPayAgg._sum.valor || 0),
        },
        receivables: {
          planned: plannedRecAgg._sum.valor || 0,
          actual: totalRecebido,
          variance: totalRecebido - (plannedRecAgg._sum.valor || 0),
        },
      },
      paymentMix: categoryPay.map(c => ({ category: c.categoria, valor: c._sum.valor || 0 })).sort((a, b) => b.valor - a.valor),
      receivableMix: categoryRec.map(c => ({ category: c.categoria, valor: c._sum.valor || 0 })).sort((a, b) => b.valor - a.valor),
      aging: {
        payables: bucketAging(payAgingRecords),
        receivables: bucketAging(recAgingRecords),
      },
      upcomingWindows: windows.map((days, idx) => ({
        days,
        payables: payWindowResults[idx]._sum.valor || 0,
        receivables: recWindowResults[idx]._sum.valor || 0,
      })),
      risks: overdueTop,
      payByStatus: payByStatus.map(s => ({ status: s.status, count: s._count, valor: s._sum.valor || 0 })),
      recByStatus: recByStatus.map(s => ({ status: s.status, count: s._count, valor: s._sum.valor || 0 })),
      proximosVencPay,
      proximosVencRec,
      payRecentActivity,
      recRecentActivity,
    }
  }

  // ─── PAYABLES ────────────────────────────────────────────────────────────────

  async findAllPayables(orgId: number, filters: Record<string, any> = {}) {
    await this.syncExpired(orgId)
    const where = this.fmtWhere(orgId, filters)
    const { page, limit, skip } = normalizePagination(filters, 20)
    const [data, total] = await Promise.all([
      this.prisma.payable.findMany({
        where, skip, take: limit,
        orderBy: [{ status: 'asc' }, { vencimento: 'asc' }],
      }),
      this.prisma.payable.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async createPayable(orgId: number, data: any) {
    return this.prisma.payable.create({ data: { ...data, organizationId: orgId } })
  }

  async updatePayable(id: number, orgId: number, data: any) {
    const rec = await this.prisma.payable.findFirst({ where: { id, organizationId: orgId } })
    if (!rec) throw new NotFoundException('Conta a pagar não encontrada')
    return this.prisma.payable.update({ where: { id }, data })
  }

  /** Liquidar (marcar como PAGO) */
  async liquidarPayable(id: number, orgId: number, data: {
    valorPago: number
    formaPagamento: string
    dataPagamento?: string
    comprovante?: string
    observacao?: string
  }) {
    const rec = await this.prisma.payable.findFirst({ where: { id, organizationId: orgId } })
    if (!rec) throw new NotFoundException('Conta a pagar não encontrada')
    if (rec.status === PayableStatus.PAGO) throw new BadRequestException('Conta já está paga')
    if (rec.status === PayableStatus.CANCELADO) throw new BadRequestException('Conta está cancelada')

    return this.prisma.payable.update({
      where: { id },
      data: {
        status: PayableStatus.PAGO,
        valorPago: data.valorPago,
        formaPagamento: data.formaPagamento,
        dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : new Date(),
        comprovante: data.comprovante,
        observacao: data.observacao,
      },
    })
  }

  /** Estornar pagamento */
  async estornarPayable(id: number, orgId: number, motivo: string) {
    const rec = await this.prisma.payable.findFirst({ where: { id, organizationId: orgId } })
    if (!rec) throw new NotFoundException('Conta a pagar não encontrada')
    if (rec.status !== PayableStatus.PAGO) throw new BadRequestException('Apenas contas pagas podem ser estornadas')

    return this.prisma.payable.update({
      where: { id },
      data: {
        status: PayableStatus.ESTORNADO,
        dataEstorno: new Date(),
        motivoEstorno: motivo,
      },
    })
  }

  /** Cancelar */
  async cancelarPayable(id: number, orgId: number, motivo: string) {
    const rec = await this.prisma.payable.findFirst({ where: { id, organizationId: orgId } })
    if (!rec) throw new NotFoundException('Conta a pagar não encontrada')
    if ((rec.status as string) === 'PAGO' || (rec.status as string) === 'CANCELADO') {
      throw new BadRequestException('Não é possível cancelar este registro')
    }
    return this.prisma.payable.update({
      where: { id },
      data: { status: PayableStatus.CANCELADO, motivoCancelamento: motivo },
    })
  }

  // ─── RECEIVABLES ─────────────────────────────────────────────────────────────

  async findAllReceivables(orgId: number, filters: Record<string, any> = {}) {
    await this.syncExpired(orgId)
    const where = this.fmtWhere(orgId, filters)
    const { page, limit, skip } = normalizePagination(filters, 20)
    const [data, total] = await Promise.all([
      this.prisma.receivable.findMany({
        where, skip, take: limit,
        orderBy: [{ status: 'asc' }, { vencimento: 'asc' }],
        include: { campaign: { select: { id: true, nome: true } } },
      }),
      this.prisma.receivable.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async createReceivable(orgId: number, data: any) {
    return this.prisma.receivable.create({
      data: { ...data, organizationId: orgId },
      include: { campaign: { select: { id: true, nome: true } } },
    })
  }

  async updateReceivable(id: number, orgId: number, data: any) {
    const rec = await this.prisma.receivable.findFirst({ where: { id, organizationId: orgId } })
    if (!rec) throw new NotFoundException('Conta a receber não encontrada')
    return this.prisma.receivable.update({ where: { id }, data })
  }

  /** Liquidar (marcar como RECEBIDO) */
  async liquidarReceivable(id: number, orgId: number, data: {
    valorRecebido: number
    formaRecebimento: string
    dataRecebimento?: string
    comprovante?: string
    observacao?: string
  }) {
    const rec = await this.prisma.receivable.findFirst({ where: { id, organizationId: orgId } })
    if (!rec) throw new NotFoundException('Conta a receber não encontrada')
    if (rec.status === ReceivableStatus.RECEBIDO) throw new BadRequestException('Conta já foi recebida')
    if (rec.status === ReceivableStatus.CANCELADO) throw new BadRequestException('Conta está cancelada')

    return this.prisma.receivable.update({
      where: { id },
      data: {
        status: ReceivableStatus.RECEBIDO,
        valorRecebido: data.valorRecebido,
        formaRecebimento: data.formaRecebimento,
        dataRecebimento: data.dataRecebimento ? new Date(data.dataRecebimento) : new Date(),
        comprovante: data.comprovante,
        observacao: data.observacao,
      },
    })
  }

  /** Estornar recebimento */
  async estornarReceivable(id: number, orgId: number, motivo: string) {
    const rec = await this.prisma.receivable.findFirst({ where: { id, organizationId: orgId } })
    if (!rec) throw new NotFoundException('Conta a receber não encontrada')
    if (rec.status !== ReceivableStatus.RECEBIDO) throw new BadRequestException('Apenas contas recebidas podem ser estornadas')

    return this.prisma.receivable.update({
      where: { id },
      data: { status: ReceivableStatus.ESTORNADO, dataEstorno: new Date(), motivoEstorno: motivo },
    })
  }

  /** Cancelar */
  async cancelarReceivable(id: number, orgId: number, motivo: string) {
    const rec = await this.prisma.receivable.findFirst({ where: { id, organizationId: orgId } })
    if (!rec) throw new NotFoundException('Conta a receber não encontrada')
    if ((rec.status as string) === 'RECEBIDO' || (rec.status as string) === 'CANCELADO') {
      throw new BadRequestException('Não é possível cancelar este registro')
    }
    return this.prisma.receivable.update({
      where: { id },
      data: { status: ReceivableStatus.CANCELADO, motivoCancelamento: motivo },
    })
  }
}
