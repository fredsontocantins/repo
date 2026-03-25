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
exports.VolunteersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/utils/pagination");
let VolunteersService = class VolunteersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId, filters) {
        const { status, search } = filters || {};
        const { page, limit, skip } = (0, pagination_1.normalizePagination)(filters);
        const where = { organizationId: orgId };
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { nome: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { profissao: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.volunteer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { pontos: 'desc' },
                include: { badges: { include: { badge: true } }, _count: { select: { eventRegistrations: true } } },
            }),
            this.prisma.volunteer.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id, orgId) {
        const volunteer = await this.prisma.volunteer.findFirst({
            where: { id, organizationId: orgId },
            include: {
                badges: { include: { badge: true } },
                donations: { orderBy: { createdAt: 'desc' }, take: 5 },
                eventRegistrations: { include: { event: true }, orderBy: { createdAt: 'desc' }, take: 5 },
                campaignVolunteers: { include: { campaign: true } },
            },
        });
        if (!volunteer)
            throw new common_1.NotFoundException('Voluntário não encontrado');
        return volunteer;
    }
    async create(orgId, data) {
        return this.prisma.volunteer.create({
            data: { ...data, organizationId: orgId },
            include: { badges: { include: { badge: true } } },
        });
    }
    async update(id, orgId, data) {
        await this.findOne(id, orgId);
        return this.prisma.volunteer.update({
            where: { id },
            data,
            include: { badges: { include: { badge: true } } },
        });
    }
    async remove(id, orgId) {
        await this.findOne(id, orgId);
        await this.prisma.volunteer.update({ where: { id }, data: { status: client_1.VolunteerStatus.INACTIVE } });
        return { message: 'Voluntário desativado com sucesso' };
    }
    async getStats(orgId) {
        const [total, active, pending, topVolunteers, byProfissao] = await Promise.all([
            this.prisma.volunteer.count({ where: { organizationId: orgId } }),
            this.prisma.volunteer.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
            this.prisma.volunteer.count({ where: { organizationId: orgId, status: 'PENDING' } }),
            this.prisma.volunteer.findMany({
                where: { organizationId: orgId, status: 'ACTIVE' },
                orderBy: { pontos: 'desc' },
                take: 5,
                select: { id: true, nome: true, pontos: true, horasContribuidas: true, avatarUrl: true },
            }),
            this.prisma.volunteer.groupBy({
                by: ['profissao'],
                where: { organizationId: orgId, profissao: { not: null } },
                _count: true,
                orderBy: { _count: { profissao: 'desc' } },
                take: 8,
            }),
        ]);
        const totalHoras = await this.prisma.volunteer.aggregate({
            where: { organizationId: orgId },
            _sum: { horasContribuidas: true },
        });
        return {
            total,
            active,
            pending,
            inactive: total - active - pending,
            totalHoras: totalHoras._sum.horasContribuidas || 0,
            topVolunteers,
            byProfissao: byProfissao.map(g => ({ profissao: g.profissao || 'Não informado', count: g._count })),
        };
    }
    async addPoints(id, orgId, points) {
        const volunteer = await this.findOne(id, orgId);
        return this.prisma.volunteer.update({
            where: { id },
            data: { pontos: volunteer.pontos + points },
        });
    }
};
exports.VolunteersService = VolunteersService;
exports.VolunteersService = VolunteersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VolunteersService);
//# sourceMappingURL=volunteers.service.js.map