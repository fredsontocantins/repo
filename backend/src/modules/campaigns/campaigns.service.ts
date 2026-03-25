import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { CampaignStatus } from '@prisma/client'
import { normalizePagination } from '../../common/utils/pagination'
import { CampaignVolunteersService } from '../campaign-volunteers/campaign-volunteers.service'

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private campaignVolunteersService: CampaignVolunteersService,
  ) {}

  async findAll(orgId: number, filters?: { status?: CampaignStatus; search?: string; page?: number | string; limit?: number | string }) {
    const { status, search } = filters || {}
    const { page, limit, skip } = normalizePagination(filters, 20)
    const where: any = { organizationId: orgId }
    if (status) where.status = status
    if (search) where.nome = { contains: search, mode: 'insensitive' }

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { donations: true, volunteers: true, events: true } } },
      }),
      this.prisma.campaign.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number, orgId: number) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, organizationId: orgId },
      include: {
        donations: { orderBy: { createdAt: 'desc' }, take: 10 },
        volunteers: { include: { volunteer: true } },
        events: { orderBy: { dataInicio: 'asc' } },
        _count: { select: { donations: true, volunteers: true } },
      },
    })
    if (!campaign) throw new NotFoundException('Campanha não encontrada')
    return campaign
  }

  async create(orgId: number, data: any) {
    return this.prisma.campaign.create({ data: { ...data, organizationId: orgId } })
  }

  async update(id: number, orgId: number, data: any) {
    await this.findOne(id, orgId)
    return this.prisma.campaign.update({ where: { id }, data })
  }

  async remove(id: number, orgId: number) {
    await this.findOne(id, orgId)
    return this.prisma.campaign.update({ where: { id }, data: { status: CampaignStatus.CANCELLED } })
  }

  async getStats(orgId: number) {
    const [total, active, completed, totalArrecadado] = await Promise.all([
      this.prisma.campaign.count({ where: { organizationId: orgId } }),
      this.prisma.campaign.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
      this.prisma.campaign.count({ where: { organizationId: orgId, status: 'COMPLETED' } }),
      this.prisma.campaign.aggregate({ where: { organizationId: orgId }, _sum: { arrecadado: true, metaArrecadacao: true } }),
    ])
    return {
      total, active, completed,
      totalArrecadado: totalArrecadado._sum.arrecadado || 0,
      totalMeta: totalArrecadado._sum.metaArrecadacao || 0,
    }
  }

  async addVolunteer(campaignId: number, volunteerId: number, orgId: number) {
    return this.campaignVolunteersService.assignVolunteer(campaignId, volunteerId, orgId)
  }

  async listVolunteers(campaignId: number, orgId: number) {
    return this.campaignVolunteersService.listVolunteers(campaignId, orgId)
  }

  async removeVolunteer(campaignId: number, volunteerId: number, orgId: number) {
    return this.campaignVolunteersService.removeVolunteer(campaignId, volunteerId, orgId)
  }
}
