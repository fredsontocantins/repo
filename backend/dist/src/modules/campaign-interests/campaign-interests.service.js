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
exports.CampaignInterestsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const campaign_volunteers_service_1 = require("../campaign-volunteers/campaign-volunteers.service");
let CampaignInterestsService = class CampaignInterestsService {
    constructor(prisma, campaignVolunteersService) {
        this.prisma = prisma;
        this.campaignVolunteersService = campaignVolunteersService;
    }
    buildWhere(orgId, filters = {}) {
        const where = { organizationId: orgId };
        if (filters.status)
            where.status = filters.status;
        if (filters.campaignId)
            where.campaignId = Number(filters.campaignId);
        return where;
    }
    async list(orgId, filters = {}) {
        const { page, limit, skip } = (0, pagination_1.normalizePagination)(filters, 12);
        const where = this.buildWhere(orgId, filters);
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
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getById(orgId, id) {
        const interest = await this.prisma.campaignInterest.findFirst({
            where: { id, organizationId: orgId },
            include: { campaign: true },
        });
        if (!interest)
            throw new common_1.NotFoundException('Intenção não encontrada');
        return interest;
    }
    async approve(orgId, id) {
        const interest = await this.getById(orgId, id);
        if (interest.status !== client_1.CampaignInterestStatus.PENDING)
            throw new common_1.BadRequestException('Intenção já processada');
        const existing = interest.email
            ? await this.prisma.volunteer.findFirst({ where: { email: interest.email, organizationId: orgId } })
            : null;
        const volunteer = existing
            ? await this.prisma.volunteer.update({
                where: { id: existing.id },
                data: {
                    nome: interest.nome,
                    telefone: interest.telefone,
                    profissao: interest.profissao,
                    bio: interest.mensagem || undefined,
                    status: client_1.VolunteerStatus.ACTIVE,
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
                    status: client_1.VolunteerStatus.ACTIVE,
                    publicProfile: true,
                },
            });
        await this.campaignVolunteersService.assignVolunteer(interest.campaignId, volunteer.id, orgId);
        const updated = await this.prisma.campaignInterest.update({
            where: { id },
            data: { status: client_1.CampaignInterestStatus.APPROVED },
        });
        return { interest: updated, volunteer };
    }
    async reject(orgId, id, motivo) {
        const interest = await this.getById(orgId, id);
        if (interest.status !== client_1.CampaignInterestStatus.PENDING)
            throw new common_1.BadRequestException('Intenção já processada');
        const updated = await this.prisma.campaignInterest.update({
            where: { id },
            data: { status: client_1.CampaignInterestStatus.REJECTED, mensagem: motivo || interest.mensagem },
        });
        return updated;
    }
};
exports.CampaignInterestsService = CampaignInterestsService;
exports.CampaignInterestsService = CampaignInterestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        campaign_volunteers_service_1.CampaignVolunteersService])
], CampaignInterestsService);
//# sourceMappingURL=campaign-interests.service.js.map