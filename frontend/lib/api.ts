// /proxy é reescrito pelo Next.js para o backend interno (ver next.config.js)
import type { AuthUser, Campaign, LoginResponse, Paginated, Volunteer } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const API_PROXY = process.env.NEXT_PUBLIC_API_PROXY || '/proxy'

function getApiUrl() {
  if (typeof window !== 'undefined') return API_PROXY
  return API_URL
}

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${getApiUrl()}${path}`, { ...options, headers })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }
    throw new Error('Sessão expirada')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erro na requisição')
  return data
}

async function publicRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erro')
  return data
}

const qs = (p?: Record<string, any>) =>
  p ? '?' + new URLSearchParams(
    Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ''))
  ).toString() : ''

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<AuthUser>('/auth/me'),

  // Users
  getUsers: (p?: Record<string, any>) => request<any>(`/users${qs(p)}`),
  createUser: (data: any) => request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) => request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deactivateUser: (id: number) => request<any>(`/users/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: () => request<any>('/organization/dashboard'),

  // Volunteers
  getVolunteers: (p?: Record<string, any>) => request<Paginated<Volunteer>>(`/volunteers${qs(p)}`),
  getVolunteer: (id: number) => request<Volunteer>(`/volunteers/${id}`),
  getVolunteerStats: () => request<any>('/volunteers/stats'),
  createVolunteer: (data: any) => request<any>('/volunteers', { method: 'POST', body: JSON.stringify(data) }),
  updateVolunteer: (id: number, data: any) => request<any>(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVolunteer: (id: number) => request<any>(`/volunteers/${id}`, { method: 'DELETE' }),
  addPoints: (id: number, points: number) => request<any>(`/volunteers/${id}/points`, { method: 'POST', body: JSON.stringify({ points }) }),

  // Campaigns
  getCampaigns: (p?: Record<string, any>) => request<Paginated<Campaign>>(`/campaigns${qs(p)}`),
  getCampaign: (id: number) => request<Campaign>(`/campaigns/${id}`),
  getCampaignStats: () => request<any>('/campaigns/stats'),
  createCampaign: (data: any) => request<any>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id: number, data: any) => request<any>(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getCampaignVolunteers: (campaignId: number) => request<any>(`/campaigns/${campaignId}/volunteers`),
  addCampaignVolunteer: (campaignId: number, volunteerId: number) =>
    request<any>(`/campaigns/${campaignId}/volunteers`, { method: 'POST', body: JSON.stringify({ volunteerId }) }),
  removeCampaignVolunteer: (campaignId: number, volunteerId: number) =>
    request<any>(`/campaigns/${campaignId}/volunteers/${volunteerId}`, { method: 'DELETE' }),

  // Donations
  getDonations: (p?: Record<string, any>) => request<any>(`/donations${qs(p)}`),
  getDonationStats: () => request<any>('/donations/stats'),
  createDonation: (data: any) => request<any>('/donations', { method: 'POST', body: JSON.stringify(data) }),

  // Events
  getEvents: (p?: Record<string, any>) => request<any>(`/events${qs(p)}`),
  getEvent: (id: number) => request<any>(`/events/${id}`),
  createEvent: (data: any) => request<any>('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: number, data: any) => request<any>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getEventVolunteers: (eventId: number) => request<any>(`/events/${eventId}/volunteers`),
  registerEventVolunteer: (eventId: number, volunteerId: number) =>
    request<any>(`/events/${eventId}/register`, { method: 'POST', body: JSON.stringify({ volunteerId }) }),
  removeEventVolunteer: (eventId: number, volunteerId: number) =>
    request<any>(`/events/${eventId}/volunteers/${volunteerId}`, { method: 'DELETE' }),

  // Gamification
  getLeaderboard: () => request<any>('/gamification/leaderboard'),
  getBadges: () => request<any>('/gamification/badges'),
  getGamificationStats: () => request<any>('/gamification/stats'),
  awardBadge: (volunteerId: number, badgeId: number) =>
    request<any>('/gamification/award', { method: 'POST', body: JSON.stringify({ volunteerId, badgeId }) }),
  checkBadges: (volunteerId: number) =>
    request<any>(`/gamification/check/${volunteerId}`, { method: 'POST' }),

  // Certificates
  getCertificates: (p?: Record<string, any>) => request<any>(`/certificates${qs(p)}`),
  getCertificate: (id: number) => request<any>(`/certificates/${id}`),
  getCertificateStats: () => request<any>('/certificates/stats'),
  createCertificate: (data: any) => request<any>('/certificates', { method: 'POST', body: JSON.stringify(data) }),
  issueBulkCertificates: (data: any) => request<any>('/certificates/bulk', { method: 'POST', body: JSON.stringify(data) }),
  revokeCertificate: (id: number, motivoRevogacao: string) =>
    request<any>(`/certificates/${id}/revoke`, { method: 'PUT', body: JSON.stringify({ motivoRevogacao }) }),
  verifyCertificate: (codigo: string) => publicRequest<any>(`/certificates/verify/${codigo}`),

  // Members
  getMembers: (p?: Record<string, any>) => request<any>(`/members${qs(p)}`),
  getMember: (id: number) => request<any>(`/members/${id}`),
  getMemberStats: () => request<any>('/members/stats'),
  createMember: (data: any) => request<any>('/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id: number, data: any) => request<any>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deactivateMember: (id: number) => request<any>(`/members/${id}`, { method: 'DELETE' }),

  // Reports
  getReports: () => request<any>('/reports'),
  generateReport: (tipo: string, filtros?: any) =>
    request<any>('/reports/generate', { method: 'POST', body: JSON.stringify({ tipo, filtros }) }),

  // Organization
  getOrganization: () => request<any>('/organization'),
  updateOrganization: (data: any) =>
    request<any>('/organization', { method: 'PUT', body: JSON.stringify(data) }),

  // Public (sem auth)
  publicGetOrg: (slug: string) => publicRequest<any>(`/public/org/${slug}`),
  publicGetStats: (slug: string) => publicRequest<any>(`/public/org/${slug}/stats`),
  publicGetCampaigns: (slug: string, p?: Record<string, any>) =>
    publicRequest<any>(`/public/org/${slug}/campaigns${qs(p)}`),
  publicGetCampaignDetail: (slug: string, id: number) =>
    publicRequest<any>(`/public/org/${slug}/campaigns/${id}`),
  publicGetEvents: (slug: string, params?: Record<string, any>) =>
    publicRequest<any>(`/public/org/${slug}/events${qs(params)}`),
  publicGetLeaderboard: (slug: string, params?: Record<string, any>) =>
    publicRequest<any>(`/public/org/${slug}/leaderboard${qs(params)}`),
  publicExpressInterest: (slug: string, campaignId: number, data: Record<string, any>) =>
    publicRequest<any>(`/public/org/${slug}/campaigns/${campaignId}/interest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  publicVolunteerIntent: (slug: string, data: Record<string, any>) =>
    publicRequest<any>(`/public/org/${slug}/volunteer-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  publicDonationIntent: (slug: string, data: Record<string, any>) =>
    publicRequest<any>(`/public/org/${slug}/donation-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Campaign interests (admin)
  getCampaignInterests: (params?: Record<string, any>) => request<any>(`/campaign-interests${qs(params)}`),
  approveCampaignInterest: (id: number) => request<any>(`/campaign-interests/${id}/approve`, { method: 'PUT' }),
  rejectCampaignInterest: (id: number, motivo: string) =>
    request<any>(`/campaign-interests/${id}/reject`, { method: 'PUT', body: JSON.stringify({ motivo }) }),

  // Finance - Payables
  getFinanceDashboard: () => request<any>('/finance/dashboard'),
  getPayables: (p?: Record<string, any>) => request<any>(`/finance/payables${qs(p)}`),
  createPayable: (data: any) =>
    request<any>('/finance/payables', { method: 'POST', body: JSON.stringify(data) }),
  updatePayable: (id: number, data: any) =>
    request<any>(`/finance/payables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  liquidarPayable: (id: number, data: any) =>
    request<any>(`/finance/payables/${id}/liquidar`, { method: 'PUT', body: JSON.stringify(data) }),
  estornarPayable: (id: number, motivo: string) =>
    request<any>(`/finance/payables/${id}/estornar`, { method: 'PUT', body: JSON.stringify({ motivo }) }),
  cancelarPayable: (id: number, motivo: string) =>
    request<any>(`/finance/payables/${id}/cancelar`, { method: 'PUT', body: JSON.stringify({ motivo }) }),

  // Finance - Receivables
  getReceivables: (p?: Record<string, any>) => request<any>(`/finance/receivables${qs(p)}`),
  createReceivable: (data: any) =>
    request<any>('/finance/receivables', { method: 'POST', body: JSON.stringify(data) }),
  updateReceivable: (id: number, data: any) =>
    request<any>(`/finance/receivables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  liquidarReceivable: (id: number, data: any) =>
    request<any>(`/finance/receivables/${id}/liquidar`, { method: 'PUT', body: JSON.stringify(data) }),
  estornarReceivable: (id: number, motivo: string) =>
    request<any>(`/finance/receivables/${id}/estornar`, { method: 'PUT', body: JSON.stringify({ motivo }) }),
  cancelarReceivable: (id: number, motivo: string) =>
    request<any>(`/finance/receivables/${id}/cancelar`, { method: 'PUT', body: JSON.stringify({ motivo }) }),
}
