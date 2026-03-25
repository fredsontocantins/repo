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
exports.VolunteersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const volunteers_service_1 = require("./volunteers.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const index_1 = require("../../common/decorators/index");
const client_1 = require("@prisma/client");
let VolunteersController = class VolunteersController {
    constructor(volunteersService) {
        this.volunteersService = volunteersService;
    }
    findAll(user, status, search, page, limit) {
        return this.volunteersService.findAll(user.orgId, { status, search, page, limit });
    }
    getStats(user) {
        return this.volunteersService.getStats(user.orgId);
    }
    findOne(id, user) {
        return this.volunteersService.findOne(id, user.orgId);
    }
    create(user, body) {
        return this.volunteersService.create(user.orgId, body);
    }
    update(id, user, body) {
        return this.volunteersService.update(id, user.orgId, body);
    }
    remove(id, user) {
        return this.volunteersService.remove(id, user.orgId);
    }
    addPoints(id, user, points) {
        return this.volunteersService.addPoints(id, user.orgId, points);
    }
};
exports.VolunteersController = VolunteersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os voluntários' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.VolunteerStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], VolunteersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Estatísticas dos voluntários' }),
    __param(0, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VolunteersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar voluntário por ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VolunteersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo voluntário' }),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VolunteersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar voluntário' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], VolunteersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, index_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Desativar voluntário' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], VolunteersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/points'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar pontos ao voluntário' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('points')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], VolunteersController.prototype, "addPoints", null);
exports.VolunteersController = VolunteersController = __decorate([
    (0, swagger_1.ApiTags)('Voluntários'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('volunteers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [volunteers_service_1.VolunteersService])
], VolunteersController);
//# sourceMappingURL=volunteers.controller.js.map