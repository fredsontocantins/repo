import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: { select: { volunteers: true, campaigns: true, donations: true, events: true } },
      },
    })
  }

  async update(id: number, data: any) {
    return this.prisma.organization.update({ where: { id }, data })
  }

  async getDashboardStats(orgId: number) {
    const [volunteers, campaigns, donations, events] = await Promise.all([
      this.prisma.volunteer.aggregate({ where: { organizationId: orgId }, _count: true, _sum: { horasContribuidas: true } }),
      this.prisma.campaign.aggregate({ where: { organizationId: orgId }, _count: true, _sum: { arrecadado: true } }),
      this.prisma.donation.aggregate({ where: { organizationId: orgId, tipo: 'MONETARY' }, _count: true, _sum: { valor: true } }),
      this.prisma.event.count({ where: { organizationId: orgId, status: 'SCHEDULED' } }),
    ])

    const activeVolunteers = await this.prisma.volunteer.count({ where: { organizationId: orgId, status: 'ACTIVE' } })
    const activeCampaigns = await this.prisma.campaign.count({ where: { organizationId: orgId, status: 'ACTIVE' } })

    // Crescimento últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const newVolunteers = await this.prisma.volunteer.count({
      where: { organizationId: orgId, createdAt: { gte: thirtyDaysAgo } },
    })
    const newDonations = await this.prisma.donation.aggregate({
      where: { organizationId: orgId, tipo: 'MONETARY', createdAt: { gte: thirtyDaysAgo } },
      _sum: { valor: true },
    })

    return {
      volunteers: { total: volunteers._count, active: activeVolunteers, totalHoras: volunteers._sum.horasContribuidas || 0, newThisMonth: newVolunteers },
      campaigns: { total: campaigns._count, active: activeCampaigns, totalArrecadado: campaigns._sum.arrecadado || 0 },
      donations: { total: donations._count, totalMonetario: donations._sum.valor || 0, newThisMonth: newDonations._sum.valor || 0 },
      events: { upcoming: events },
    }
  }
}
