import { Controller, Get, Post, Put, Delete, Body, Query, Param, ParseIntPipe, BadRequestException } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service'
import type { ModuleAccess } from './users.service'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole } from '@prisma/client'

class CreateUserDto {
  name!: string
  email!: string
  password!: string
  role?: UserRole
  organizationId?: number
  modules?: ModuleAccess[]
}

class UpdateUserDto {
  name?: string
  email?: string
  role?: UserRole
  password?: string
  isActive?: boolean
  modules?: ModuleAccess[]
}

@ApiTags('Usuários')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  private resolveOrg(user: any, overrideOrgId?: number) {
    if (user.role === UserRole.SUPER_ADMIN) return overrideOrgId
    return user.orgId
  }

  @Get()
  list(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('orgId') orgId?: number,
  ) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.list(targetOrg, { page, limit, search })
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Query('orgId') orgId?: number) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.getById(id, targetOrg)
  }

  @Post()
  create(@CurrentUser() user: any, @Body() body: CreateUserDto) {
    const orgContext = user.role === UserRole.SUPER_ADMIN ? body.organizationId : user.orgId
    if (!orgContext) throw new BadRequestException('Organização obrigatória para cadastro')
    return this.usersService.create(orgContext, body)
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body() body: UpdateUserDto, @Query('orgId') orgId?: number) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.update(id, targetOrg, body)
  }

  @Put(':id/modules')
  updateModules(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body('modules') modules: ModuleAccess[],
    @Query('orgId') orgId?: number,
  ) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.update(id, targetOrg, { modules })
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Query('orgId') orgId?: number) {
    const targetOrg = this.resolveOrg(user, orgId)
    return this.usersService.remove(id, targetOrg)
  }
}
