import { clsx } from 'clsx'

const configs: Record<string, { label: string; cls: string }> = {
  ACTIVE:     { label: 'Ativo',       cls: 'bg-green-50 text-green-700' },
  INACTIVE:   { label: 'Inativo',     cls: 'bg-slate-100 text-slate-600' },
  PENDING:    { label: 'Pendente',    cls: 'bg-amber-50 text-amber-700' },
  SUSPENDED:  { label: 'Suspenso',    cls: 'bg-red-50 text-red-600' },
  DRAFT:      { label: 'Rascunho',    cls: 'bg-slate-100 text-slate-600' },
  PAUSED:     { label: 'Pausado',     cls: 'bg-amber-50 text-amber-700' },
  COMPLETED:  { label: 'Concluído',   cls: 'bg-blue-50 text-blue-700' },
  CANCELLED:  { label: 'Cancelado',   cls: 'bg-red-50 text-red-600' },
  CONFIRMED:  { label: 'Confirmado',  cls: 'bg-green-50 text-green-700' },
  REFUNDED:   { label: 'Reembolsado', cls: 'bg-purple-50 text-purple-700' },
  SCHEDULED:  { label: 'Agendado',    cls: 'bg-blue-50 text-blue-700' },
  ONGOING:    { label: 'Em andamento',cls: 'bg-green-50 text-green-700' },
  MONETARY:   { label: 'Monetária',   cls: 'bg-green-50 text-green-700' },
  FOOD:       { label: 'Alimentos',   cls: 'bg-orange-50 text-orange-700' },
  CLOTHING:   { label: 'Roupas',      cls: 'bg-purple-50 text-purple-700' },
  MEDICINE:   { label: 'Medicamentos',cls: 'bg-red-50 text-red-600' },
  EQUIPMENT:  { label: 'Equipamentos',cls: 'bg-blue-50 text-blue-700' },
  SERVICE:    { label: 'Serviço',     cls: 'bg-indigo-50 text-indigo-700' },
  OTHER:      { label: 'Outro',       cls: 'bg-slate-100 text-slate-600' },
}

export default function StatusBadge({ status }: { status: string }) {
  const cfg = configs[status] || { label: status, cls: 'bg-slate-100 text-slate-600' }
  return (
    <span className={clsx('badge-pill', cfg.cls)}>{cfg.label}</span>
  )
}
