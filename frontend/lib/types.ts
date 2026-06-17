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

export interface Donation {
  id: number
  doadorNome: string
  doadorEmail?: string | null
  tipo: 'MONETARY' | 'MATERIAL' | 'SERVICE'
  valor?: number | null
  descricao?: string | null
  status: DonationStatus
  dataDoacao?: string | null
  campaignId?: number | null
  campaign?: { id: number; nome: string } | null
  volunteerId?: number | null
  volunteer?: { id: number; nome: string } | null
  createdAt: string
}

export interface Event {
  id: number
  nome: string
  descricao?: string | null
  local?: string | null
  dataInicio?: string | null
  dataFim?: string | null
  status: string
  cargaHoraria?: number | null
  campaignId?: number | null
  campaign?: { id: number; nome: string } | null
  _count?: { registrations: number }
  registrations?: { id: number; volunteerId: number; checkedIn: boolean; volunteer: { id: number; nome: string; email: string } }[]
  createdAt: string
}

export interface Member {
  id: number
  nome: string
  email?: string | null
  telefone?: string | null
  cargo?: string | null
  status: string
  dataEntrada?: string | null
  createdAt: string
}

export interface Certificate {
  id: number
  titulo: string
  descricao?: string | null
  codigoVerificacao: string
  status: string
  volunteerId: number
  volunteer?: { id: number; nome: string } | null
  eventId?: number | null
  event?: { id: number; nome: string } | null
  dataEmissao: string
  dataRevogacao?: string | null
  motivoRevogacao?: string | null
  createdAt: string
}

export interface VolunteerInterest {
  id: number
  nome: string
  email: string
  telefone?: string | null
  mensagem?: string | null
  status: string
  createdAt: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
