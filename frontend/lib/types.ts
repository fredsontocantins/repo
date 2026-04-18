/**
 * Tipos mínimos de domínio compartilhados entre páginas.
 * Mantenha sincronizado com `backend/prisma/schema.prisma` e os DTOs.
 */

import type { ModuleAccess } from './permissions'

export type { ModuleAccess } from './permissions'

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'VOLUNTEER'

export type VolunteerStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLOCKED'

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'

export type DonationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface Organization {
  id: number
  name: string
  slug?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  logoUrl?: string | null
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  organizationId?: number | null
  organization?: Organization | null
  modules?: ModuleAccess[] | null
  avatarUrl?: string | null
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface Volunteer {
  id: number
  nome: string
  email?: string | null
  telefone?: string | null
  status: VolunteerStatus
  pontos: number
  createdAt: string
}

export interface Campaign {
  id: number
  nome: string
  descricao?: string | null
  status: CampaignStatus
  metaArrecadacao?: number | null
  totalArrecadado: number
  voluntariosAtivos: number
  dataInicio?: string | null
  dataFim?: string | null
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
