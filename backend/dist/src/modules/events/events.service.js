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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const pagination_1 = require("../../common/utils/pagination");
let EventsService = class EventsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId, filters) {
        const activeFilters = filters ?? {};
        const statusFilter = activeFilters.status;
        const { page, limit, skip } = (0, pagination_1.normalizePagination)(activeFilters);
        const where = { organizationId: orgId };
        if (statusFilter)
            where.status = statusFilter;
        const [data, total] = await Promise.all([
            this.prisma.event.findMany({
                where, skip, take: limit,
                orderBy: { dataInicio: 'asc' },
                include: {
                    campaign: { select: { id: true, nome: true } },
                    _count: { select: { registrations: true } },
                },
            }),
            this.prisma.event.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id, orgId) {
        const event = await this.prisma.event.findFirst({
            where: { id, organizationId: orgId },
            include: {
                campaign: true,
                registrations: { include: { volunteer: { select: { id: true, nome: true, email: true } } } },
            },
        });
        if (!event)
            throw new common_1.NotFoundException('Evento não encontrado');
        return event;
    }
    async create(orgId, data) {
        return this.prisma.event.create({ data: { ...data, organizationId: orgId } });
    }
    async update(id, orgId, data) {
        await this.findOne(id, orgId);
        return this.prisma.event.update({ where: { id }, data });
    }
    async register(eventId, volunteerId, orgId) {
        await this.findOne(eventId, orgId);
        return this.prisma.eventRegistration.upsert({
            where: { eventId_volunteerId: { eventId, volunteerId } },
            update: {},
            create: { eventId, volunteerId },
        });
    }
    async listRegistrations(eventId, orgId) {
        await this.findOne(eventId, orgId);
        return this.prisma.eventRegistration.findMany({
            where: { eventId },
            include: { volunteer: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async unregister(eventId, volunteerId, orgId) {
        await this.findOne(eventId, orgId);
        return this.prisma.eventRegistration.delete({
            where: { eventId_volunteerId: { eventId, volunteerId } },
        });
    }
    async checkin(eventId, volunteerId, orgId) {
        await this.findOne(eventId, orgId);
        return this.prisma.eventRegistration.update({
            where: { eventId_volunteerId: { eventId, volunteerId } },
            data: { checkedIn: true, checkinAt: new Date() },
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map