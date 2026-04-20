import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

type DateRange = { from?: Date; to?: Date }

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: number) {
    return this.prisma.report.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async generate(orgId: number, tipo: string, filtros: any, geradoPor: string) {
    const range = this.parseRange(filtros)
    const dados = await this.buildByTipo(orgId, tipo, filtros, range)
    return this.prisma.report.create({
      data: {
        nome: `Relatório ${this.getTipoLabel(tipo)} - ${new Date().toLocaleDateString('pt-BR')}`,
        tipo,
        filtros,
        dados,
        organizationId: orgId,
        geradoPor,
      },
    })
  }

  /**
   * Preview — returns the report data without persisting. Used by the
   * inline management dashboard on /reports.
   */
  async preview(orgId: number, tipo: string, filtros: any) {
    const range = this.parseRange(filtros)
    return this.buildByTipo(orgId, tipo, filtros, range)
  }

  private parseRange(filtros: any): DateRange {
    const range: DateRange = {}
    if (filtros?.dataInicio) range.from = new Date(filtros.dataInicio)
    if (filtros?.dataFim) range.to = new Date(filtros.dataFim)
    return range
  }

  private buildByTipo(orgId: number, tipo: string, filtros: any, range: DateRange) {
    switch (tipo) {
      case 'volunteers': return this.buildVolunteersReport(orgId, filtros, range)
      case 'campaigns': return this.buildCampaignsReport(orgId, filtros, range)
      case 'donations': return this.buildDonationsReport(orgId, filtros, range)
      case 'events': return this.buildEventsReport(orgId, range)
      case 'financial': return this.buildFinancialReport(orgId, range)
      case 'engagement': return this.buildEngagementReport(orgId, range)
      case 'conversion': return this.buildConversionReport(orgId, range)
      case 'general':
      default:
        return this.buildGeneralReport(orgId, range)
    }
  }

  private getTipoLabel(tipo: string) {
    const map: Record<string, string> = {
      volunteers: 'de Voluntários',
      campaigns: 'de Campanhas',
      donations: 'de Doações',
      events: 'de Eventos',
      financial: 'Financeiro',
      engagement: 'de Engajamento',
      conversion: 'de Conversão',
      general: 'Gerencial',
    }
    return map[tipo] || tipo
  }

  // ─── General (Painel Gerencial) ────────────────────────────────
  private async buildGeneralReport(orgId: number, range: DateRange) {
    const periodFilter = this.dateFilter('createdAt', range)

    const [
      volAgg, volByStatus, topVolunteers, newVolunteersPeriod,
      campAgg, campByStatus, topCampaigns,
      donAgg, donByType, donByStatus,
      eventAgg, eventsUpcoming,
      interestsPending, volunteersPending,
      monthlyDonations, monthlyVolunteers,
    ] = await Promise.all([
      this.prisma.volunteer.aggregate({
        where: { organizationId: orgId },
        _count: true,
        _sum: { horasContribuidas: true, pontos: true },
      }),
      this.prisma.volunteer.groupBy({
        by: ['status'],
        where: { organizationId: orgId },
        _count: true,
      }),
      this.prisma.volunteer.findMany({
        where: { organizationId: orgId, status: 'ACTIVE' },
        select: { id: true, nome: true, pontos: true, horasContribuidas: true, profissao: true },
        orderBy: [{ pontos: 'desc' }, { horasContribuidas: 'desc' }],
        take: 10,
      }),
      this.prisma.volunteer.count({
        where: { organizationId: orgId, ...periodFilter },
      }),
      this.prisma.campaign.aggregate({
        where: { organizationId: orgId },
        _count: true,
        _sum: { arrecadado: true, metaArrecadacao: true },
      }),
      this.prisma.campaign.groupBy({
        by: ['status'],
        where: { organizationId: orgId },
        _count: true,
      }),
      this.prisma.campaign.findMany({
        where: { organizationId: orgId },
        select: {
          id: true, nome: true, status: true, arrecadado: true,
          metaArrecadacao: true, voluntariosAtivos: true, dataFim: true,
          _count: { select: { donations: true } },
        },
        orderBy: { arrecadado: 'desc' },
        take: 10,
      }),
      this.prisma.donation.aggregate({
        where: { organizationId: orgId, status: 'CONFIRMED', ...this.dateFilter('createdAt', range) },
        _count: true,
        _sum: { valor: true },
      }),
      this.prisma.donation.groupBy({
        by: ['tipo'],
        where: { organizationId: orgId, ...this.dateFilter('createdAt', range) },
        _count: true,
        _sum: { valor: true },
      }),
      this.prisma.donation.groupBy({
        by: ['status'],
        where: { organizationId: orgId, ...this.dateFilter('createdAt', range) },
        _count: true,
      }),
      this.prisma.event.aggregate({
        where: { organizationId: orgId },
        _count: true,
      }),
      this.prisma.event.findMany({
        where: { organizationId: orgId, dataInicio: { gte: new Date() } },
        select: {
          id: true, nome: true, dataInicio: true, local: true, capacidade: true,
          _count: { select: { registrations: true } },
        },
        orderBy: { dataInicio: 'asc' },
        take: 5,
      }),
      this.prisma.campaignInterest.count({
        where: { organizationId: orgId, status: 'PENDING' },
      }),
      this.prisma.volunteer.count({
        where: { organizationId: orgId, status: 'PENDING' },
      }),
      this.monthlySeries(orgId, 'donation', range),
      this.monthlySeries(orgId, 'volunteer', range),
    ])

    // Campanhas em risco (perto de fim sem bater meta) ou próximas do 100%
    const now = new Date()
    const campanhasAtencao = topCampaigns
      .filter(c => c.status === 'ACTIVE')
      .map(c => {
        const arrec = Number(c.arrecadado || 0)
        const meta = Number(c.metaArrecadacao || 0)
        const pct = meta > 0 ? Math.round((arrec / meta) * 100) : 0
        const diasRestantes = c.dataFim ? Math.ceil((c.dataFim.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
        return { id: c.id, nome: c.nome, pct, arrec, meta, diasRestantes }
      })
      .filter(c => c.pct >= 80 || (c.diasRestantes !== null && c.diasRestantes <= 7 && c.pct < 100))

    return {
      period: { from: range.from || null, to: range.to || null },
      kpis: {
        totalArrecadado: donAgg._sum.valor || 0,
        totalDoacoesConfirmadas: donAgg._count || 0,
        voluntariosAtivos: volByStatus.find(s => s.status === 'ACTIVE')?._count || 0,
        voluntariosPendentes: volunteersPending,
        novosVoluntariosPeriodo: newVolunteersPeriod,
        horasContribuidas: Number(volAgg._sum.horasContribuidas || 0),
        totalCampanhas: campAgg._count || 0,
        totalEventos: eventAgg._count || 0,
        interessesPendentes: interestsPending,
      },
      breakdowns: {
        volunteersByStatus: this.normalizeBy(volByStatus, 'status'),
        campaignsByStatus: this.normalizeBy(campByStatus, 'status'),
        donationsByType: donByType.map(d => ({ key: d.tipo, count: d._count, total: d._sum.valor || 0 })),
        donationsByStatus: this.normalizeBy(donByStatus, 'status'),
      },
      timeseries: {
        donations: monthlyDonations,
        volunteers: monthlyVolunteers,
      },
      rankings: {
        topVolunteers,
        topCampaigns,
      },
      upcomingEvents: eventsUpcoming.map(e => ({
        ...e,
        ocupacaoPct: e.capacidade ? Math.round((e._count.registrations / e.capacidade) * 100) : null,
      })),
      attention: {
        campanhas: campanhasAtencao,
        interessesPendentes: interestsPending,
        voluntariosPendentes: volunteersPending,
      },
    }
  }

  // ─── Volunteers ────────────────────────────────────────────────
  private async buildVolunteersReport(orgId: number, filtros: any, range: DateRange) {
    const where: any = { organizationId: orgId, ...this.dateFilter('createdAt', range) }
    if (filtros?.status) where.status = filtros.status

    const [volunteers, byStatus, byProfissao, agg] = await Promise.all([
      this.prisma.volunteer.findMany({
        where,
        select: {
          id: true, nome: true, email: true, telefone: true, profissao: true, cidade: true,
          status: true, pontos: true, horasContribuidas: true, createdAt: true,
        },
        orderBy: { pontos: 'desc' },
      }),
      this.prisma.volunteer.groupBy({ by: ['status'], where: { organizationId: orgId }, _count: true }),
      this.prisma.volunteer.groupBy({
        by: ['profissao'],
        where: { organizationId: orgId },
        _count: true,
        orderBy: { _count: { profissao: 'desc' } },
        take: 10,
      }),
      this.prisma.volunteer.aggregate({
        where: { organizationId: orgId },
        _sum: { horasContribuidas: true, pontos: true },
      }),
    ])

    return {
      period: { from: range.from || null, to: range.to || null },
      volunteers,
      byStatus: this.normalizeBy(byStatus, 'status'),
      byProfissao: byProfissao.map(p => ({ key: p.profissao || 'Sem profissão', count: p._count })),
      totals: {
        total: volunteers.length,
        totalHoras: Number(agg._sum.horasContribuidas || 0),
        totalPontos: agg._sum.pontos || 0,
      },
    }
  }

  // ─── Campaigns ─────────────────────────────────────────────────
  private async buildCampaignsReport(orgId: number, filtros: any, _range: DateRange) {
    const where: any = { organizationId: orgId }
    if (filtros?.status) where.status = filtros.status

    const [campaigns, totals] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: { _count: { select: { donations: true, volunteers: true, events: true } } },
        orderBy: { arrecadado: 'desc' },
      }),
      this.prisma.campaign.aggregate({
        where: { organizationId: orgId },
        _sum: { arrecadado: true, metaArrecadacao: true },
        _count: true,
      }),
    ])

    return {
      campaigns: campaigns.map(c => ({
        ...c,
        progressoPct: c.metaArrecadacao ? Math.min(100, Math.round((Number(c.arrecadado) / Number(c.metaArrecadacao)) * 100)) : null,
      })),
      totals: {
        totalArrecadado: totals._sum.arrecadado || 0,
        totalMeta: totals._sum.metaArrecadacao || 0,
        total: totals._count,
      },
    }
  }

  // ─── Donations ─────────────────────────────────────────────────
  private async buildDonationsReport(orgId: number, filtros: any, range: DateRange) {
    const where: any = { organizationId: orgId, ...this.dateFilter('createdAt', range) }
    if (filtros?.tipo) where.tipo = filtros.tipo

    const [donations, byTipo, byStatus, agg, topDoadores] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        include: { campaign: { select: { id: true, nome: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.donation.groupBy({
        by: ['tipo'],
        where,
        _count: true,
        _sum: { valor: true },
      }),
      this.prisma.donation.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.donation.aggregate({
        where: { ...where, tipo: 'MONETARY', status: 'CONFIRMED' },
        _sum: { valor: true },
        _count: true,
      }),
      this.prisma.donation.groupBy({
        by: ['doadorNome'],
        where: { ...where, doadorNome: { not: null } },
        _count: true,
        _sum: { valor: true },
        orderBy: { _sum: { valor: 'desc' } },
        take: 10,
      }),
    ])

    return {
      period: { from: range.from || null, to: range.to || null },
      donations,
      byTipo: byTipo.map(d => ({ key: d.tipo, count: d._count, total: d._sum.valor || 0 })),
      byStatus: this.normalizeBy(byStatus, 'status'),
      totals: {
        totalMonetario: agg._sum.valor || 0,
        totalConfirmadas: agg._count || 0,
      },
      topDoadores: topDoadores.map(d => ({ nome: d.doadorNome, count: d._count, total: d._sum.valor || 0 })),
    }
  }

  // ─── Events ────────────────────────────────────────────────────
  private async buildEventsReport(orgId: number, range: DateRange) {
    const where: any = { organizationId: orgId, ...this.dateFilter('dataInicio', range) }
    const [events, totalRegistrations, checkedInAgg] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          _count: { select: { registrations: true } },
          campaign: { select: { id: true, nome: true } },
        },
        orderBy: { dataInicio: 'desc' },
      }),
      this.prisma.eventRegistration.count({ where: { event: { organizationId: orgId } } }),
      this.prisma.eventRegistration.count({ where: { event: { organizationId: orgId }, checkedIn: true } }),
    ])

    const now = new Date()
    return {
      period: { from: range.from || null, to: range.to || null },
      events: events.map(e => ({
        ...e,
        ocupacaoPct: e.capacidade ? Math.round((e._count.registrations / e.capacidade) * 100) : null,
        isFuture: e.dataInicio > now,
      })),
      totals: {
        total: events.length,
        totalInscricoes: totalRegistrations,
        totalCheckIn: checkedInAgg,
        taxaCheckInPct: totalRegistrations > 0 ? Math.round((checkedInAgg / totalRegistrations) * 100) : 0,
      },
    }
  }

  // ─── Financial ─────────────────────────────────────────────────
  private async buildFinancialReport(orgId: number, range: DateRange) {
    const payableWhere: any = { organizationId: orgId, ...this.dateFilter('vencimento', range) }
    const receivableWhere: any = { organizationId: orgId, ...this.dateFilter('vencimento', range) }

    const [
      payables, receivables,
      payByStatus, payByCategory,
      recByStatus, recByCategory,
    ] = await Promise.all([
      this.prisma.payable.findMany({ where: payableWhere, orderBy: { vencimento: 'asc' } }),
      this.prisma.receivable.findMany({
        where: receivableWhere,
        orderBy: { vencimento: 'asc' },
        include: { campaign: { select: { id: true, nome: true } } },
      }),
      this.prisma.payable.groupBy({ by: ['status'], where: payableWhere, _count: true, _sum: { valor: true } }),
      this.prisma.payable.groupBy({ by: ['categoria'], where: payableWhere, _count: true, _sum: { valor: true } }),
      this.prisma.receivable.groupBy({ by: ['status'], where: receivableWhere, _count: true, _sum: { valor: true } }),
      this.prisma.receivable.groupBy({ by: ['categoria'], where: receivableWhere, _count: true, _sum: { valor: true } }),
    ])

    const now = new Date()
    const aging = (items: Array<{ vencimento: Date; valor: number; status: string }>, pendingStatus: string) => {
      const buckets = { vencido: 0, proximos7d: 0, proximos15d: 0, proximos30d: 0, acima30d: 0 }
      for (const it of items) {
        if (it.status !== pendingStatus && it.status !== 'VENCIDO') continue
        const days = Math.ceil((it.vencimento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (days < 0) buckets.vencido += it.valor
        else if (days <= 7) buckets.proximos7d += it.valor
        else if (days <= 15) buckets.proximos15d += it.valor
        else if (days <= 30) buckets.proximos30d += it.valor
        else buckets.acima30d += it.valor
      }
      return buckets
    }

    const totalPagar = payByStatus.filter(s => s.status === 'A_PAGAR' || s.status === 'VENCIDO')
      .reduce((acc, s) => acc + Number(s._sum.valor || 0), 0)
    const totalReceber = recByStatus.filter(s => s.status === 'A_RECEBER' || s.status === 'VENCIDO')
      .reduce((acc, s) => acc + Number(s._sum.valor || 0), 0)
    const totalPago = Number(payByStatus.find(s => s.status === 'PAGO')?._sum.valor || 0)
    const totalRecebido = Number(recByStatus.find(s => s.status === 'RECEBIDO')?._sum.valor || 0)

    return {
      period: { from: range.from || null, to: range.to || null },
      kpis: {
        totalPagar,
        totalReceber,
        totalPago,
        totalRecebido,
        saldoRealizado: totalRecebido - totalPago,
        saldoProjetado: totalReceber - totalPagar,
      },
      payables,
      receivables,
      breakdowns: {
        payablesByStatus: this.normalizeBy(payByStatus, 'status'),
        payablesByCategory: payByCategory.map(p => ({ key: p.categoria, count: p._count, total: p._sum.valor || 0 })),
        receivablesByStatus: this.normalizeBy(recByStatus, 'status'),
        receivablesByCategory: recByCategory.map(r => ({ key: r.categoria, count: r._count, total: r._sum.valor || 0 })),
      },
      aging: {
        pagar: aging(payables as any, 'A_PAGAR'),
        receber: aging(receivables as any, 'A_RECEBER'),
      },
    }
  }

  // ─── Engagement ────────────────────────────────────────────────
  private async buildEngagementReport(orgId: number, range: DateRange) {
    const [volunteers, certs, campVolunteers, eventRegs] = await Promise.all([
      this.prisma.volunteer.findMany({
        where: { organizationId: orgId },
        select: {
          id: true, nome: true, status: true, pontos: true, horasContribuidas: true,
          createdAt: true,
          _count: { select: { eventRegistrations: true, campaignVolunteers: true, donations: true } },
        },
      }),
      this.prisma.certificate.count({ where: { organizationId: orgId, ...this.dateFilter('createdAt', range) } }),
      this.prisma.campaignVolunteer.count({ where: { campaign: { organizationId: orgId } } }),
      this.prisma.eventRegistration.count({ where: { event: { organizationId: orgId } } }),
    ])

    const now = new Date()
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const active = volunteers.filter(v => v.status === 'ACTIVE')
    const pending = volunteers.filter(v => v.status === 'PENDING')
    const inactive = volunteers.filter(v => v.status === 'INACTIVE')
    const totalHoras = volunteers.reduce((s, v) => s + Number(v.horasContribuidas || 0), 0)

    // voluntários sem atividade recente: sem check-in, sem doação, sem certificado nos últimos 60d
    // (aproximação: usamos createdAt < 60d + _count de eventRegistrations = 0)
    const inativosPossiveis = active.filter(v =>
      v.createdAt < sixtyDaysAgo && (v._count.eventRegistrations + v._count.campaignVolunteers + v._count.donations) === 0,
    )

    return {
      period: { from: range.from || null, to: range.to || null },
      kpis: {
        totalVoluntarios: volunteers.length,
        ativos: active.length,
        pendentes: pending.length,
        inativos: inactive.length,
        taxaAtivacaoPct: volunteers.length > 0 ? Math.round((active.length / volunteers.length) * 100) : 0,
        horasMedia: active.length > 0 ? +(totalHoras / active.length).toFixed(1) : 0,
        totalCertificados: certs,
        totalAlocacoesCampanha: campVolunteers,
        totalInscricoesEvento: eventRegs,
      },
      topEngajados: [...active]
        .sort((a, b) => (b.pontos - a.pontos) || (Number(b.horasContribuidas) - Number(a.horasContribuidas)))
        .slice(0, 15)
        .map(v => ({
          id: v.id, nome: v.nome, pontos: v.pontos, horas: v.horasContribuidas,
          eventos: v._count.eventRegistrations,
          campanhas: v._count.campaignVolunteers,
          doacoes: v._count.donations,
        })),
      inativosPossiveis: inativosPossiveis.map(v => ({
        id: v.id, nome: v.nome, desde: v.createdAt, status: v.status,
      })),
    }
  }

  // ─── Conversion (Portal Público → Interno) ─────────────────────
  private async buildConversionReport(orgId: number, range: DateRange) {
    const where = { organizationId: orgId, ...this.dateFilter('createdAt', range) }
    const [interests, intByStatus, donationsPending, donationsConfirmed, volunteersFromPortal] = await Promise.all([
      this.prisma.campaignInterest.findMany({
        where,
        include: { campaign: { select: { id: true, nome: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campaignInterest.groupBy({ by: ['status'], where, _count: true }),
      this.prisma.donation.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.donation.count({ where: { ...where, status: 'CONFIRMED' } }),
      // Voluntários ativos que provavelmente vieram de interesse aprovado (createdAt recente e sem userId)
      this.prisma.volunteer.count({ where: { organizationId: orgId, userId: null, ...this.dateFilter('createdAt', range) } }),
    ])

    const total = interests.length
    const approved = intByStatus.find(s => s.status === 'APPROVED')?._count || 0
    const pending = intByStatus.find(s => s.status === 'PENDING')?._count || 0
    const rejected = intByStatus.find(s => s.status === 'REJECTED')?._count || 0

    return {
      period: { from: range.from || null, to: range.to || null },
      funnel: {
        interessesRecebidos: total,
        aprovados: approved,
        pendentes: pending,
        rejeitados: rejected,
        taxaAprovacaoPct: total > 0 ? Math.round((approved / total) * 100) : 0,
        voluntariosConvertidos: volunteersFromPortal,
      },
      doacoesPortal: {
        pendentes: donationsPending,
        confirmadas: donationsConfirmed,
        taxaConfirmacaoPct: (donationsPending + donationsConfirmed) > 0
          ? Math.round((donationsConfirmed / (donationsPending + donationsConfirmed)) * 100)
          : 0,
      },
      interests,
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────
  private dateFilter(field: string, range: DateRange) {
    if (!range.from && !range.to) return {}
    const cond: any = {}
    if (range.from) cond.gte = range.from
    if (range.to) cond.lte = range.to
    return { [field]: cond }
  }

  private normalizeBy(rows: Array<any>, key: string) {
    return rows.map(r => ({ key: r[key], count: r._count }))
  }

  private async monthlySeries(orgId: number, kind: 'donation' | 'volunteer', range: DateRange) {
    // Default: last 12 months ending today
    const end = range.to || new Date()
    const start = range.from || new Date(end.getFullYear(), end.getMonth() - 11, 1)

    if (kind === 'donation') {
      const rows = await this.prisma.donation.findMany({
        where: { organizationId: orgId, createdAt: { gte: start, lte: end }, status: 'CONFIRMED' },
        select: { createdAt: true, valor: true, tipo: true },
      })
      return this.bucketMonthly(rows, start, end, (r: any) => ({
        valor: r.tipo === 'MONETARY' ? Number(r.valor || 0) : 0,
      }))
    } else {
      const rows = await this.prisma.volunteer.findMany({
        where: { organizationId: orgId, createdAt: { gte: start, lte: end } },
        select: { createdAt: true, status: true },
      })
      return this.bucketMonthly(rows, start, end, () => ({ count: 1 }))
    }
  }

  private bucketMonthly<T extends { createdAt: Date }>(
    rows: T[],
    start: Date,
    end: Date,
    mapFn: (r: T) => Record<string, number>,
  ) {
    const buckets: Record<string, Record<string, number>> = {}
    const cur = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
    while (cur <= endMonth) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`
      buckets[key] = {}
      cur.setMonth(cur.getMonth() + 1)
    }
    for (const r of rows) {
      const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (!buckets[key]) buckets[key] = {}
      const mapped = mapFn(r)
      for (const [k, v] of Object.entries(mapped)) {
        buckets[key][k] = (buckets[key][k] || 0) + v
      }
    }
    return Object.entries(buckets).map(([month, values]) => ({ month, ...values }))
  }
}
