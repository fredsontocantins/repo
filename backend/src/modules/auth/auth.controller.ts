import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, Public } from '../../common/decorators/index'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import type { AuthenticatedUser } from '../../common/types/authenticated-user'

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login com email e senha' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password)
  }

  @Post('register')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Cadastrar novo usuário (VOLUNTEER sem organização)' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.sub)
  }
}
