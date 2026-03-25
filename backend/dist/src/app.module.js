"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("./prisma.service");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const auth_module_1 = require("./modules/auth/auth.module");
const volunteers_module_1 = require("./modules/volunteers/volunteers.module");
const campaigns_module_1 = require("./modules/campaigns/campaigns.module");
const donations_module_1 = require("./modules/donations/donations.module");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const gamification_module_1 = require("./modules/gamification/gamification.module");
const reports_module_1 = require("./modules/reports/reports.module");
const events_module_1 = require("./modules/events/events.module");
const certificates_module_1 = require("./modules/certificates/certificates.module");
const members_module_1 = require("./modules/members/members.module");
const public_module_1 = require("./modules/public/public.module");
const finance_module_1 = require("./modules/finance/finance.module");
const users_module_1 = require("./modules/users/users.module");
const campaign_interests_module_1 = require("./modules/campaign-interests/campaign-interests.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            auth_module_1.AuthModule, volunteers_module_1.VolunteersModule, campaigns_module_1.CampaignsModule, campaign_interests_module_1.CampaignInterestsModule, donations_module_1.DonationsModule,
            organizations_module_1.OrganizationsModule, gamification_module_1.GamificationModule, reports_module_1.ReportsModule, events_module_1.EventsModule,
            certificates_module_1.CertificatesModule, members_module_1.MembersModule, public_module_1.PublicModule, finance_module_1.FinanceModule,
            users_module_1.UsersModule,
        ],
        providers: [
            prisma_service_1.PrismaService,
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
        exports: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map