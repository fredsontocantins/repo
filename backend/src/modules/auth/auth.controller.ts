import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, Public } from '../../common/decorators/index'

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login com email e senha' })
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password)
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  register(@Body() body: { name: string; email: string; password: string; organizationId?: number }) {
    return this.authService.register(body)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  me(@CurrentUser() user: any) {
    return this.authService.me(user.sub)
  }
}
