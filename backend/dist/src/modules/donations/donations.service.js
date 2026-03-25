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
exports.DonationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let DonationsService = class DonationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId, filters) {
        const { tipo, status, campaignId, page = 1, limit = 20 } = filters || {};
        const skip = (page - 1) * limit;
        const where = { organizationId: orgId };
        if (tipo)
            where.tipo = tipo;
        if (status)
            where.status = status;
        if (campaignId)
            where.campaignId = campaignId;
        const [data, total] = await Promise.all([
            this.prisma.donation.findMany({
                where, skip, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { campaign: { select: { id: true, nome: true } }, volunteer: { select: { id: true, nome: true } } },
            }),
            this.prisma.donation.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id, orgId) {
        const donation = await this.prisma.donation.findFirst({
            where: { id, organizationId: orgId },
            include: { campaign: true, volunteer: true },
        });
        if (!donation)
            throw new common_1.NotFoundException('Doação não encontrada');
        return donation;
    }
    async create(orgId, data) {
        const donation = await this.prisma.donation.create({
            data: { ...data, organizationId: orgId },
            include: { campaign: true },
        });
        if (donation.campaignId && donation.tipo === 'MONETARY' && donation.valor) {
            await this.prisma.campaign.update({
                where: { id: donation.campaignId },
                data: { arrecadado: { increment: donation.valor } },
            });
        }
        return donation;
    }
    async update(id, orgId, data) {
        await this.findOne(id, orgId);
        return this.prisma.donation.update({ where: { id }, data, include: { campaign: true } });
    }
    async getStats(orgId) {
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
            this.prisma.$queryRaw `
        SELECT DATE_TRUNC('month', "createdAt") as month, SUM(valor) as total
        FROM "Donation"
        WHERE "organizationId" = ${orgId} AND tipo = 'MONETARY'
        AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY month ORDER BY month ASC
      `,
        ]);
        return {
            total,
            totalMonetario: totalMonetario._sum.valor || 0,
            byTipo: byTipo.map(g => ({ tipo: g.tipo, count: g._count, total: g._sum.valor || 0 })),
            recentDonors,
            monthlyTrend,
        };
    }
};
exports.DonationsService = DonationsService;
exports.DonationsService = DonationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DonationsService);
//# sourceMappingURL=donations.service.js.map