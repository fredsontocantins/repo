import { Controller, Get, Query, ParseIntPipe, Param, Put, Body, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CampaignInterestsService } from './campaign-interests.service'
import { Roles, CurrentUser } from '../../common/decorators'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { UserRole } from '@prisma/client'
import type { AuthenticatedUser } from '../../common/types/authenticated-user'
import { RejectInterestDto } from './dto/campaign-interest.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Interesses de Campanha')
@Controller('campaign-interests')
export class CampaignInterestsController {
  constructor(private service: CampaignInterestsService) {}

  @Get()
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  async list(@CurrentUser() user: AuthenticatedUser, @Query('status') status?: string, @Query('campaignId') campaignId?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.list(user.orgId!, { status, campaignId, page, limit })
  }

  @Get(':id')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  async detail(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.service.getById(user.orgId!, id)
  }

  @Put(':id/approve')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  async approve(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.service.approve(user.orgId!, id)
  }

  @Put(':id/reject')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  async reject(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number, @Body() body?: RejectInterestDto) {
    return this.service.reject(user.orgId!, id, body?.motivo)
  }
}
