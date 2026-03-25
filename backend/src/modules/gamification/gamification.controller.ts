import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { GamificationService } from './gamification.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole } from '@prisma/client'

@ApiTags('Gamificação')
@ApiBearerAuth()
@Controller('gamification')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GamificationController {
  constructor(private service: GamificationService) {}

  @Get('leaderboard')
  getLeaderboard(@CurrentUser() user: any, @Query('limit') limit?: number) {
    return this.service.getLeaderboard(user.orgId, limit)
  }

  @Get('badges')
  getBadges() {
    return this.service.getBadges()
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.service.getStats(user.orgId)
  }

  @Get('volunteer/:id/badges')
  getVolunteerBadges(@Param('id', ParseIntPipe) id: number) {
    return this.service.getVolunteerBadges(id)
  }

  @Post('badges')
  @Roles(UserRole.ADMIN)
  createBadge(@Body() body: any) {
    return this.service.createBadge(body)
  }

  @Post('award')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  awardBadge(@Body() body: { volunteerId: number; badgeId: number }) {
    return this.service.awardBadge(body.volunteerId, body.badgeId)
  }

  @Post('check/:volunteerId')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  checkAndAward(@Param('volunteerId', ParseIntPipe) volunteerId: number) {
    return this.service.checkAndAwardBadges(volunteerId)
  }
}
