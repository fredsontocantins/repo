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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const finance_service_1 = require("./finance.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const index_1 = require("../../common/decorators/index");
const client_1 = require("@prisma/client");
let FinanceController = class FinanceController {
    constructor(service) {
        this.service = service;
    }
    getDashboard(user) {
        return this.service.getDashboard(user.orgId);
    }
    findPayables(user, query) {
        return this.service.findAllPayables(user.orgId, query);
    }
    createPayable(user, body) {
        return this.service.createPayable(user.orgId, body);
    }
    updatePayable(id, user, body) {
        return this.service.updatePayable(id, user.orgId, body);
    }
    liquidarPayable(id, user, body) {
        return this.service.liquidarPayable(id, user.orgId, body);
    }
    estornarPayable(id, user, motivo) {
        return this.service.estornarPayable(id, user.orgId, motivo);
    }
    cancelarPayable(id, user, motivo) {
        return this.service.cancelarPayable(id, user.orgId, motivo);
    }
    findReceivables(user, query) {
        return this.service.findAllReceivables(user.orgId, query);
    }
    createReceivable(user, body) {
        return this.service.createReceivable(user.orgId, body);
    }
    updateReceivable(id, user, body) {
        return this.service.updateReceivable(id, user.orgId, body);
    }
    liquidarReceivable(id, user, body) {
        return this.service.liquidarReceivable(id, user.orgId, body);
    }
    estornarReceivable(id, user, motivo) {
        return this.service.estornarReceivable(id, user.orgId, motivo);
    }
    cancelarReceivable(id, user, motivo) {
        return this.service.cancelarReceivable(id, user.orgId, motivo);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Dashboard financeiro com todos os resumos' }),
    __param(0, (0, index_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('payables'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar contas a pagar' }),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "findPayables", null);
__decorate([
    (0, common_1.Post)('payables'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Criar conta a pagar' }),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createPayable", null);
__decorate([
    (0, common_1.Put)('payables/:id'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updatePayable", null);
__decorate([
    (0, common_1.Put)('payables/:id/liquidar'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Liquidar (pagar) conta' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "liquidarPayable", null);
__decorate([
    (0, common_1.Put)('payables/:id/estornar'),
    (0, index_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Estornar pagamento' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('motivo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "estornarPayable", null);
__decorate([
    (0, common_1.Put)('payables/:id/cancelar'),
    (0, index_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar conta a pagar' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('motivo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "cancelarPayable", null);
__decorate([
    (0, common_1.Get)('receivables'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar contas a receber' }),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "findReceivables", null);
__decorate([
    (0, common_1.Post)('receivables'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Criar conta a receber' }),
    __param(0, (0, index_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createReceivable", null);
__decorate([
    (0, common_1.Put)('receivables/:id'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateReceivable", null);
__decorate([
    (0, common_1.Put)('receivables/:id/liquidar'),
    (0, index_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Liquidar (receber) conta' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "liquidarReceivable", null);
__decorate([
    (0, common_1.Put)('receivables/:id/estornar'),
    (0, index_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('motivo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "estornarReceivable", null);
__decorate([
    (0, common_1.Put)('receivables/:id/cancelar'),
    (0, index_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, index_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('motivo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "cancelarReceivable", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)('Financeiro'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('finance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map