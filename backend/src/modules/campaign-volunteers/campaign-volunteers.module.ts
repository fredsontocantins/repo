import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { CampaignVolunteersService } from './campaign-volunteers.service'

@Module({
  providers: [CampaignVolunteersService, PrismaService],
  exports: [CampaignVolunteersService],
})
export class CampaignVolunteersModule {}
