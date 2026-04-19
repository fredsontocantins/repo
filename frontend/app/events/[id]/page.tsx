'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, Users, MapPin, Clock, Loader2,
  CalendarClock, Building2, Megaphone, UserPlus, Trash2, Check,
} from 'lucide-react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import { EVENT_STATUS_STYLE } from '@/lib/chart-colors'

export default function EventDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [registrations, setRegistrations] = useState<any[]>([])
  const [available, setAvailable] = useState<any[]>([])
  const [selectedVolId, setSelectedVolId] = useState('')
  const [assignBusy, setAssignBusy] = useState(false)
  const [assignFeedback, setAssignFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) {
      setError('ID de evento inválido')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const [ev, regs, volRes] = await Promise.all([
        api.getEvent(id),
        api.getEventVolunteers(id).catch(() => []),
        api.getVolunteers({ status: 'ACTIVE', limit: 100 }).catch(() => ({ data: [] })),
      ])
      setEvent(ev)
      setRegistrations(regs || ev.registrations || [])
      setAvailable(volRes?.data || [])
    } catch (e: any) {
      setError(e?.message || 'Evento não encontrado')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const fmtDate = (v?: string | Date | null) => v ? new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  const registeredIds = useMemo(() => new Set(registrations.map(r => r.volunteer?.id)), [registrations])
  const candidateVolunteers = useMemo(
    () => available.filter(v => !registeredIds.has(v.id)),
    [available, registeredIds],
  )

  async function refreshRegs() {
    try {
      const list = await api.getEventVolunteers(id)
      setRegistrations(list || [])
    } catch { /* silent */ }
  }

  async function handleRegister(e?: React.FormEvent) {
    e?.preventDefault()
    if (!selectedVolId) return
    setAssignBusy(true)
    setAssignFeedback(null)
    try {
      await api.registerEventVolunteer(id, Number(selectedVolId))
      setAssignFeedback({ kind: 'ok', text: 'Voluntário inscrito no evento.' })
      setSelectedVolId('')
      await refreshRegs()
    } catch (err: any) {
      setAssignFeedback({ kind: 'err', text: err?.message || 'Não foi possível inscrever.' })
    } finally {
      setAssignBusy(false)
    }
  }

  async function handleRemove(volunteerId: number) {
    if (!confirm('Remover inscrição deste voluntário?')) return
    setAssignBusy(true)
    setAssignFeedback(null)
    try {
      await api.removeEventVolunteer(id, volunteerId)
      setAssignFeedback({ kind: 'ok', text: 'Inscrição removida.' })
      await refreshRegs()
    } catch (err: any) {
      setAssignFeedback({ kind: 'err', text: err?.message || 'Não foi possível remover.' })
    } finally {
      setAssignBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="animate-spin mr-2" size={18} /> Carregando evento...
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="card p-10 text-center space-y-4">
        <Calendar size={40} className="mx-auto text-slate-400" />
        <div>
          <h1 className="page-title">Evento não encontrado</h1>
          <p className="text-slate-500 text-sm mt-1">{error || 'O evento solicitado não existe ou foi removido.'}</p>
        </div>
        <button className="btn-primary" onClick={() => router.push('/events')}>
          <ArrowLeft size={14} /> Voltar para eventos
        </button>
      </div>
    )
  }

  const statusStyle = EVENT_STATUS_STYLE[event.status] || EVENT_STATUS_STYLE.SCHEDULED
  const capacidade = event.capacidade || 0
  const inscritos = registrations.length
  const ocupacaoPct = capacidade > 0 ? Math.min(100, Math.round((inscritos / capacidade) * 100)) : 0
  const capacidadeEsgotada = capacidade > 0 && inscritos >= capacidade

  return (
    <div className="space-y-6">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <ArrowLeft size={14} /> Voltar para eventos
      </Link>

      <div
        className="card p-0 overflow-hidden"
        style={{ borderTop: `4px solid ${statusStyle.bar}` }}
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <StatusBadge status={event.status} />
              <h1 className="page-title">{event.nome}</h1>
              {event.descricao && <p className="text-slate-600 text-sm max-w-3xl">{event.descricao}</p>}
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('inscrever-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="btn-primary"
            >
              <UserPlus size={16} /> Inscrever voluntário
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
              <div className="flex items-center gap-2 text-brand-700 text-[11px] font-bold uppercase"><CalendarClock size={12} /> Início</div>
              <div className="mt-1 text-sm font-bold text-brand-900">{fmtDate(event.dataInicio)}</div>
            </div>
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
              <div className="flex items-center gap-2 text-brand-700 text-[11px] font-bold uppercase"><CalendarClock size={12} /> Fim</div>
              <div className="mt-1 text-sm font-bold text-brand-900">{fmtDate(event.dataFim)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-700 text-[11px] font-bold uppercase"><Users size={12} /> Inscritos</div>
              <div className="mt-1 text-lg font-bold text-slate-900 font-display">
                {inscritos}{capacidade ? ` / ${capacidade}` : ''}
              </div>
              {capacidade > 0 && (
                <div className="mt-1 w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                  <div className="h-1 bg-brand-500 transition-all" style={{ width: `${ocupacaoPct}%` }} />
                </div>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <div className="flex items-center gap-2 text-amber-700 text-[11px] font-bold uppercase"><MapPin size={12} /> Local</div>
              <div className="mt-1 text-sm font-semibold text-amber-900 truncate">{event.local || '—'}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            {event.campaign && (
              <Link href={`/campaigns/${event.campaign.id}`} className="inline-flex items-center gap-1.5 text-brand-600 font-semibold hover:text-brand-700">
                <Megaphone size={13} /> Campanha: {event.campaign.nome}
              </Link>
            )}
            {event.tipo && (
              <span className="inline-flex items-center gap-1.5"><Building2 size={13} /> Tipo: <strong className="text-slate-700">{event.tipo}</strong></span>
            )}
            <span className="inline-flex items-center gap-1.5"><Clock size={13} /> Criado em <strong className="text-slate-700">{fmtDate(event.createdAt)}</strong></span>
          </div>
        </div>
      </div>

      {/* Allocation panel */}
      <section
        id="inscrever-section"
        className="card p-0 overflow-hidden border-2 border-brand-200"
        style={{ boxShadow: '0 0 0 4px rgba(34, 81, 138, 0.06)' }}
      >
        <header className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base">Inscrever voluntários</h2>
              <p className="text-xs text-white/80">Adicione voluntários ativos a este evento em poucos cliques</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white/15 px-2.5 py-1 rounded-full">
            {inscritos}{capacidade ? ` / ${capacidade}` : ''} inscrito{inscritos !== 1 ? 's' : ''}
          </span>
        </header>

        <div className="p-5 space-y-4">
          {capacidadeEsgotada && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
              Capacidade esgotada ({inscritos}/{capacidade}). Para inscrever mais voluntários, aumente a capacidade do evento.
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col md:flex-row gap-3">
            <select
              className="input flex-1"
              value={selectedVolId}
              onChange={e => setSelectedVolId(e.target.value)}
              disabled={assignBusy || candidateVolunteers.length === 0 || capacidadeEsgotada}
            >
              <option value="">
                {candidateVolunteers.length === 0
                  ? '— Nenhum voluntário ativo disponível —'
                  : 'Selecione um voluntário ativo...'}
              </option>
              {candidateVolunteers.map(v => (
                <option key={v.id} value={v.id}>
                  {v.nome} · {v.email}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="btn-primary md:w-auto"
              disabled={!selectedVolId || assignBusy || capacidadeEsgotada}
            >
              {assignBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Inscrever
            </button>
          </form>

          {candidateVolunteers.length === 0 && available.length > 0 && (
            <p className="text-xs text-slate-500 italic">
              Todos os voluntários ativos já estão inscritos. Cadastre novos em <Link href="/volunteers" className="text-brand-600 font-semibold">Voluntários</Link>.
            </p>
          )}
          {available.length === 0 && (
            <p className="text-xs text-slate-500 italic">
              Nenhum voluntário ativo ainda. Aprove interesses do portal em <Link href="/volunteer-interests" className="text-brand-600 font-semibold">Interesses (Portal)</Link>.
            </p>
          )}

          {assignFeedback && (
            <div className={`p-3 rounded-lg text-sm font-medium border ${
              assignFeedback.kind === 'ok'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {assignFeedback.text}
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Inscrições ({inscritos})</p>
            {inscritos === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Ainda não há inscrições. Use o formulário acima para adicionar voluntários.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {registrations.map((r: any) => (
                  <li key={r.id} className="flex items-center gap-3 py-2.5">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
                      {r.volunteer?.nome?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{r.volunteer?.nome || '—'}</p>
                      <p className="text-xs text-slate-500 truncate">{r.volunteer?.email || '—'}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {r.status || 'INSCRITO'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(r.volunteer.id)}
                      disabled={assignBusy}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remover inscrição"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
