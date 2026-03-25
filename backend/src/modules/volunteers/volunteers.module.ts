import { Module } from '@nestjs/common'
import { VolunteersController } from './volunteers.controller'
import { VolunteersService } from './volunteers.service'
import { PrismaService } from '../../prisma.service'

@Module({
  controllers: [VolunteersController],
  providers: [VolunteersService, PrismaService],
  exports: [VolunteersService],
})
export class VolunteersModule {}
