'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Megaphone, Users, Heart, Calendar, DollarSign,
  Target, CalendarClock, Sparkles, Loader2, ExternalLink,
} from 'lucide-react'
import { api } from '@/lib/api'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusBadge from '@/components/ui/StatusBadge'
import { CAMPAIGN_STATUS_STYLE } from '@/lib/chart-colors'

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) {
      setError('ID de campanha inválido')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.getCampaign(id)
      setCampaign(res)
    } catch (e: any) {
      setError(e?.message || 'Campanha não encontrada')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)
  const fmtDate = (v?: string | Date | null) => v ? new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="animate-spin mr-2" size={18} /> Carregando campanha...
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="card p-10 text-center space-y-4">
        <Megaphone size={40} className="mx-auto text-slate-400" />
        <div>
          <h1 className="page-title">Campanha não encontrada</h1>
          <p className="text-slate-500 text-sm mt-1">{error || 'A campanha solicitada não existe ou foi removida.'}</p>
        </div>
        <button className="btn-primary" onClick={() => router.push('/campaigns')}>
          <ArrowLeft size={14} /> Voltar para campanhas
        </button>
      </div>
    )
  }

  const statusStyle = CAMPAIGN_STATUS_STYLE[campaign.status] || CAMPAIGN_STATUS_STYLE.DRAFT
  const arrecadado = Number(campaign.arrecadado || 0)
  const meta = Number(campaign.metaArrecadacao || 0)
  const progresso = meta > 0 ? Math.min(100, Math.round((arrecadado / meta) * 100)) : 0
  const restante = Math.max(0, meta - arrecadado)
  const volunteersCount = campaign.volunteers?.length ?? campaign._count?.volunteers ?? 0
  const donationsCount = campaign._count?.donations ?? campaign.donations?.length ?? 0

  return (
    <div className="space-y-6">
      <Link href="/campaigns" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <ArrowLeft size={14} /> Voltar para campanhas
      </Link>

      {/* Header card */}
      <div
        className="card p-0 overflow-hidden"
        style={{ borderTop: `4px solid ${statusStyle.bar}` }}
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={campaign.status} />
                {campaign.destaque && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    <Sparkles size={11} /> Em destaque
                  </span>
                )}
              </div>
              <h1 className="page-title">{campaign.nome}</h1>
              {campaign.descricao && <p className="text-slate-600 text-sm max-w-3xl">{campaign.descricao}</p>}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3">
              <div className="flex items-center gap-2 text-green-700 text-[11px] font-bold uppercase"><DollarSign size={12} /> Arrecadado</div>
              <div className="mt-1 text-lg font-bold text-green-900 font-display">{fmtBRL(arrecadado)}</div>
            </div>
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
              <div className="flex items-center gap-2 text-brand-700 text-[11px] font-bold uppercase"><Target size={12} /> Meta</div>
              <div className="mt-1 text-lg font-bold text-brand-900 font-display">{fmtBRL(meta)}</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <div className="flex items-center gap-2 text-amber-700 text-[11px] font-bold uppercase"><Heart size={12} /> Doações</div>
              <div className="mt-1 text-lg font-bold text-amber-900 font-display">{donationsCount}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-700 text-[11px] font-bold uppercase"><Users size={12} /> Voluntários</div>
              <div className="mt-1 text-lg font-bold text-slate-900 font-display">{volunteersCount}</div>
            </div>
          </div>

          {meta > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{progresso}% da meta</span>
                <span>{restante > 0 ? `Faltam ${fmtBRL(restante)}` : 'Meta batida 🎉'}</span>
              </div>
              <ProgressBar value={arrecadado} max={meta} size="md" />
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5"><CalendarClock size={13} /> Início: <strong className="text-slate-700">{fmtDate(campaign.dataInicio)}</strong></span>
            <span className="inline-flex items-center gap-1.5"><CalendarClock size={13} /> Fim: <strong className="text-slate-700">{fmtDate(campaign.dataFim)}</strong></span>
            <span className="inline-flex items-center gap-1.5"><Sparkles size={13} /> Criada em <strong className="text-slate-700">{fmtDate(campaign.createdAt)}</strong></span>
            {campaign.publicavel && (
              <Link
                href={`/portal/${campaign.organization?.slug || ''}/campaigns/${campaign.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-brand-600 font-semibold hover:text-brand-700"
              >
                <ExternalLink size={12} /> Ver no portal público
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2-col: volunteers + recent donations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users size={14} className="text-brand-600" /> Voluntários alocados ({volunteersCount})
            </h2>
          </div>
          {volunteersCount === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Ninguém alocado ainda. Use <Link href="/campaigns" className="text-brand-600 font-semibold">"Alocar voluntários"</Link> na lista.</p>
          ) : (
            <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {campaign.volunteers?.map((cv: any) => (
                <li key={cv.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                    {cv.volunteer?.nome?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{cv.volunteer?.nome || '—'}</p>
                    <p className="text-xs text-slate-500 truncate">{cv.volunteer?.email || '—'}</p>
                  </div>
                  {cv.volunteer?.status && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {cv.volunteer.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Heart size={14} className="text-brand-600" /> Doações recentes
            </h2>
          </div>
          {(!campaign.donations || campaign.donations.length === 0) ? (
            <p className="text-sm text-slate-500 py-6 text-center">Nenhuma doação registrada ainda.</p>
          ) : (
            <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {campaign.donations.map((d: any) => (
                <li key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{d.doadorNome || 'Anônimo'}</p>
                    <p className="text-xs text-slate-500">{fmtDate(d.createdAt)} · {d.tipo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-700">{d.valor ? fmtBRL(Number(d.valor)) : '—'}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-500">{d.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Events */}
      {campaign.events?.length > 0 && (
        <section className="card p-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-brand-600" /> Eventos vinculados ({campaign.events.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaign.events.map((ev: any) => (
              <Link key={ev.id} href={`/events/${ev.id}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-brand-50 transition">
                <Calendar size={16} className="text-brand-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{ev.nome}</p>
                  <p className="text-xs text-slate-500">{fmtDate(ev.dataInicio)} · {ev.local || '—'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
