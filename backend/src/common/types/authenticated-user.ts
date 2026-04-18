import type { UserRole } from '@prisma/client'
import type { ModuleAccess } from '../../modules/users/users.service'

/** Payload do JWT após validação pelo passport-jwt. */
export interface AuthenticatedUser {
  sub: number
  email: string
  role: UserRole
  orgId: number | null
  modules: ModuleAccess[]
}
