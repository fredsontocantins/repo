import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { PrismaService } from './prisma.service'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'
import { AuthModule } from './modules/auth/auth.module'
import { VolunteersModule } from './modules/volunteers/volunteers.module'
import { CampaignsModule } from './modules/campaigns/campaigns.module'
import { DonationsModule } from './modules/donations/donations.module'
import { OrganizationsModule } from './modules/organizations/organizations.module'
import { GamificationModule } from './modules/gamification/gamification.module'
import { ReportsModule } from './modules/reports/reports.module'
import { EventsModule } from './modules/events/events.module'
import { CertificatesModule } from './modules/certificates/certificates.module'
import { MembersModule } from './modules/members/members.module'
import { PublicModule } from './modules/public/public.module'
import { FinanceModule } from './modules/finance/finance.module'
import { UsersModule } from './modules/users/users.module'
import { CampaignInterestsModule } from './modules/campaign-interests/campaign-interests.module'
import { HealthModule } from './modules/health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global (padrão: 100 req/min). Endpoints de /auth têm limites menores via @Throttle.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AuthModule, VolunteersModule, CampaignsModule, CampaignInterestsModule, DonationsModule,
    OrganizationsModule, GamificationModule, ReportsModule, EventsModule,
    CertificatesModule, MembersModule, PublicModule, FinanceModule,
    UsersModule, HealthModule,
  ],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [PrismaService],
})
export class AppModule {}
