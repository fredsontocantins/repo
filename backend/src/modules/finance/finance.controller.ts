import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { FinanceService } from './finance.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles } from '../../common/decorators/index'
import { UserRole } from '@prisma/client'

@ApiTags('Financeiro')
@ApiBearerAuth()
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private service: FinanceService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard financeiro com todos os resumos' })
  getDashboard(@CurrentUser() user: any) {
    return this.service.getDashboard(user.orgId)
  }

  // ── PAYABLES ─────────────────────────────────────────────────────────────────

  @Get('payables')
  @ApiOperation({ summary: 'Listar contas a pagar' })
  findPayables(@CurrentUser() user: any, @Query() query: any) {
    return this.service.findAllPayables(user.orgId, query)
  }

  @Post('payables')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar conta a pagar' })
  createPayable(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createPayable(user.orgId, body)
  }

  @Put('payables/:id')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  updatePayable(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body() body: any) {
    return this.service.updatePayable(id, user.orgId, body)
  }

  @Put('payables/:id/liquidar')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Liquidar (pagar) conta' })
  liquidarPayable(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body() body: any) {
    return this.service.liquidarPayable(id, user.orgId, body)
  }

  @Put('payables/:id/estornar')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Estornar pagamento' })
  estornarPayable(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body('motivo') motivo: string) {
    return this.service.estornarPayable(id, user.orgId, motivo)
  }

  @Put('payables/:id/cancelar')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancelar conta a pagar' })
  cancelarPayable(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body('motivo') motivo: string) {
    return this.service.cancelarPayable(id, user.orgId, motivo)
  }

  // ── RECEIVABLES ───────────────────────────────────────────────────────────────

  @Get('receivables')
  @ApiOperation({ summary: 'Listar contas a receber' })
  findReceivables(@CurrentUser() user: any, @Query() query: any) {
    return this.service.findAllReceivables(user.orgId, query)
  }

  @Post('receivables')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar conta a receber' })
  createReceivable(@CurrentUser() user: any, @Body() body: any) {
    return this.service.createReceivable(user.orgId, body)
  }

  @Put('receivables/:id')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  updateReceivable(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body() body: any) {
    return this.service.updateReceivable(id, user.orgId, body)
  }

  @Put('receivables/:id/liquidar')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Liquidar (receber) conta' })
  liquidarReceivable(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body() body: any) {
    return this.service.liquidarReceivable(id, user.orgId, body)
  }

  @Put('receivables/:id/estornar')
  @Roles(UserRole.ADMIN)
  estornarReceivable(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body('motivo') motivo: string) {
    return this.service.estornarReceivable(id, user.orgId, motivo)
  }

  @Put('receivables/:id/cancelar')
  @Roles(UserRole.ADMIN)
  cancelarReceivable(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any, @Body('motivo') motivo: string) {
    return this.service.cancelarReceivable(id, user.orgId, motivo)
  }
}
