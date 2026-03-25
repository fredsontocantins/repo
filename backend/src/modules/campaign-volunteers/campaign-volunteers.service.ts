import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class CampaignVolunteersService {
  constructor(private prisma: PrismaService) {}

  private async ensureCampaign(campaignId: number, orgId: number) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, organizationId: orgId },
      select: { id: true, voluntariosAtivos: true },
    })
    if (!campaign) throw new NotFoundException('Campanha não encontrada')
    return campaign
  }

  async listVolunteers(campaignId: number, orgId: number) {
    await this.ensureCampaign(campaignId, orgId)
    return this.prisma.campaignVolunteer.findMany({
      where: { campaignId },
      include: { volunteer: true },
      orderBy: { joinedAt: 'desc' },
    })
  }

  async assignVolunteer(campaignId: number, volunteerId: number, orgId: number) {
    const campaign = await this.ensureCampaign(campaignId, orgId)
    const existing = await this.prisma.campaignVolunteer.findUnique({
      where: { campaignId_volunteerId: { campaignId, volunteerId } },
      include: { volunteer: true },
    })
    if (existing) return existing

    const assignment = await this.prisma.campaignVolunteer.create({
      data: { campaignId, volunteerId },
      include: { volunteer: true },
    })

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { voluntariosAtivos: { increment: 1 } },
    })

    return assignment
  }

  async removeVolunteer(campaignId: number, volunteerId: number, orgId: number) {
    const campaign = await this.ensureCampaign(campaignId, orgId)
    const existing = await this.prisma.campaignVolunteer.findUnique({
      where: { campaignId_volunteerId: { campaignId, volunteerId } },
    })
    if (!existing) throw new NotFoundException('Voluntário não está alocado nesta campanha')

    const deleted = await this.prisma.campaignVolunteer.delete({
      where: { campaignId_volunteerId: { campaignId, volunteerId } },
    })

    const newCount = Math.max(0, (campaign.voluntariosAtivos || 0) - 1)
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { voluntariosAtivos: newCount },
    })

    return deleted
  }
}
