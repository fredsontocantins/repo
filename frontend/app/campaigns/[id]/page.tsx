'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Megaphone, Users, Heart, Calendar, DollarSign,
  Target, CalendarClock, Sparkles, Loader2, ExternalLink,
  UserPlus, Trash2, Check,
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

  // Allocation state
  const [assigned, setAssigned] = useState<any[]>([])
  const [available, setAvailable] = useState<any[]>([])
  const [selectedVolId, setSelectedVolId] = useState('')
  const [assignBusy, setAssignBusy] = useState(false)
  const [assignFeedback, setAssignFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) {
      setError('ID de campanha inválido')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const [c, list, volRes] = await Promise.all([
        api.getCampaign(id),
        api.getCampaignVolunteers(id).catch(() => []),
        api.getVolunteers({ status: 'ACTIVE', limit: 100 }).catch(() => ({ data: [] })),
      ])
      setCampaign(c)
      setAssigned(list || [])
      setAvailable(volRes?.data || [])
    } catch (e: any) {
      setError(e?.message || 'Campanha não encontrada')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)
  const fmtDate = (v?: string | Date | null) => v ? new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const assignedIds = useMemo(() => new Set(assigned.map(a => a.volunteer?.id)), [assigned])
  const candidateVolunteers = useMemo(
    () => available.filter(v => !assignedIds.has(v.id)),
    [available, assignedIds],
  )

  async function refreshAssigned() {
    try {
      const list = await api.getCampaignVolunteers(id)
      setAssigned(list || [])
    } catch { /* keep silent */ }
  }

  async function handleAssign(e?: React.FormEvent) {
    e?.preventDefault()
    if (!selectedVolId) return
    setAssignBusy(true)
    setAssignFeedback(null)
    try {
      await api.addCampaignVolunteer(id, Number(selectedVolId))
      setAssignFeedback({ kind: 'ok', text: 'Voluntário alocado com sucesso.' })
      setSelectedVolId('')
      await refreshAssigned()
    } catch (err: any) {
      setAssignFeedback({ kind: 'err', text: err?.message || 'Não foi possível alocar.' })
    } finally {
      setAssignBusy(false)
    }
  }

  async function handleRemove(volunteerId: number) {
    if (!confirm('Remover este voluntário da campanha?')) return
    setAssignBusy(true)
    setAssignFeedback(null)
    try {
      await api.removeCampaignVolunteer(id, volunteerId)
      setAssignFeedback({ kind: 'ok', text: 'Voluntário removido da campanha.' })
      await refreshAssigned()
    } catch (err: any) {
      setAssignFeedback({ kind: 'err', text: err?.message || 'Não foi possível remover.' })
    } finally {
      setAssignBusy(false)
    }
  }

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
  const volunteersCount = assigned.length
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
            <button
              type="button"
              onClick={() => document.getElementById('alocar-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="btn-primary"
            >
              <UserPlus size={16} /> Alocar voluntário
            </button>
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

      {/* Volunteer allocation panel — destaque */}
      <section
        id="alocar-section"
        className="card p-0 overflow-hidden border-2 border-brand-200"
        style={{ boxShadow: '0 0 0 4px rgba(34, 81, 138, 0.06)' }}
      >
        <header className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base">Alocar voluntários</h2>
              <p className="text-xs text-white/80">Escolha um voluntário ativo e aloque direto nesta campanha</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white/15 px-2.5 py-1 rounded-full">
            {volunteersCount} alocado{volunteersCount !== 1 ? 's' : ''}
          </span>
        </header>

        <div className="p-5 space-y-4">
          <form onSubmit={handleAssign} className="flex flex-col md:flex-row gap-3">
            <select
              className="input flex-1"
              value={selectedVolId}
              onChange={e => setSelectedVolId(e.target.value)}
              disabled={assignBusy || candidateVolunteers.length === 0}
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
              disabled={!selectedVolId || assignBusy}
            >
              {assignBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Alocar
            </button>
          </form>

          {candidateVolunteers.length === 0 && available.length > 0 && (
            <p className="text-xs text-slate-500 italic">
              Todos os voluntários ativos já estão alocados nesta campanha. Cadastre novos em <Link href="/volunteers" className="text-brand-600 font-semibold">Voluntários</Link>.
            </p>
          )}
          {available.length === 0 && (
            <p className="text-xs text-slate-500 italic">
              Nenhum voluntário com status ACTIVE ainda. Aprove interesses do portal em <Link href="/volunteer-interests" className="text-brand-600 font-semibold">Interesses (Portal)</Link> ou cadastre em <Link href="/volunteers" className="text-brand-600 font-semibold">Voluntários</Link>.
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
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Voluntários alocados</p>
            {volunteersCount === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Ainda não há voluntários nesta campanha. Use o formulário acima para alocar.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {assigned.map(cv => (
                  <li key={cv.id} className="flex items-center gap-3 py-2.5">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
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
                    <button
                      type="button"
                      onClick={() => handleRemove(cv.volunteer.id)}
                      disabled={assignBusy}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remover voluntário da campanha"
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

      {/* Recent donations + events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <section className="card p-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-brand-600" /> Eventos vinculados ({campaign.events?.length ?? 0})
          </h2>
          {(!campaign.events || campaign.events.length === 0) ? (
            <p className="text-sm text-slate-500 py-6 text-center">Nenhum evento vinculado.</p>
          ) : (
            <div className="space-y-2">
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
          )}
        </section>
      </div>
    </div>
  )
}
