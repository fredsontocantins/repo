import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { CampaignsService } from './campaigns.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole, CampaignStatus } from '@prisma/client'

@ApiTags('Campanhas')
@ApiBearerAuth()
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('status') status?: CampaignStatus, @Query('search') search?: string, @Query('page') page?: number) {
    return this.campaignsService.findAll(user.orgId, { status, search, page })
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.campaignsService.getStats(user.orgId)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.campaignsService.findOne(id, user.orgId)
  }

  @Post()
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.campaignsService.create(user.orgId, body)
  }

  @Put(':id')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body() body: any) {
    return this.campaignsService.update(id, user.orgId, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.campaignsService.remove(id, user.orgId)
  }

  @Post(':id/volunteers')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  addVolunteer(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body('volunteerId') volunteerId: number) {
    return this.campaignsService.addVolunteer(id, volunteerId, user.orgId)
  }

  @Get(':id/volunteers')
  listVolunteers(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.campaignsService.listVolunteers(id, user.orgId)
  }

  @Delete(':id/volunteers/:volunteerId')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  removeVolunteer(
    @Param('id', ParseIntPipe) id: number,
    @Param('volunteerId', ParseIntPipe) volunteerId: number,
    @CurrentUser() user: any,
  ) {
    return this.campaignsService.removeVolunteer(id, volunteerId, user.orgId)
  }
}
