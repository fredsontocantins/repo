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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/utils/pagination");
const campaign_volunteers_service_1 = require("../campaign-volunteers/campaign-volunteers.service");
let CampaignsService = class CampaignsService {
    constructor(prisma, campaignVolunteersService) {
        this.prisma = prisma;
        this.campaignVolunteersService = campaignVolunteersService;
    }
    async findAll(orgId, filters) {
        const { status, search } = filters || {};
        const { page, limit, skip } = (0, pagination_1.normalizePagination)(filters, 20);
        const where = { organizationId: orgId };
        if (status)
            where.status = status;
        if (search)
            where.nome = { contains: search, mode: 'insensitive' };
        const [data, total] = await Promise.all([
            this.prisma.campaign.findMany({
                where, skip, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { donations: true, volunteers: true, events: true } } },
            }),
            this.prisma.campaign.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id, orgId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id, organizationId: orgId },
            include: {
                donations: { orderBy: { createdAt: 'desc' }, take: 10 },
                volunteers: { include: { volunteer: true } },
                events: { orderBy: { dataInicio: 'asc' } },
                _count: { select: { donations: true, volunteers: true } },
            },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campanha não encontrada');
        return campaign;
    }
    async create(orgId, data) {
        return this.prisma.campaign.create({ data: { ...data, organizationId: orgId } });
    }
    async update(id, orgId, data) {
        await this.findOne(id, orgId);
        return this.prisma.campaign.update({ where: { id }, data });
    }
    async remove(id, orgId) {
        await this.findOne(id, orgId);
        return this.prisma.campaign.update({ where: { id }, data: { status: client_1.CampaignStatus.CANCELLED } });
    }
    async getStats(orgId) {
        const [total, active, completed, totalArrecadado] = await Promise.all([
            this.prisma.campaign.count({ where: { organizationId: orgId } }),
            this.prisma.campaign.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
            this.prisma.campaign.count({ where: { organizationId: orgId, status: 'COMPLETED' } }),
            this.prisma.campaign.aggregate({ where: { organizationId: orgId }, _sum: { arrecadado: true, metaArrecadacao: true } }),
        ]);
        return {
            total, active, completed,
            totalArrecadado: totalArrecadado._sum.arrecadado || 0,
            totalMeta: totalArrecadado._sum.metaArrecadacao || 0,
        };
    }
    async addVolunteer(campaignId, volunteerId, orgId) {
        return this.campaignVolunteersService.assignVolunteer(campaignId, volunteerId, orgId);
    }
    async listVolunteers(campaignId, orgId) {
        return this.campaignVolunteersService.listVolunteers(campaignId, orgId);
    }
    async removeVolunteer(campaignId, volunteerId, orgId) {
        return this.campaignVolunteersService.removeVolunteer(campaignId, volunteerId, orgId);
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        campaign_volunteers_service_1.CampaignVolunteersService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map