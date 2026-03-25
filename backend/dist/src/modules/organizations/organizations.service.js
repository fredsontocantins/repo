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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let OrganizationsService = class OrganizationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        return this.prisma.organization.findUnique({
            where: { id },
            include: {
                _count: { select: { volunteers: true, campaigns: true, donations: true, events: true } },
            },
        });
    }
    async update(id, data) {
        return this.prisma.organization.update({ where: { id }, data });
    }
    async getDashboardStats(orgId) {
        const [volunteers, campaigns, donations, events] = await Promise.all([
            this.prisma.volunteer.aggregate({ where: { organizationId: orgId }, _count: true, _sum: { horasContribuidas: true } }),
            this.prisma.campaign.aggregate({ where: { organizationId: orgId }, _count: true, _sum: { arrecadado: true } }),
            this.prisma.donation.aggregate({ where: { organizationId: orgId, tipo: 'MONETARY' }, _count: true, _sum: { valor: true } }),
            this.prisma.event.count({ where: { organizationId: orgId, status: 'SCHEDULED' } }),
        ]);
        const activeVolunteers = await this.prisma.volunteer.count({ where: { organizationId: orgId, status: 'ACTIVE' } });
        const activeCampaigns = await this.prisma.campaign.count({ where: { organizationId: orgId, status: 'ACTIVE' } });
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newVolunteers = await this.prisma.volunteer.count({
            where: { organizationId: orgId, createdAt: { gte: thirtyDaysAgo } },
        });
        const newDonations = await this.prisma.donation.aggregate({
            where: { organizationId: orgId, tipo: 'MONETARY', createdAt: { gte: thirtyDaysAgo } },
            _sum: { valor: true },
        });
        return {
            volunteers: { total: volunteers._count, active: activeVolunteers, totalHoras: volunteers._sum.horasContribuidas || 0, newThisMonth: newVolunteers },
            campaigns: { total: campaigns._count, active: activeCampaigns, totalArrecadado: campaigns._sum.arrecadado || 0 },
            donations: { total: donations._count, totalMonetario: donations._sum.valor || 0, newThisMonth: newDonations._sum.valor || 0 },
            events: { upcoming: events },
        };
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map