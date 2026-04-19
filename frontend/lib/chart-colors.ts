/**
 * Semantic color palette for charts.
 * Each situation has a distinct, accessible color so viewers can
 * map legend → bar/slice by color alone.
 *
 * Colors keep enough contrast against the white card background
 * (card bg = #ffffff with brand-100 border) while staying on-brand.
 */

export const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#16a34a',
  ONGOING: '#16a34a',
  CONFIRMED: '#16a34a',
  SCHEDULED: '#0ea5e9',
  PENDING: '#f59e0b',
  PAUSED: '#f59e0b',
  DRAFT: '#94a3b8',
  COMPLETED: '#22518a',
  INACTIVE: '#64748b',
  SUSPENDED: '#dc2626',
  CANCELLED: '#dc2626',
  REFUNDED: '#9333ea',
}

export const DONATION_TYPE_COLOR: Record<string, string> = {
  MONETARY: '#16a34a',
  FOOD: '#f97316',
  CLOTHING: '#9333ea',
  MEDICINE: '#dc2626',
  EQUIPMENT: '#0ea5e9',
  SERVICE: '#6366f1',
  OTHER: '#64748b',
}

export const FINANCE_FLOW_COLOR = {
  payable: '#dc2626',
  receivable: '#16a34a',
  netPositive: '#16a34a',
  netNegative: '#dc2626',
  budget: '#22518a',
}

export const SERIES_COLOR = {
  volunteers: '#16a34a',
  donations: '#22518a',
  hours: '#f59e0b',
  events: '#9333ea',
}

export const CHART_AXIS = {
  grid: '#e2e8f0',
  tick: '#475569',
  tickFontSize: 11,
}

export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid #dbe7f3',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 12,
  boxShadow: '0 8px 24px rgba(17, 42, 74, 0.12)',
}

export function statusColor(status: string | undefined | null, fallback = '#64748b') {
  if (!status) return fallback
  return STATUS_COLOR[status.toUpperCase()] ?? fallback
}

export function donationTypeColor(tipo: string | undefined | null, fallback = '#64748b') {
  if (!tipo) return fallback
  return DONATION_TYPE_COLOR[tipo.toUpperCase()] ?? fallback
}

/**
 * Kanban-style palette used by campaign/event cards and status filter chips.
 * Each status has:
 *  - label: pt-BR display name
 *  - bar: strong color for the top stripe / dot / active chip
 *  - bg: soft tint for card backdrop and idle chip background
 *  - text: readable text color on the tint
 */
export interface StatusStyle {
  label: string
  bar: string
  bg: string
  text: string
}

export const CAMPAIGN_STATUS_STYLE: Record<string, StatusStyle> = {
  DRAFT:     { label: 'Rascunho',  bar: '#94a3b8', bg: '#f1f5f9', text: '#334155' },
  ACTIVE:    { label: 'Ativa',     bar: '#16a34a', bg: '#ecfdf5', text: '#166534' },
  PAUSED:    { label: 'Pausada',   bar: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
  COMPLETED: { label: 'Concluída', bar: '#22518a', bg: '#dbeafe', text: '#1e3a8a' },
  CANCELLED: { label: 'Cancelada', bar: '#dc2626', bg: '#fee2e2', text: '#991b1b' },
}

export const EVENT_STATUS_STYLE: Record<string, StatusStyle> = {
  SCHEDULED: { label: 'Agendado',  bar: '#3b82f6', bg: '#dbeafe', text: '#1e40af' },
  ONGOING:   { label: 'Em curso',  bar: '#16a34a', bg: '#dcfce7', text: '#166534' },
  COMPLETED: { label: 'Concluído', bar: '#22518a', bg: '#eff6ff', text: '#1e3a8a' },
  CANCELLED: { label: 'Cancelado', bar: '#dc2626', bg: '#fee2e2', text: '#991b1b' },
}

export const CAMPAIGN_STATUS_ORDER = ['ACTIVE', 'DRAFT', 'PAUSED', 'COMPLETED', 'CANCELLED'] as const
export const EVENT_STATUS_ORDER = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const

export const VOLUNTEER_STATUS_STYLE: Record<string, StatusStyle> = {
  ACTIVE:    { label: 'Ativo',    bar: '#16a34a', bg: '#ecfdf5', text: '#166534' },
  PENDING:   { label: 'Pendente', bar: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
  INACTIVE:  { label: 'Inativo',  bar: '#64748b', bg: '#f1f5f9', text: '#334155' },
  SUSPENDED: { label: 'Suspenso', bar: '#dc2626', bg: '#fee2e2', text: '#991b1b' },
}

export const VOLUNTEER_STATUS_ORDER = ['ACTIVE', 'PENDING', 'INACTIVE', 'SUSPENDED'] as const
