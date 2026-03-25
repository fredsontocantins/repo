"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignVolunteersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let CampaignVolunteersService = class CampaignVolunteersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureCampaign(campaignId, orgId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, organizationId: orgId },
            select: { id: true, voluntariosAtivos: true },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campanha não encontrada');
        return campaign;
    }
    async listVolunteers(campaignId, orgId) {
        await this.ensureCampaign(campaignId, orgId);
        return this.prisma.campaignVolunteer.findMany({
            where: { campaignId },
            include: { volunteer: true },
            orderBy: { joinedAt: 'desc' },
        });
    }
    async assignVolunteer(campaignId, volunteerId, orgId) {
        const campaign = await this.ensureCampaign(campaignId, orgId);
        const existing = await this.prisma.campaignVolunteer.findUnique({
            where: { campaignId_volunteerId: { campaignId, volunteerId } },
            include: { volunteer: true },
        });
        if (existing)
            return existing;
        const assignment = await this.prisma.campaignVolunteer.create({
            data: { campaignId, volunteerId },
            include: { volunteer: true },
        });
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { voluntariosAtivos: { increment: 1 } },
        });
        return assignment;
    }
    async removeVolunteer(campaignId, volunteerId, orgId) {
        const campaign = await this.ensureCampaign(campaignId, orgId);
        const existing = await this.prisma.campaignVolunteer.findUnique({
            where: { campaignId_volunteerId: { campaignId, volunteerId } },
        });
        if (!existing)
            throw new common_1.NotFoundException('Voluntário não está alocado nesta campanha');
        const deleted = await this.prisma.campaignVolunteer.delete({
            where: { campaignId_volunteerId: { campaignId, volunteerId } },
        });
        const newCount = Math.max(0, (campaign.voluntariosAtivos || 0) - 1);
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { voluntariosAtivos: newCount },
        });
        return deleted;
    }
};
exports.CampaignVolunteersService = CampaignVolunteersService;
exports.CampaignVolunteersService = CampaignVolunteersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignVolunteersService);
//# sourceMappingURL=campaign-volunteers.service.js.map