import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { CertificatesService } from './certificates.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser, Roles, Public } from '../../common/decorators/index'
import { UserRole, CertificateType } from '@prisma/client'

@ApiTags('Certificados')
@Controller('certificates')
export class CertificatesController {
  constructor(private service: CertificatesService) {}

  /** Verificação pública — sem login */
  @Get('verify/:codigo')
  @Public()
  @ApiOperation({ summary: 'Verificar certificado por código (público)' })
  verify(@Param('codigo') codigo: string) {
    return this.service.verifyByCodigo(codigo)
  }

  /** Rotas protegidas */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  findAll(
    @CurrentUser() user: any,
    @Query('volunteerId') volunteerId?: number,
    @Query('tipo') tipo?: CertificateType,
    @Query('page') page?: number,
  ) {
    return this.service.findAll(user.orgId, { volunteerId, tipo, page })
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  getStats(@CurrentUser() user: any) {
    return this.service.getStats(user.orgId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.findOne(id, user.orgId)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Emitir certificado individual' })
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.service.create(user.orgId, { ...body, emitidoPor: user.email })
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Emitir certificados em lote' })
  issueBulk(@CurrentUser() user: any, @Body() body: any) {
    return this.service.issueBulk(user.orgId, { ...body, emitidoPor: user.email })
  }

  @Put(':id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revogar certificado' })
  revoke(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body('motivoRevogacao') motivo: string,
  ) {
    return this.service.revoke(id, user.orgId, motivo)
  }
}
