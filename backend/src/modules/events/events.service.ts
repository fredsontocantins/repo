import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { normalizePagination } from '../../common/utils/pagination'

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: number, filters?: { status?: string; page?: number | string; limit?: number | string }) {
    const activeFilters = filters ?? {}
    const statusFilter = activeFilters.status
    const { page, limit, skip } = normalizePagination(activeFilters)
    const where: any = { organizationId: orgId }
    if (statusFilter) where.status = statusFilter

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where, skip, take: limit,
        orderBy: { dataInicio: 'asc' },
        include: {
          campaign: { select: { id: true, nome: true } },
          _count: { select: { registrations: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number, orgId: number) {
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId: orgId },
      include: {
        campaign: true,
        registrations: { include: { volunteer: { select: { id: true, nome: true, email: true } } } },
      },
    })
    if (!event) throw new NotFoundException('Evento não encontrado')
    return event
  }

  async create(orgId: number, data: any) {
    return this.prisma.event.create({ data: { ...data, organizationId: orgId } })
  }

  async update(id: number, orgId: number, data: any) {
    await this.findOne(id, orgId)
    return this.prisma.event.update({ where: { id }, data })
  }

  async register(eventId: number, volunteerId: number, orgId: number) {
    await this.findOne(eventId, orgId)
    return this.prisma.eventRegistration.upsert({
      where: { eventId_volunteerId: { eventId, volunteerId } },
      update: {},
      create: { eventId, volunteerId },
    })
  }

  async listRegistrations(eventId: number, orgId: number) {
    await this.findOne(eventId, orgId)
    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: { volunteer: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async unregister(eventId: number, volunteerId: number, orgId: number) {
    await this.findOne(eventId, orgId)
    return this.prisma.eventRegistration.delete({
      where: { eventId_volunteerId: { eventId, volunteerId } },
    })
  }

  async checkin(eventId: number, volunteerId: number, orgId: number) {
    await this.findOne(eventId, orgId)
    return this.prisma.eventRegistration.update({
      where: { eventId_volunteerId: { eventId, volunteerId } },
      data: { checkedIn: true, checkinAt: new Date() },
    })
  }
}
