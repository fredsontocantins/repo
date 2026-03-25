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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_service_1 = require("./public.service");
const index_1 = require("../../common/decorators/index");
let PublicController = class PublicController {
    constructor(service) {
        this.service = service;
    }
    getOrg(slug) {
        return this.service.getOrgBySlug(slug);
    }
    async getStats(slug) {
        const org = await this.service.getOrgBySlug(slug);
        return this.service.getPublicStats(org.id);
    }
    async getCampaigns(slug, destaque, page, limit) {
        const org = await this.service.getOrgBySlug(slug);
        return this.service.getCampaigns(org.id, { destaque: destaque === 'true', page, limit });
    }
    async getEvents(slug, page, limit) {
        const org = await this.service.getOrgBySlug(slug);
        return this.service.getEvents(org.id, { page, limit });
    }
    async getLeaderboard(slug, limit) {
        const org = await this.service.getOrgBySlug(slug);
        return this.service.getLeaderboard(org.id, limit);
    }
    async expressInterest(slug, id, body) {
        const org = await this.service.getOrgBySlug(slug);
        return this.service.expressInterest(org.id, id, body);
    }
    async getCampaignDetail(slug, id) {
        const org = await this.service.getOrgBySlug(slug);
        return this.service.getCampaignById(org.id, id);
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('org/:slug'),
    (0, index_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Info pública da organização' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getOrg", null);
__decorate([
    (0, common_1.Get)('org/:slug/stats'),
    (0, index_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Estatísticas públicas' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('org/:slug/campaigns'),
    (0, index_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Campanhas públicas' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('destaque')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Get)('org/:slug/events'),
    (0, index_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Próximos eventos públicos' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)('org/:slug/leaderboard'),
    (0, index_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Ranking público de voluntários' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Post)('org/:slug/campaigns/:id/interest'),
    (0, index_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar intenção de voluntariado' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "expressInterest", null);
__decorate([
    (0, common_1.Get)('org/:slug/campaigns/:id'),
    (0, index_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhes de uma campanha pública' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getCampaignDetail", null);
exports.PublicController = PublicController = __decorate([
    (0, swagger_1.ApiTags)('Portal Público'),
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map