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
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/utils/pagination");
let CertificatesService = class CertificatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateCode() {
        const year = new Date().getFullYear();
        const random = Math.random().toString(36).toUpperCase().substring(2, 8);
        return `VOL-${year}-${random}`;
    }
    async findAll(orgId, filters) {
        const { volunteerId, tipo } = filters || {};
        const { page, limit, skip } = (0, pagination_1.normalizePagination)(filters, 20);
        const where = { organizationId: orgId, revogado: false };
        if (volunteerId)
            where.volunteerId = volunteerId;
        if (tipo)
            where.tipo = tipo;
        const [data, total] = await Promise.all([
            this.prisma.certificate.findMany({
                where, skip, take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    volunteer: { select: { id: true, nome: true, email: true, profissao: true } },
                    campaign: { select: { id: true, nome: true } },
                },
            }),
            this.prisma.certificate.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id, orgId) {
        const cert = await this.prisma.certificate.findFirst({
            where: { id, organizationId: orgId },
            include: {
                volunteer: true,
                campaign: true,
                organization: { select: { id: true, name: true, logoUrl: true, email: true, city: true, state: true } },
            },
        });
        if (!cert)
            throw new common_1.NotFoundException('Certificado não encontrado');
        return cert;
    }
    async verifyByCodigo(codigo) {
        const cert = await this.prisma.certificate.findUnique({
            where: { codigo },
            include: {
                volunteer: { select: { id: true, nome: true, profissao: true } },
                campaign: { select: { id: true, nome: true } },
                organization: { select: { id: true, name: true, logoUrl: true, city: true, state: true } },
            },
        });
        if (!cert)
            throw new common_1.NotFoundException('Certificado não encontrado ou código inválido');
        return {
            valido: !cert.revogado,
            revogado: cert.revogado,
            motivoRevogacao: cert.revogado ? cert.motivoRevogacao : undefined,
            certificado: cert.revogado ? null : cert,
        };
    }
    async create(orgId, data) {
        const volunteer = await this.prisma.volunteer.findFirst({
            where: { id: data.volunteerId, organizationId: orgId },
        });
        if (!volunteer)
            throw new common_1.BadRequestException('Voluntário não encontrado nesta organização');
        let codigo;
        let exists = true;
        while (exists) {
            codigo = this.generateCode();
            const found = await this.prisma.certificate.findUnique({ where: { codigo } });
            exists = !!found;
        }
        return this.prisma.certificate.create({
            data: {
                ...data,
                codigo: codigo,
                tipo: data.tipo || client_1.CertificateType.PARTICIPATION,
                dataAtividade: data.dataAtividade ? new Date(data.dataAtividade) : undefined,
                dataValidade: data.dataValidade ? new Date(data.dataValidade) : undefined,
                organizationId: orgId,
            },
            include: {
                volunteer: { select: { id: true, nome: true, email: true } },
                campaign: { select: { id: true, nome: true } },
                organization: { select: { id: true, name: true } },
            },
        });
    }
    async issueBulk(orgId, data) {
        const results = [];
        for (const volunteerId of data.volunteerIds) {
            try {
                const cert = await this.create(orgId, { ...data, volunteerId });
                results.push({ volunteerId, success: true, certificado: cert });
            }
            catch (e) {
                results.push({ volunteerId, success: false, error: e.message });
            }
        }
        return { total: data.volunteerIds.length, emitidos: results.filter(r => r.success).length, results };
    }
    async revoke(id, orgId, motivoRevogacao) {
        await this.findOne(id, orgId);
        return this.prisma.certificate.update({
            where: { id },
            data: { revogado: true, motivoRevogacao },
        });
    }
    async getStats(orgId) {
        const [total, porTipo, recentes] = await Promise.all([
            this.prisma.certificate.count({ where: { organizationId: orgId, revogado: false } }),
            this.prisma.certificate.groupBy({
                by: ['tipo'],
                where: { organizationId: orgId, revogado: false },
                _count: true,
            }),
            this.prisma.certificate.findMany({
                where: { organizationId: orgId, revogado: false },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { volunteer: { select: { nome: true } }, campaign: { select: { nome: true } } },
            }),
        ]);
        return { total, porTipo, recentes };
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map