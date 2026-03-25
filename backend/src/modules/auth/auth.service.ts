import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    })

    if (!user) throw new UnauthorizedException('Credenciais inválidas')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Credenciais inválidas')

    const modules = user.modules ?? []
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId,
      modules,
    }
    const token = this.jwtService.sign(payload)

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        modules,
      },
    }
  }

  async register(data: { name: string; email: string; password: string; organizationId?: number }) {
    const exists = await this.prisma.user.findUnique({ where: { email: data.email } })
    if (exists) throw new ConflictException('Email já cadastrado')

    const passwordHash = await bcrypt.hash(data.password, 10)
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        organizationId: data.organizationId,
      },
      include: { organization: true },
    })

    const modules = user.modules ?? []
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId,
      modules,
    }
    const token = this.jwtService.sign(payload)

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        modules,
      },
    }
  }

  async me(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: true,
        createdAt: true,
        modules: true,
      },
    })
  }
}
