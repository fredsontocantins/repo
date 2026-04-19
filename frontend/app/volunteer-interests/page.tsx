'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { UsersRound, Mail, Phone, Briefcase, Megaphone, Check, X, Loader2, Clock, Filter, MessageSquare } from 'lucide-react'
import { api } from '@/lib/api'
import StatusFilterChips from '@/components/ui/StatusFilterChips'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { INTEREST_STATUS_STYLE, INTEREST_STATUS_ORDER } from '@/lib/chart-colors'

export default function VolunteerInterestsPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<any>({ total: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 })
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('PENDING')
  const [actionId, setActionId] = useState<number | null>(null)
  const [rejectTarget, setRejectTarget] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [detail, setDetail] = useState<any>(null)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const loadStats = useCallback(async () => {
    try { setStats(await api.getCampaignInterestStats()) } catch (e) { console.error(e) }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { limit: 50 }
      if (status) params.status = status
      const res = await api.getCampaignInterests(params)
      setData(res)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [status])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadStats() }, [loadStats])

  const fmtDate = (v?: string) => v ? new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  async function approve(item: any) {
    setActionId(item.id)
    setFeedback(null)
    try {
      await api.approveCampaignInterest(item.id)
      setFeedback({ kind: 'success', text: `${item.nome} aprovado(a) e cadastrado(a) como voluntário ativo.` })
      await Promise.all([load(), loadStats()])
    } catch (e: any) {
      setFeedback({ kind: 'error', text: e?.message || 'Erro ao aprovar' })
    } finally {
      setActionId(null)
    }
  }

  async function confirmReject() {
    if (!rejectTarget) return
    setActionId(rejectTarget.id)
    setFeedback(null)
    try {
      await api.rejectCampaignInterest(rejectTarget.id, rejectReason || 'Rejeitado pela equipe')
      setFeedback({ kind: 'success', text: `Interesse de ${rejectTarget.nome} rejeitado.` })
      setRejectTarget(null)
      setRejectReason('')
      await Promise.all([load(), loadStats()])
    } catch (e: any) {
      setFeedback({ kind: 'error', text: e?.message || 'Erro ao rejeitar' })
    } finally {
      setActionId(null)
    }
  }

  const statusCounts = useMemo(() => ({
    PENDING: stats?.PENDING ?? 0,
    APPROVED: stats?.APPROVED ?? 0,
    REJECTED: stats?.REJECTED ?? 0,
  }), [stats])

  const items: any[] = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <UsersRound className="text-brand-600" size={24} />
            Interesses de Voluntariado
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Aprove novos voluntários que se inscreveram pelo portal público. Ao aprovar, eles viram voluntários ativos e são alocados à campanha escolhida.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'total', label: 'Total recebidos', value: stats.total ?? 0, bg: 'bg-slate-50', color: 'text-slate-700', icon: UsersRound },
          { key: 'PENDING', label: 'Aguardando aprovação', value: stats.PENDING ?? 0, bg: 'bg-amber-50', color: 'text-amber-700', icon: Clock },
          { key: 'APPROVED', label: 'Aprovados', value: stats.APPROVED ?? 0, bg: 'bg-green-50', color: 'text-green-700', icon: Check },
          { key: 'REJECTED', label: 'Rejeitados', value: stats.REJECTED ?? 0, bg: 'bg-red-50', color: 'text-red-700', icon: X },
        ].map(s => (
          <div key={s.key} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 font-display leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <Filter size={13} /> Filtrar por status
        </div>
        <StatusFilterChips
          styles={INTEREST_STATUS_STYLE}
          order={INTEREST_STATUS_ORDER}
          counts={statusCounts}
          total={stats.total ?? 0}
          value={status}
          onChange={(v) => setStatus(v)}
        />
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${
          feedback.kind === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.text}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={status === 'PENDING' ? 'Nenhum interesse pendente' : 'Nada por aqui'}
          description={
            status === 'PENDING'
              ? 'Quando alguém preencher o formulário de "Quero ser voluntário" no portal público, aparece aqui pra você aprovar ou rejeitar.'
              : 'Nenhum interesse encontrado com esse filtro.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map(item => {
            const s = INTEREST_STATUS_STYLE[item.status] || INTEREST_STATUS_STYLE.PENDING
            const isPending = item.status === 'PENDING'
            const busy = actionId === item.id
            return (
              <div
                key={item.id}
                className="card p-0 overflow-hidden hover:shadow-lg transition-shadow"
                style={{ borderTop: `4px solid ${s.bar}` }}
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                          style={{ backgroundColor: s.bg, color: s.text }}
                        >
                          {s.label}
                        </span>
                        <span className="text-[11px] text-slate-400">#{item.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 truncate">{item.nome}</h3>
                      <p className="text-xs text-slate-500">{fmtDate(item.createdAt)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 text-sm text-slate-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={13} className="text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${item.email}`} className="text-brand-600 hover:underline truncate">{item.email}</a>
                    </div>
                    {item.telefone && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone size={13} className="text-slate-400 flex-shrink-0" />
                        <a href={`tel:${item.telefone}`} className="hover:underline truncate">{item.telefone}</a>
                      </div>
                    )}
                    {item.profissao && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Briefcase size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.profissao}</span>
                      </div>
                    )}
                    {item.campaign && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Megaphone size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 truncate">Campanha: <strong>{item.campaign.nome}</strong></span>
                      </div>
                    )}
                  </div>

                  {item.mensagem && (
                    <button
                      type="button"
                      onClick={() => setDetail(item)}
                      className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 flex items-start gap-2 transition"
                    >
                      <MessageSquare size={13} className="flex-shrink-0 mt-0.5 text-slate-500" />
                      <span className="line-clamp-2">{item.mensagem}</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setDetail(item)}
                      className="btn-outline text-xs py-1.5 px-3"
                    >
                      Ver detalhes
                    </button>
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => approve(item)}
                          disabled={busy}
                          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                          Aprovar
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRejectTarget(item); setRejectReason('') }}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 disabled:opacity-60"
                        >
                          <X size={13} /> Rejeitar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Detalhes do interesse">
        {detail && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Nome</p>
              <p className="font-semibold text-slate-900">{detail.nome}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">E-mail</p>
                <a href={`mailto:${detail.email}`} className="text-brand-600 hover:underline break-all">{detail.email}</a>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Telefone</p>
                <p className="text-slate-800">{detail.telefone || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Profissão</p>
                <p className="text-slate-800">{detail.profissao || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Recebido em</p>
                <p className="text-slate-800">{fmtDate(detail.createdAt)}</p>
              </div>
            </div>
            {detail.campaign && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Campanha desejada</p>
                <p className="text-slate-800">{detail.campaign.nome}</p>
              </div>
            )}
            {detail.mensagem && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Mensagem</p>
                <p className="text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap">{detail.mensagem}</p>
              </div>
            )}
            {detail.status === 'PENDING' && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { approve(detail); setDetail(null) }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  <Check size={14} /> Aprovar
                </button>
                <button
                  type="button"
                  onClick={() => { setRejectTarget(detail); setRejectReason(''); setDetail(null) }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                >
                  <X size={14} /> Rejeitar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} title="Rejeitar interesse">
        {rejectTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Você está rejeitando o interesse de <strong className="text-slate-900">{rejectTarget.nome}</strong>.
              Adicione um motivo (opcional) que fica registrado.
            </p>
            <textarea
              className="input min-h-[100px]"
              placeholder="Motivo (opcional) — ex: campanha encerrada, perfil não se encaixa, etc."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2">
              <button className="btn-outline text-sm" onClick={() => setRejectTarget(null)}>Cancelar</button>
              <button
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                onClick={confirmReject}
                disabled={actionId === rejectTarget.id}
              >
                {actionId === rejectTarget.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                Confirmar rejeição
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
