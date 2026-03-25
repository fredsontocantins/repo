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
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const pagination_1 = require("../../common/utils/pagination");
let PublicService = class PublicService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrgBySlug(slug) {
        const org = await this.prisma.organization.findUnique({
            where: { slug, portalAtivo: true },
            select: {
                id: true, name: true, slug: true, description: true,
                logoUrl: true, website: true, email: true, city: true, state: true,
                portalDescricao: true, portalCorPrimaria: true,
                _count: { select: { volunteers: true, campaigns: true } },
            },
        });
        if (!org)
            throw new common_1.NotFoundException('Organização não encontrada');
        return org;
    }
    async getCampaigns(orgId, filters) {
        const { destaque } = filters || {};
        const { page, limit, skip } = (0, pagination_1.normalizePagination)(filters, 12);
        const where = {
            organizationId: orgId,
            publicavel: true,
            status: { in: ['ACTIVE', 'COMPLETED'] },
        };
        if (destaque)
            where.destaque = true;
        const [data, total] = await Promise.all([
            this.prisma.campaign.findMany({
                where, skip, take: limit,
                orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
                select: {
                    id: true, nome: true, descricao: true, objetivo: true,
                    metaArrecadacao: true, arrecadado: true,
                    metaVoluntarios: true, voluntariosAtivos: true,
                    status: true, dataInicio: true, dataFim: true,
                    imagemUrl: true, destaque: true,
                    _count: { select: { donations: true } },
                },
            }),
            this.prisma.campaign.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getEvents(orgId, pagination) {
        const { page, limit, skip } = (0, pagination_1.normalizePagination)(pagination, 10);
        const where = {
            organizationId: orgId,
            publicavel: true,
            status: { in: ['SCHEDULED', 'ONGOING'] },
            dataInicio: { gte: new Date() },
        };
        const [data, total] = await Promise.all([
            this.prisma.event.findMany({
                where, skip, take: limit,
                orderBy: { dataInicio: 'asc' },
                select: {
                    id: true, nome: true, descricao: true, local: true,
                    dataInicio: true, dataFim: true, capacidade: true, status: true,
                    campaign: { select: { id: true, nome: true } },
                    _count: { select: { registrations: true } },
                },
            }),
            this.prisma.event.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getLeaderboard(orgId, limit) {
        const take = (0, pagination_1.toPositiveInt)(limit, 10);
        return this.prisma.volunteer.findMany({
            where: { organizationId: orgId, status: 'ACTIVE', publicProfile: true },
            orderBy: { pontos: 'desc' },
            take,
            select: {
                id: true, nome: true, profissao: true, pontos: true,
                horasContribuidas: true, avatarUrl: true,
                badges: {
                    include: { badge: { select: { nome: true, icone: true, cor: true } } },
                    orderBy: { earnedAt: 'desc' },
                    take: 3,
                },
            },
        });
    }
    async getPublicStats(orgId) {
        const [volunteers, campaigns, donations, events, totalHoras] = await Promise.all([
            this.prisma.volunteer.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
            this.prisma.campaign.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
            this.prisma.donation.aggregate({
                where: { organizationId: orgId, tipo: 'MONETARY', status: 'CONFIRMED' },
                _sum: { valor: true },
            }),
            this.prisma.event.count({
                where: { organizationId: orgId, status: { in: ['SCHEDULED', 'ONGOING'] } },
            }),
            this.prisma.volunteer.aggregate({
                where: { organizationId: orgId, status: 'ACTIVE' },
                _sum: { horasContribuidas: true },
            }),
        ]);
        return {
            voluntariosAtivos: volunteers,
            campanhasAtivas: campaigns,
            totalArrecadado: donations._sum.valor || 0,
            eventosAgendados: events,
            totalHoras: totalHoras._sum.horasContribuidas || 0,
        };
    }
    async getCampaignById(orgId, campaignId) {
        const campaign = await this.prisma.campaign.findFirst({
            where: {
                id: campaignId,
                organizationId: orgId,
                publicavel: true,
            },
            include: {
                events: {
                    where: {
                        publicavel: true,
                        status: { in: ['SCHEDULED', 'ONGOING'] },
                    },
                    orderBy: { dataInicio: 'asc' },
                    take: 4,
                },
                donations: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                volunteers: {
                    include: { volunteer: { select: { id: true, nome: true, profissao: true, avatarUrl: true } } },
                    take: 5,
                },
            },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campanha não encontrada');
        return {
            ...campaign,
            featuredVolunteers: campaign.volunteers.map(v => v.volunteer),
        };
    }
    async expressInterest(orgId, campaignId, data) {
        const campaign = await this.prisma.campaign.findFirst({
            where: { id: campaignId, organizationId: orgId, publicavel: true },
            select: { id: true },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campanha não encontrada');
        return this.prisma.campaignInterest.create({
            data: {
                campaignId,
                organizationId: orgId,
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                profissao: data.profissao,
                mensagem: data.mensagem,
            },
        });
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicService);
//# sourceMappingURL=public.service.js.map