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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const index_1 = require("../../common/decorators/index");
const client_1 = require("@prisma/client");
let EventsController = class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    findAll(user, status, page) {
        return this.eventsService.findAll(user.orgId, { status, page });
    }
    findOne(id, user) {
        return this.eventsService.findOne(id, user.orgId);
    }
    create(user, body) {
        return this.eventsService.create(user.orgId, body);
    }
    update(id, user, body) {
        return this.eventsService.update(id, user.orgId, body);
    }
    register(id, user, volunteerId) {
        return this.eventsService.register(id, volunteerId, user.orgId);
    }
    listVolunteers(id, user) {
        return this.eventsService.listRegistrations(id, user.orgId);
    }
    checkin(id, user, volunteerId) {
        return this.eventsService.checkin(id, volunteerId, user.orgId);
    }
    unregisterVolunteer(id, volunteerId, user) {
        return this.eventsService.unregister(id, volunteerId, user.orgId);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/register'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('volunteerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(':id/volunteers'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "listVolunteers", null);
__decorate([
    (0, common_1.Post)(':id/checkin'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('volunteerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "checkin", null);
__decorate([
    (0, common_1.Delete)(':id/volunteers/:volunteerId'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('volunteerId', common_1.ParseIntPipe)),
    __param(2, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "unregisterVolunteer", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('Eventos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map