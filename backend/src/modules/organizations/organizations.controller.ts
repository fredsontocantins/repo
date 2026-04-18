import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { OrganizationsService } from './organizations.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole } from '@prisma/client'
import type { AuthenticatedUser } from '../../common/types/authenticated-user'
import { UpdateOrganizationDto } from './dto/organization.dto'

@ApiTags('Organização')
@ApiBearerAuth()
@Controller('organization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private service: OrganizationsService) {}

  @Get()
  findOne(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findOne(user.orgId!)
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.service.getDashboardStats(user.orgId!)
  }

  @Put()
  @Roles(UserRole.ADMIN)
  update(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateOrganizationDto) {
    return this.service.update(user.orgId!, body)
  }
}
