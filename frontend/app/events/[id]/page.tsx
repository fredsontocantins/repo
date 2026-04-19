'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, Users, MapPin, Clock, Loader2,
  CalendarClock, Building2, Megaphone,
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

  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) {
      setError('ID de evento inválido')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.getEvent(id)
      setEvent(res)
    } catch (e: any) {
      setError(e?.message || 'Evento não encontrado')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const fmtDate = (v?: string | Date | null) => v ? new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

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
  const registrations = event.registrations || []
  const capacidade = event.capacidade || 0
  const inscritos = registrations.length
  const ocupacaoPct = capacidade > 0 ? Math.min(100, Math.round((inscritos / capacidade) * 100)) : 0

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

      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users size={14} className="text-brand-600" /> Inscrições ({inscritos})
          </h2>
        </div>
        {inscritos === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">Nenhuma inscrição ainda.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {registrations.map((r: any) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
