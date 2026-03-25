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
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const pagination_1 = require("../../common/utils/pagination");
let GamificationService = class GamificationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLeaderboard(orgId, limit) {
        const take = (0, pagination_1.toPositiveInt)(limit, 10);
        return this.prisma.volunteer.findMany({
            where: { organizationId: orgId, status: 'ACTIVE' },
            orderBy: { pontos: 'desc' },
            take,
            select: {
                id: true, nome: true, pontos: true, horasContribuidas: true, avatarUrl: true, profissao: true,
                badges: { include: { badge: true }, orderBy: { earnedAt: 'desc' }, take: 3 },
                _count: { select: { eventRegistrations: true } },
            },
        });
    }
    async getBadges() {
        return this.prisma.badge.findMany({ orderBy: { pontosReq: 'asc' } });
    }
    async getVolunteerBadges(volunteerId) {
        return this.prisma.volunteerBadge.findMany({
            where: { volunteerId },
            include: { badge: true },
            orderBy: { earnedAt: 'desc' },
        });
    }
    async awardBadge(volunteerId, badgeId) {
        return this.prisma.volunteerBadge.upsert({
            where: { volunteerId_badgeId: { volunteerId, badgeId } },
            update: {},
            create: { volunteerId, badgeId },
            include: { badge: true },
        });
    }
    async checkAndAwardBadges(volunteerId) {
        const volunteer = await this.prisma.volunteer.findUnique({
            where: { id: volunteerId },
            include: { badges: true },
        });
        if (!volunteer)
            return [];
        const allBadges = await this.prisma.badge.findMany();
        const earnedBadgeIds = volunteer.badges.map(b => b.badgeId);
        const newBadges = [];
        for (const badge of allBadges) {
            if (earnedBadgeIds.includes(badge.id))
                continue;
            const qualifies = (badge.pontosReq > 0 && volunteer.pontos >= badge.pontosReq) ||
                (badge.horasReq > 0 && volunteer.horasContribuidas >= badge.horasReq);
            if (qualifies) {
                const awarded = await this.awardBadge(volunteerId, badge.id);
                newBadges.push(awarded);
            }
        }
        return newBadges;
    }
    async createBadge(data) {
        return this.prisma.badge.create({ data });
    }
    async getStats(orgId) {
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
        ]);
        const topBadgesWithDetails = await Promise.all(topBadges.map(async (b) => ({
            badge: await this.prisma.badge.findUnique({ where: { id: b.badgeId } }),
            count: b._count,
        })));
        return {
            totalPoints: totalPoints._sum.pontos || 0,
            totalBadgesAwarded,
            topBadges: topBadgesWithDetails,
        };
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map