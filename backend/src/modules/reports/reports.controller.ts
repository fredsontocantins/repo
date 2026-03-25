import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole } from '@prisma/client'

@ApiTags('Relatórios')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.orgId)
  }

  @Post('generate')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  generate(
    @CurrentUser() user: any,
    @Body() body: { tipo: string; filtros?: any },
  ) {
    return this.service.generate(user.orgId, body.tipo, body.filtros || {}, user.email)
  }
}
