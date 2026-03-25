import { Module } from '@nestjs/common'
import { DonationsController } from './donations.controller'
import { DonationsService } from './donations.service'
import { PrismaService } from '../../prisma.service'

@Module({
  controllers: [DonationsController],
  providers: [DonationsService, PrismaService],
  exports: [DonationsService],
})
export class DonationsModule {}
