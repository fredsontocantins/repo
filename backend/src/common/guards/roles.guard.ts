import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) return true

    const { user } = context.switchToHttp().getRequest()
    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 4,
      [UserRole.ADMIN]: 3,
      [UserRole.COORDINATOR]: 2,
      [UserRole.VOLUNTEER]: 1,
    }

    const userLevel = roleHierarchy[user.role] || 0
    const hasRole = requiredRoles.some((role) => userLevel >= roleHierarchy[role])

    if (!hasRole) {
      throw new ForbiddenException('Você não tem permissão para esta ação')
    }

    return true
  }
}
