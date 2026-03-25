import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { DonationsService } from './donations.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole, DonationType, DonationStatus } from '@prisma/client'

@ApiTags('Doações')
@ApiBearerAuth()
@Controller('donations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('tipo') tipo?: DonationType,
    @Query('status') status?: DonationStatus,
    @Query('campaignId') campaignId?: number,
    @Query('page') page?: number,
  ) {
    return this.donationsService.findAll(user.orgId, { tipo, status, campaignId, page })
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.donationsService.getStats(user.orgId)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.donationsService.findOne(id, user.orgId)
  }

  @Post()
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.donationsService.create(user.orgId, body)
  }

  @Put(':id')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body() body: any) {
    return this.donationsService.update(id, user.orgId, body)
  }
}
