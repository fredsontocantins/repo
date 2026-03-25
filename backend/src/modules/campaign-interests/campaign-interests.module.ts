import { Module } from '@nestjs/common'
import { CampaignInterestsService } from './campaign-interests.service'
import { CampaignInterestsController } from './campaign-interests.controller'
import { PrismaService } from '../../prisma.service'
import { CampaignVolunteersModule } from '../campaign-volunteers/campaign-volunteers.module'

@Module({
  imports: [CampaignVolunteersModule],
  controllers: [CampaignInterestsController],
  providers: [CampaignInterestsService, PrismaService],
})
export class CampaignInterestsModule {}
