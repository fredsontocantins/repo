import { Module } from '@nestjs/common'
import { CampaignsController } from './campaigns.controller'
import { CampaignsService } from './campaigns.service'
import { PrismaService } from '../../prisma.service'
import { CampaignVolunteersModule } from '../campaign-volunteers/campaign-volunteers.module'

@Module({
  imports: [CampaignVolunteersModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, PrismaService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
