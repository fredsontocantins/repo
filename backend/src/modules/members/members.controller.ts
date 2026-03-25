import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { MembersService } from './members.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole } from '@prisma/client'

@ApiTags('Membros')
@ApiBearerAuth()
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private service: MembersService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: number,
  ) {
    return this.service.findAll(user.orgId, { search, role, page })
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.service.getStats(user.orgId)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.findOne(id, user.orgId)
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.service.create(user.orgId, body)
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body() body: any) {
    return this.service.update(id, user.orgId, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.deactivate(id, user.orgId)
  }
}
