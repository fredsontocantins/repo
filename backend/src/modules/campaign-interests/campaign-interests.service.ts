import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CampaignInterestStatus, VolunteerStatus } from '@prisma/client'
import { PrismaService } from '../../prisma.service'
import { normalizePagination } from '../../common/utils/pagination'
import { CampaignVolunteersService } from '../campaign-volunteers/campaign-volunteers.service'

@Injectable()
export class CampaignInterestsService {
  constructor(
    private prisma: PrismaService,
    private campaignVolunteersService: CampaignVolunteersService,
  ) {}

  private buildWhere(orgId: number, filters: Record<string, any> = {}) {
    const where: any = { organizationId: orgId }
    if (filters.status) where.status = filters.status
    if (filters.campaignId) where.campaignId = Number(filters.campaignId)
    return where
  }

  async list(orgId: number, filters: { page?: number | string; limit?: number | string; status?: string; campaignId?: number | string } = {}) {
    const { page, limit, skip } = normalizePagination(filters, 12)
    const where = this.buildWhere(orgId, filters)
    const [data, total] = await Promise.all([
      this.prisma.campaignInterest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, nome: true } },
        },
      }),
      this.prisma.campaignInterest.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async getById(orgId: number, id: number) {
    const interest = await this.prisma.campaignInterest.findFirst({
      where: { id, organizationId: orgId },
      include: { campaign: true },
    })
    if (!interest) throw new NotFoundException('Intenção não encontrada')
    return interest
  }

  async approve(orgId: number, id: number) {
    const interest = await this.getById(orgId, id)
    if (interest.status !== CampaignInterestStatus.PENDING) throw new BadRequestException('Intenção já processada')

    const existing = interest.email
      ? await this.prisma.volunteer.findFirst({ where: { email: interest.email, organizationId: orgId } })
      : null
    const volunteer = existing
      ? await this.prisma.volunteer.update({
          where: { id: existing.id },
          data: {
            nome: interest.nome,
            telefone: interest.telefone,
            profissao: interest.profissao,
            bio: interest.mensagem || undefined,
            status: VolunteerStatus.ACTIVE,
            publicProfile: true,
          },
        })
      : await this.prisma.volunteer.create({
          data: {
            nome: interest.nome,
            email: interest.email,
            telefone: interest.telefone,
            profissao: interest.profissao,
            bio: interest.mensagem || undefined,
            habilidades: [],
            organizationId: orgId,
            status: VolunteerStatus.ACTIVE,
            publicProfile: true,
          },
        })

    await this.campaignVolunteersService.assignVolunteer(interest.campaignId, volunteer.id, orgId)

    const updated = await this.prisma.campaignInterest.update({
      where: { id },
      data: { status: CampaignInterestStatus.APPROVED },
    })

    return { interest: updated, volunteer }
  }

  async reject(orgId: number, id: number, motivo?: string) {
    const interest = await this.getById(orgId, id)
    if (interest.status !== CampaignInterestStatus.PENDING) throw new BadRequestException('Intenção já processada')

    const updated = await this.prisma.campaignInterest.update({
      where: { id },
      data: { status: CampaignInterestStatus.REJECTED, mensagem: motivo || interest.mensagem },
    })

    return updated
  }
}
