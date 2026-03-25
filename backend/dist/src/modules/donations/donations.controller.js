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
exports.DonationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const donations_service_1 = require("./donations.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const index_1 = require("../../common/decorators/index");
const client_1 = require("@prisma/client");
let DonationsController = class DonationsController {
    constructor(donationsService) {
        this.donationsService = donationsService;
    }
    findAll(user, tipo, status, campaignId, page) {
        return this.donationsService.findAll(user.orgId, { tipo, status, campaignId, page });
    }
    getStats(user) {
        return this.donationsService.getStats(user.orgId);
    }
    findOne(id, user) {
        return this.donationsService.findOne(id, user.orgId);
    }
    create(user, body) {
        return this.donationsService.create(user.orgId, body);
    }
    update(id, user, body) {
        return this.donationsService.update(id, user.orgId, body);
    }
};
exports.DonationsController = DonationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('tipo')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('campaignId')),
    __param(4, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], DonationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DonationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], DonationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DonationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], DonationsController.prototype, "update", null);
exports.DonationsController = DonationsController = __decorate([
    (0, swagger_1.ApiTags)('Doações'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('donations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [donations_service_1.DonationsService])
], DonationsController);
//# sourceMappingURL=donations.controller.js.map