import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { normalizePagination, toPositiveInt } from '../../common/utils/pagination'

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  /** Info pública da organização pelo slug */
  async getOrgBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug, portalAtivo: true },
      select: {
        id: true, name: true, slug: true, description: true,
        logoUrl: true, website: true, email: true, city: true, state: true,
        portalDescricao: true, portalCorPrimaria: true,
        _count: { select: { volunteers: true, campaigns: true } },
      },
    })
    if (!org) throw new NotFoundException('Organização não encontrada')
    return org
  }

  /** Campanhas públicas ativas */
  async getCampaigns(orgId: number, filters?: { destaque?: boolean; page?: number | string; limit?: number | string }) {
    const { destaque } = filters || {}
    const { page, limit, skip } = normalizePagination(filters, 12)
    const where: any = {
      organizationId: orgId,
      publicavel: true,
      status: { in: ['ACTIVE', 'COMPLETED'] },
    }
    if (destaque) where.destaque = true

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where, skip, take: limit,
        orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true, nome: true, descricao: true, objetivo: true,
          metaArrecadacao: true, arrecadado: true,
          metaVoluntarios: true, voluntariosAtivos: true,
          status: true, dataInicio: true, dataFim: true,
          imagemUrl: true, destaque: true,
          _count: { select: { donations: true } },
        },
      }),
      this.prisma.campaign.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  /** Eventos públicos agendados */
  async getEvents(orgId: number, pagination?: { page?: number | string; limit?: number | string }) {
    const { page, limit, skip } = normalizePagination(pagination, 10)
    const where: any = {
      organizationId: orgId,
      publicavel: true,
      status: { in: ['SCHEDULED', 'ONGOING'] },
      dataInicio: { gte: new Date() },
    }
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where, skip, take: limit,
        orderBy: { dataInicio: 'asc' },
        select: {
          id: true, nome: true, descricao: true, local: true,
          dataInicio: true, dataFim: true, capacidade: true, status: true,
          campaign: { select: { id: true, nome: true } },
          _count: { select: { registrations: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  /** Leaderboard público — apenas voluntários com perfil público */
  async getLeaderboard(orgId: number, limit?: number | string) {
    const take = toPositiveInt(limit, 10)
    return this.prisma.volunteer.findMany({
      where: { organizationId: orgId, status: 'ACTIVE', publicProfile: true },
      orderBy: { pontos: 'desc' },
      take,
      select: {
        id: true, nome: true, profissao: true, pontos: true,
        horasContribuidas: true, avatarUrl: true,
        badges: {
          include: { badge: { select: { nome: true, icone: true, cor: true } } },
          orderBy: { earnedAt: 'desc' },
          take: 3,
        },
      },
    })
  }

  /** Stats públicos gerais da organização */
  async getPublicStats(orgId: number) {
    const [volunteers, campaigns, donations, events, totalHoras] = await Promise.all([
      this.prisma.volunteer.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
      this.prisma.campaign.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
      this.prisma.donation.aggregate({
        where: { organizationId: orgId, tipo: 'MONETARY', status: 'CONFIRMED' },
        _sum: { valor: true },
      }),
      this.prisma.event.count({
        where: { organizationId: orgId, status: { in: ['SCHEDULED', 'ONGOING'] } },
      }),
      this.prisma.volunteer.aggregate({
        where: { organizationId: orgId, status: 'ACTIVE' },
        _sum: { horasContribuidas: true },
      }),
    ])
    return {
      voluntariosAtivos: volunteers,
      campanhasAtivas: campaigns,
      totalArrecadado: donations._sum.valor || 0,
      eventosAgendados: events,
      totalHoras: totalHoras._sum.horasContribuidas || 0,
    }
  }

  async getCampaignById(orgId: number, campaignId: number) {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organizationId: orgId,
        publicavel: true,
      },
      include: {
        events: {
          where: {
            publicavel: true,
            status: { in: ['SCHEDULED', 'ONGOING'] },
          },
          orderBy: { dataInicio: 'asc' },
          take: 4,
        },
        donations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        volunteers: {
          include: { volunteer: { select: { id: true, nome: true, profissao: true, avatarUrl: true } } },
          take: 5,
        },
      },
    })
    if (!campaign) throw new NotFoundException('Campanha não encontrada')

    return {
      ...campaign,
      featuredVolunteers: campaign.volunteers.map(v => v.volunteer),
    }
  }

  async expressInterest(orgId: number, campaignId: number, data: { nome: string; email: string; telefone?: string; profissao?: string; mensagem?: string }) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, organizationId: orgId, publicavel: true },
      select: { id: true },
    })
    if (!campaign) throw new NotFoundException('Campanha não encontrada')

    return this.prisma.campaignInterest.create({
      data: {
        campaignId,
        organizationId: orgId,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        profissao: data.profissao,
        mensagem: data.mensagem,
      },
    })
  }

  /** Volunteer intent without a specific campaign (portal generic CTA). */
  async registerVolunteerIntent(
    orgId: number,
    data: { nome: string; email: string; telefone?: string; profissao?: string; mensagem?: string; campaignId?: number },
  ) {
    let campaignId = data.campaignId
    if (!campaignId) {
      const campaign = await this.prisma.campaign.findFirst({
        where: { organizationId: orgId, publicavel: true, status: 'ACTIVE' },
        orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
        select: { id: true },
      })
      if (!campaign) throw new NotFoundException('Nenhuma campanha pública disponível')
      campaignId = campaign.id
    } else {
      const campaign = await this.prisma.campaign.findFirst({
        where: { id: campaignId, organizationId: orgId, publicavel: true },
        select: { id: true },
      })
      if (!campaign) throw new NotFoundException('Campanha não encontrada')
    }

    return this.prisma.campaignInterest.create({
      data: {
        campaignId,
        organizationId: orgId,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        profissao: data.profissao,
        mensagem: data.mensagem,
      },
    })
  }

  /**
   * Public donation intent. Creates a Donation record with status=PENDING
   * so that the organization admin can confirm/follow up offline (PIX, transfer, etc).
   */
  async registerDonationIntent(
    orgId: number,
    data: { nome: string; email: string; telefone?: string; tipo?: any; valor?: number; mensagem?: string; campaignId?: number },
  ) {
    if (data.campaignId) {
      const campaign = await this.prisma.campaign.findFirst({
        where: { id: data.campaignId, organizationId: orgId, publicavel: true },
        select: { id: true },
      })
      if (!campaign) throw new NotFoundException('Campanha não encontrada')
    }

    return this.prisma.donation.create({
      data: {
        organizationId: orgId,
        campaignId: data.campaignId ?? null,
        tipo: data.tipo ?? 'MONETARY',
        valor: data.valor ?? null,
        status: 'PENDING',
        doadorNome: data.nome,
        doadorEmail: data.email,
        doadorTelefone: data.telefone ?? null,
        mensagem: data.mensagem ?? null,
      },
      select: { id: true, status: true, tipo: true, valor: true },
    })
  }
}
