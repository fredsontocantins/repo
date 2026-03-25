import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { EventsService } from './events.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole } from '@prisma/client'

@ApiTags('Eventos')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('status') status?: string, @Query('page') page?: number) {
    return this.eventsService.findAll(user.orgId, { status, page })
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.eventsService.findOne(id, user.orgId)
  }

  @Post()
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.eventsService.create(user.orgId, body)
  }

  @Put(':id')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body() body: any) {
    return this.eventsService.update(id, user.orgId, body)
  }

  @Post(':id/register')
  register(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body('volunteerId') volunteerId: number) {
    return this.eventsService.register(id, volunteerId, user.orgId)
  }

  @Get(':id/volunteers')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  listVolunteers(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.eventsService.listRegistrations(id, user.orgId)
  }

  @Post(':id/checkin')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  checkin(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body('volunteerId') volunteerId: number) {
    return this.eventsService.checkin(id, volunteerId, user.orgId)
  }

  @Delete(':id/volunteers/:volunteerId')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  unregisterVolunteer(
    @Param('id', ParseIntPipe) id: number,
    @Param('volunteerId', ParseIntPipe) volunteerId: number,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.unregister(id, volunteerId, user.orgId)
  }
}
