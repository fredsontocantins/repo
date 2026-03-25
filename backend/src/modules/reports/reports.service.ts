import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

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
    let dados: any = {}

    if (tipo === 'volunteers') dados = await this.buildVolunteersReport(orgId, filtros)
    else if (tipo === 'campaigns') dados = await this.buildCampaignsReport(orgId, filtros)
    else if (tipo === 'donations') dados = await this.buildDonationsReport(orgId, filtros)
    else if (tipo === 'events') dados = await this.buildEventsReport(orgId, filtros)
    else if (tipo === 'general') dados = await this.buildGeneralReport(orgId)

    const report = await this.prisma.report.create({
      data: {
        nome: `Relatório ${this.getTipoLabel(tipo)} - ${new Date().toLocaleDateString('pt-BR')}`,
        tipo,
        filtros,
        dados,
        organizationId: orgId,
        geradoPor,
      },
    })
    return report
  }

  private getTipoLabel(tipo: string) {
    const map: Record<string, string> = {
      volunteers: 'de Voluntários',
      campaigns: 'de Campanhas',
      donations: 'de Doações',
      events: 'de Eventos',
      general: 'Geral',
    }
    return map[tipo] || tipo
  }

  private async buildVolunteersReport(orgId: number, filtros: any) {
    const where: any = { organizationId: orgId }
    if (filtros?.status) where.status = filtros.status
    if (filtros?.dataInicio) where.createdAt = { gte: new Date(filtros.dataInicio) }

    const [volunteers, byStatus, byProfissao, totalHoras] = await Promise.all([
      this.prisma.volunteer.findMany({
        where,
        select: { id: true, nome: true, email: true, profissao: true, status: true, pontos: true, horasContribuidas: true, createdAt: true },
        orderBy: { pontos: 'desc' },
      }),
      this.prisma.volunteer.groupBy({ by: ['status'], where: { organizationId: orgId }, _count: true }),
      this.prisma.volunteer.groupBy({ by: ['profissao'], where: { organizationId: orgId }, _count: true, orderBy: { _count: { profissao: 'desc' } }, take: 10 }),
      this.prisma.volunteer.aggregate({ where: { organizationId: orgId }, _sum: { horasContribuidas: true, pontos: true } }),
    ])

    return { volunteers, byStatus, byProfissao, totalHoras: totalHoras._sum.horasContribuidas, totalPontos: totalHoras._sum.pontos }
  }

  private async buildCampaignsReport(orgId: number, filtros: any) {
    const where: any = { organizationId: orgId }
    if (filtros?.status) where.status = filtros.status

    const [campaigns, totals] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: { _count: { select: { donations: true, volunteers: true } } },
        orderBy: { arrecadado: 'desc' },
      }),
      this.prisma.campaign.aggregate({
        where: { organizationId: orgId },
        _sum: { arrecadado: true, metaArrecadacao: true },
        _count: true,
      }),
    ])

    return { campaigns, totalArrecadado: totals._sum.arrecadado, totalMeta: totals._sum.metaArrecadacao, total: totals._count }
  }

  private async buildDonationsReport(orgId: number, filtros: any) {
    const where: any = { organizationId: orgId }
    if (filtros?.tipo) where.tipo = filtros.tipo
    if (filtros?.dataInicio) where.createdAt = { gte: new Date(filtros.dataInicio) }

    const [donations, byTipo, totalMonetario] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        include: { campaign: { select: { nome: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.donation.groupBy({ by: ['tipo'], where: { organizationId: orgId }, _count: true, _sum: { valor: true } }),
      this.prisma.donation.aggregate({ where: { organizationId: orgId, tipo: 'MONETARY' }, _sum: { valor: true } }),
    ])

    return { donations, byTipo, totalMonetario: totalMonetario._sum.valor }
  }

  private async buildEventsReport(orgId: number, _filtros: any) {
    const [events, totalRegistrations] = await Promise.all([
      this.prisma.event.findMany({
        where: { organizationId: orgId },
        include: { _count: { select: { registrations: true } } },
        orderBy: { dataInicio: 'desc' },
      }),
      this.prisma.eventRegistration.count({ where: { event: { organizationId: orgId } } }),
    ])
    return { events, totalRegistrations }
  }

  private async buildGeneralReport(orgId: number) {
    const [vols, camps, dons, events] = await Promise.all([
      this.prisma.volunteer.aggregate({ where: { organizationId: orgId }, _count: true, _sum: { horasContribuidas: true, pontos: true } }),
      this.prisma.campaign.aggregate({ where: { organizationId: orgId }, _count: true, _sum: { arrecadado: true } }),
      this.prisma.donation.aggregate({ where: { organizationId: orgId, tipo: 'MONETARY' }, _count: true, _sum: { valor: true } }),
      this.prisma.event.count({ where: { organizationId: orgId } }),
    ])
    return {
      volunteers: { total: vols._count, totalHoras: vols._sum.horasContribuidas, totalPontos: vols._sum.pontos },
      campaigns: { total: camps._count, totalArrecadado: camps._sum.arrecadado },
      donations: { total: dons._count, totalMonetario: dons._sum.valor },
      events: { total: events },
    }
  }
}
