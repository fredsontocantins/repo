import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { OrganizationsService } from './organizations.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole } from '@prisma/client'

@ApiTags('Organização')
@ApiBearerAuth()
@Controller('organization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private service: OrganizationsService) {}

  @Get()
  findOne(@CurrentUser() user: any) {
    return this.service.findOne(user.orgId)
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.service.getDashboardStats(user.orgId)
  }

  @Put()
  @Roles(UserRole.ADMIN)
  update(@CurrentUser() user: any, @Body() body: any) {
    return this.service.update(user.orgId, body)
  }
}
