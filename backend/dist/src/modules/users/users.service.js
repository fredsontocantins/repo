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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const pagination_1 = require("../../common/utils/pagination");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(orgId, filters) {
        const { page, limit, skip } = (0, pagination_1.normalizePagination)(filters, 20);
        const where = {};
        if (orgId)
            where.organizationId = orgId;
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { organization: true },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getById(id, orgId) {
        const where = { id };
        if (orgId)
            where.organizationId = orgId;
        const user = await this.prisma.user.findFirst({
            where,
            include: { organization: true },
        });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        return user;
    }
    async create(orgId, data) {
        const targetOrg = orgId ?? data.organizationId;
        if (!targetOrg)
            throw new common_1.NotFoundException('Organização obrigatória');
        const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (exists)
            throw new common_1.ConflictException('Email já cadastrado');
        const passwordHash = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: data.role ?? client_1.UserRole.COORDINATOR,
                organizationId: targetOrg,
            },
            include: { organization: true },
        });
    }
    async update(id, orgId, data) {
        const where = { id };
        if (orgId)
            where.organizationId = orgId;
        const user = await this.prisma.user.findFirst({ where });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.email)
            updateData.email = data.email;
        if (data.role)
            updateData.role = data.role;
        if (typeof data.isActive === 'boolean')
            updateData.isActive = data.isActive;
        if (data.password)
            updateData.passwordHash = await bcrypt.hash(data.password, 10);
        return this.prisma.user.update({
            where: { id: user.id },
            data: updateData,
            include: { organization: true },
        });
    }
    async remove(id, orgId) {
        const where = { id };
        if (orgId)
            where.organizationId = orgId;
        const user = await this.prisma.user.findFirst({ where });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        return this.prisma.user.update({
            where: { id: user.id },
            data: { isActive: false },
            include: { organization: true },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map