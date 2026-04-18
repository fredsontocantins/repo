import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { getJwtSecret } from '../../common/config/env'
import type { AuthenticatedUser } from '../../common/types/authenticated-user'

interface JwtPayload {
  sub: number
  email: string
  role: AuthenticatedUser['role']
  orgId: number | null
  modules?: AuthenticatedUser['modules']
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    })
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      orgId: payload.orgId,
      modules: payload.modules ?? [],
    }
  }
}
