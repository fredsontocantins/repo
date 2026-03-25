import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { toPositiveInt } from '../../common/utils/pagination'

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(orgId: number, limit?: number | string) {
    const take = toPositiveInt(limit, 10)
    return this.prisma.volunteer.findMany({
      where: { organizationId: orgId, status: 'ACTIVE' },
      orderBy: { pontos: 'desc' },
      take,
      select: {
        id: true, nome: true, pontos: true, horasContribuidas: true, avatarUrl: true, profissao: true,
        badges: { include: { badge: true }, orderBy: { earnedAt: 'desc' }, take: 3 },
        _count: { select: { eventRegistrations: true } },
      },
    })
  }

  async getBadges() {
    return this.prisma.badge.findMany({ orderBy: { pontosReq: 'asc' } })
  }

  async getVolunteerBadges(volunteerId: number) {
    return this.prisma.volunteerBadge.findMany({
      where: { volunteerId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    })
  }

  async awardBadge(volunteerId: number, badgeId: number) {
    return this.prisma.volunteerBadge.upsert({
      where: { volunteerId_badgeId: { volunteerId, badgeId } },
      update: {},
      create: { volunteerId, badgeId },
      include: { badge: true },
    })
  }

  async checkAndAwardBadges(volunteerId: number) {
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: { badges: true },
    })
    if (!volunteer) return []

    const allBadges = await this.prisma.badge.findMany()
    const earnedBadgeIds = volunteer.badges.map(b => b.badgeId)
    const newBadges = []

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue
      const qualifies = (badge.pontosReq > 0 && volunteer.pontos >= badge.pontosReq) ||
                        (badge.horasReq > 0 && volunteer.horasContribuidas >= badge.horasReq)
      if (qualifies) {
        const awarded = await this.awardBadge(volunteerId, badge.id)
        newBadges.push(awarded)
      }
    }
    return newBadges
  }

  async createBadge(data: any) {
    return this.prisma.badge.create({ data })
  }

  async getStats(orgId: number) {
    const [totalPoints, totalBadgesAwarded, topBadges] = await Promise.all([
      this.prisma.volunteer.aggregate({ where: { organizationId: orgId }, _sum: { pontos: true } }),
      this.prisma.volunteerBadge.count({ where: { volunteer: { organizationId: orgId } } }),
      this.prisma.volunteerBadge.groupBy({
        by: ['badgeId'],
        where: { volunteer: { organizationId: orgId } },
        _count: true,
        orderBy: { _count: { badgeId: 'desc' } },
        take: 5,
      }),
    ])

    const topBadgesWithDetails = await Promise.all(
      topBadges.map(async (b) => ({
        badge: await this.prisma.badge.findUnique({ where: { id: b.badgeId } }),
        count: b._count,
      }))
    )

    return {
      totalPoints: totalPoints._sum.pontos || 0,
      totalBadgesAwarded,
      topBadges: topBadgesWithDetails,
    }
  }
}
