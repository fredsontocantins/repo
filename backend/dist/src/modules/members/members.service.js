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
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let MembersService = class MembersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId, filters) {
        const { search, role, isActive, page = 1, limit = 20 } = filters || {};
        const skip = (page - 1) * limit;
        const where = { organizationId: orgId };
        if (role)
            where.role = role;
        if (isActive !== undefined)
            where.isActive = isActive;
        if (search) {
            where.OR = [
                { nome: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { cargo: { contains: search, mode: 'insensitive' } },
                { departamento: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.member.findMany({ where, skip, take: limit, orderBy: { nome: 'asc' } }),
            this.prisma.member.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id, orgId) {
        const member = await this.prisma.member.findFirst({ where: { id, organizationId: orgId } });
        if (!member)
            throw new common_1.NotFoundException('Membro não encontrado');
        return member;
    }
    async create(orgId, data) {
        return this.prisma.member.create({ data: { ...data, organizationId: orgId } });
    }
    async update(id, orgId, data) {
        await this.findOne(id, orgId);
        return this.prisma.member.update({ where: { id }, data });
    }
    async deactivate(id, orgId) {
        await this.findOne(id, orgId);
        return this.prisma.member.update({ where: { id }, data: { isActive: false } });
    }
    async getStats(orgId) {
        const [total, active, byRole, byDept] = await Promise.all([
            this.prisma.member.count({ where: { organizationId: orgId } }),
            this.prisma.member.count({ where: { organizationId: orgId, isActive: true } }),
            this.prisma.member.groupBy({ by: ['role'], where: { organizationId: orgId }, _count: true }),
            this.prisma.member.groupBy({
                by: ['departamento'],
                where: { organizationId: orgId, departamento: { not: null } },
                _count: true,
                orderBy: { _count: { departamento: 'desc' } },
            }),
        ]);
        return { total, active, byRole, byDept };
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MembersService);
//# sourceMappingURL=members.service.js.map