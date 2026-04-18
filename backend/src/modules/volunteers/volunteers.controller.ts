import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { VolunteersService } from './volunteers.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole, VolunteerStatus } from '@prisma/client'
import type { AuthenticatedUser } from '../../common/types/authenticated-user'
import { AddPointsDto, CreateVolunteerDto, UpdateVolunteerDto } from './dto/volunteer.dto'

@ApiTags('Voluntários')
@ApiBearerAuth()
@Controller('volunteers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VolunteersController {
  constructor(private volunteersService: VolunteersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os voluntários' })
  @ApiQuery({ name: 'status', enum: VolunteerStatus, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: VolunteerStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.volunteersService.findAll(user.orgId!, { status, search, page, limit })
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas dos voluntários' })
  getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.volunteersService.getStats(user.orgId!)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar voluntário por ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.volunteersService.findOne(id, user.orgId!)
  }

  @Post()
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar novo voluntário' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateVolunteerDto) {
    return this.volunteersService.create(user.orgId!, body)
  }

  @Put(':id')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar voluntário' })
  update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser, @Body() body: UpdateVolunteerDto) {
    return this.volunteersService.update(id, user.orgId!, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desativar voluntário' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.volunteersService.remove(id, user.orgId!)
  }

  @Post(':id/points')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Adicionar pontos ao voluntário' })
  addPoints(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser, @Body() body: AddPointsDto) {
    return this.volunteersService.addPoints(id, user.orgId!, body.points)
  }
}
