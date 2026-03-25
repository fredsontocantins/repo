import { Module } from '@nestjs/common'
import { GamificationController } from './gamification.controller'
import { GamificationService } from './gamification.service'
import { PrismaService } from '../../prisma.service'

@Module({
  controllers: [GamificationController],
  providers: [GamificationService, PrismaService],
  exports: [GamificationService],
})
export class GamificationModule {}
