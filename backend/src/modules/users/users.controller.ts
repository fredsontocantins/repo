import { Controller, Get, Post, Put, Delete, Body, Query, Param, ParseIntPipe, BadRequestException } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole } from '@prisma/client'
import type { AuthenticatedUser } from '../../common/types/authenticated-user'
import { CreateUserDto, UpdateUserDto, UpdateUserModulesDto } from './dto/user.dto'

@ApiTags('Usuários')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  private resolveOrg(user: AuthenticatedUser, overrideOrgId?: number): number | undefined {
    if (user.role === UserRole.SUPER_ADMIN) return overrideOrgId
    return user.orgId ?? undefined
  }

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('orgId') orgId?: number,
  ) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.list(targetOrg, { page, limit, search })
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser, @Query('orgId') orgId?: number) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.getById(id, targetOrg)
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateUserDto) {
    const orgContext = user.role === UserRole.SUPER_ADMIN ? body.organizationId : user.orgId
    if (!orgContext) throw new BadRequestException('Organização obrigatória para cadastro')
    return this.usersService.create(orgContext, body as any)
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser, @Body() body: UpdateUserDto, @Query('orgId') orgId?: number) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.update(id, targetOrg, body as any)
  }

  @Put(':id/modules')
  updateModules(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateUserModulesDto,
    @Query('orgId') orgId?: number,
  ) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.update(id, targetOrg, { modules: body.modules as any })
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser, @Query('orgId') orgId?: number) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.remove(id, targetOrg)
  }
}
