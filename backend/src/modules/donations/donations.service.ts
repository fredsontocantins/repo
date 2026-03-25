import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { DonationType, DonationStatus } from '@prisma/client'

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: number, filters?: { tipo?: DonationType; status?: DonationStatus; campaignId?: number; page?: number; limit?: number }) {
    const { tipo, status, campaignId, page = 1, limit = 20 } = filters || {}
    const skip = (page - 1) * limit
    const where: any = { organizationId: orgId }
    if (tipo) where.tipo = tipo
    if (status) where.status = status
    if (campaignId) where.campaignId = campaignId

    const [data, total] = await Promise.all([
      this.prisma.donation.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { campaign: { select: { id: true, nome: true } }, volunteer: { select: { id: true, nome: true } } },
      }),
      this.prisma.donation.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number, orgId: number) {
    const donation = await this.prisma.donation.findFirst({
      where: { id, organizationId: orgId },
      include: { campaign: true, volunteer: true },
    })
    if (!donation) throw new NotFoundException('Doação não encontrada')
    return donation
  }

  async create(orgId: number, data: any) {
    const donation = await this.prisma.donation.create({
      data: { ...data, organizationId: orgId },
      include: { campaign: true },
    })
    // Atualiza arrecadado da campanha se for monetária
    if (donation.campaignId && donation.tipo === 'MONETARY' && donation.valor) {
      await this.prisma.campaign.update({
        where: { id: donation.campaignId },
        data: { arrecadado: { increment: donation.valor } },
      })
    }
    return donation
  }

  async update(id: number, orgId: number, data: any) {
    await this.findOne(id, orgId)
    return this.prisma.donation.update({ where: { id }, data, include: { campaign: true } })
  }

  async getStats(orgId: number) {
    const [total, totalMonetario, byTipo, recentDonors, monthlyTrend] = await Promise.all([
      this.prisma.donation.count({ where: { organizationId: orgId } }),
      this.prisma.donation.aggregate({
        where: { organizationId: orgId, tipo: 'MONETARY', status: 'CONFIRMED' },
        _sum: { valor: true },
      }),
      this.prisma.donation.groupBy({
        by: ['tipo'],
        where: { organizationId: orgId },
        _count: true,
        _sum: { valor: true },
      }),
      this.prisma.donation.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { doadorNome: true, valor: true, tipo: true, createdAt: true, campaign: { select: { nome: true } } },
      }),
      // Últimos 6 meses
      this.prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") as month, SUM(valor) as total
        FROM "Donation"
        WHERE "organizationId" = ${orgId} AND tipo = 'MONETARY'
        AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY month ORDER BY month ASC
      `,
    ])

    return {
      total,
      totalMonetario: totalMonetario._sum.valor || 0,
      byTipo: byTipo.map(g => ({ tipo: g.tipo, count: g._count, total: g._sum.valor || 0 })),
      recentDonors,
      monthlyTrend,
    }
  }
}
