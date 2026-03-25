import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { VolunteerStatus } from '@prisma/client'
import { normalizePagination } from '../../common/utils/pagination'

@Injectable()
export class VolunteersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: number, filters?: { status?: VolunteerStatus; search?: string; page?: number | string; limit?: number | string }) {
    const { status, search } = filters || {}
    const { page, limit, skip } = normalizePagination(filters)

    const where: any = { organizationId: orgId }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { profissao: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.volunteer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { pontos: 'desc' },
        include: { badges: { include: { badge: true } }, _count: { select: { eventRegistrations: true } } },
      }),
      this.prisma.volunteer.count({ where }),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number, orgId: number) {
    const volunteer = await this.prisma.volunteer.findFirst({
      where: { id, organizationId: orgId },
      include: {
        badges: { include: { badge: true } },
        donations: { orderBy: { createdAt: 'desc' }, take: 5 },
        eventRegistrations: { include: { event: true }, orderBy: { createdAt: 'desc' }, take: 5 },
        campaignVolunteers: { include: { campaign: true } },
      },
    })
    if (!volunteer) throw new NotFoundException('Voluntário não encontrado')
    return volunteer
  }

  async create(orgId: number, data: any) {
    return this.prisma.volunteer.create({
      data: { ...data, organizationId: orgId },
      include: { badges: { include: { badge: true } } },
    })
  }

  async update(id: number, orgId: number, data: any) {
    await this.findOne(id, orgId)
    return this.prisma.volunteer.update({
      where: { id },
      data,
      include: { badges: { include: { badge: true } } },
    })
  }

  async remove(id: number, orgId: number) {
    await this.findOne(id, orgId)
    await this.prisma.volunteer.update({ where: { id }, data: { status: VolunteerStatus.INACTIVE } })
    return { message: 'Voluntário desativado com sucesso' }
  }

  async getStats(orgId: number) {
    const [total, active, pending, topVolunteers, byProfissao] = await Promise.all([
      this.prisma.volunteer.count({ where: { organizationId: orgId } }),
      this.prisma.volunteer.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
      this.prisma.volunteer.count({ where: { organizationId: orgId, status: 'PENDING' } }),
      this.prisma.volunteer.findMany({
        where: { organizationId: orgId, status: 'ACTIVE' },
        orderBy: { pontos: 'desc' },
        take: 5,
        select: { id: true, nome: true, pontos: true, horasContribuidas: true, avatarUrl: true },
      }),
      this.prisma.volunteer.groupBy({
        by: ['profissao'],
        where: { organizationId: orgId, profissao: { not: null } },
        _count: true,
        orderBy: { _count: { profissao: 'desc' } },
        take: 8,
      }),
    ])

    const totalHoras = await this.prisma.volunteer.aggregate({
      where: { organizationId: orgId },
      _sum: { horasContribuidas: true },
    })

    return {
      total,
      active,
      pending,
      inactive: total - active - pending,
      totalHoras: totalHoras._sum.horasContribuidas || 0,
      topVolunteers,
      byProfissao: byProfissao.map(g => ({ profissao: g.profissao || 'Não informado', count: g._count })),
    }
  }

  async addPoints(id: number, orgId: number, points: number) {
    const volunteer = await this.findOne(id, orgId)
    return this.prisma.volunteer.update({
      where: { id },
      data: { pontos: volunteer.pontos + points },
    })
  }
}
