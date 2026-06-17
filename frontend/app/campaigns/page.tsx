'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Megaphone, Plus, Search, Users, DollarSign, UserPlus, Trash2, Sparkles, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import StatusFilterChips from '@/components/ui/StatusFilterChips'
import ProgressBar from '@/components/ui/ProgressBar'
import EmptyState from '@/components/ui/EmptyState'
import { CAMPAIGN_STATUS_STYLE, CAMPAIGN_STATUS_ORDER } from '@/lib/chart-colors'

export default function CampaignsPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [interests, setInterests] = useState<any>(null)
  const [interestLoading, setInterestLoading] = useState(false)
  const [selectedInterest, setSelectedInterest] = useState<any>(null)
  const [interestFeedback, setInterestFeedback] = useState('')
  const [rejectMotivo, setRejectMotivo] = useState('')
  const [interestActionLoading, setInterestActionLoading] = useState(false)
  const [assignmentModal, setAssignmentModal] = useState<any>(null)
  const [availableVolunteers, setAvailableVolunteers] = useState<any[]>([])
  const [assignedVolunteers, setAssignedVolunteers] = useState<any[]>([])
  const [assignmentFetching, setAssignmentFetching] = useState(false)
  const [assignmentProcessing, setAssignmentProcessing] = useState(false)
  const [assignmentVolunteerId, setAssignmentVolunteerId] = useState('')
  const [assignmentFeedback, setAssignmentFeedback] = useState('')

  const load = useCallback(async (skipStats = false) => {
    setLoading(true)
    try {
      const params: any = { limit: 200 }
      if (search) params.search = search
      const [res, s] = await Promise.all([api.getCampaigns(params), skipStats || stats ? null : api.getCampaignStats()])
      setData(res)
      if (s) setStats(s)
    } finally {
      setLoading(false)
    }
  }, [search, stats])

  const loadInterests = useCallback(async () => {
    setInterestLoading(true)
    try {
      setInterests(await api.getCampaignInterests({ status: 'PENDING', limit: 6 }))
    } finally {
      setInterestLoading(false)
    }
  }, [])

  const refreshAll = useCallback(() => {
    load()
    loadInterests()
  }, [load, loadInterests])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const loadAvailableVolunteers = useCallback(async () => {
    try {
      const res = await api.getVolunteers({ status: 'ACTIVE', limit: 80 })
      setAvailableVolunteers(res?.data || [])
    } catch (error) {
      console.error('Erro ao buscar voluntários ativos', error)
    }
  }, [])

  useEffect(() => { loadAvailableVolunteers() }, [loadAvailableVolunteers])

  const loadAssignedVolunteers = useCallback(async (campaignId: number) => {
    setAssignmentFetching(true)
    try {
      const list = await api.getCampaignVolunteers(campaignId)
      setAssignedVolunteers(list || [])
    } catch (error: any) {
      console.error('Falha ao carregar voluntários alocados', error)
      setAssignmentFeedback(error?.message || 'Não foi possível carregar os voluntários.')
    } finally {
      setAssignmentFetching(false)
    }
  }, [])

  const openAssignmentModal = useCallback(async (campaign: any) => {
    setAssignmentModal(campaign)
    setAssignmentVolunteerId('')
    setAssignmentFeedback('')
    await loadAssignedVolunteers(campaign.id)
  }, [loadAssignedVolunteers])

  const closeAssignmentModal = () => {
    setAssignmentModal(null)
    setAssignedVolunteers([])
    setAssignmentFeedback('')
    setAssignmentVolunteerId('')
  }

  async function handleInterestAction(action: 'approve' | 'reject', interest: any) {
    if (!interest) return
    if (action === 'reject' && !rejectMotivo.trim()) {
      alert('Informe um motivo para rejeitar a intenção.')
      return
    }
    setInterestActionLoading(true)
    try {
      if (action === 'approve') {
        await api.approveCampaignInterest(interest.id)
        setInterestFeedback('Intenção aprovada e voluntário criado para análise.')
      } else {
        await api.rejectCampaignInterest(interest.id, rejectMotivo)
        setInterestFeedback('Intenção marcada como rejeitada.')
      }
      setRejectMotivo('')
      refreshAll()
    } catch (error: any) {
      alert(error.message || 'Não foi possível atualizar a intenção.')
    } finally {
      setInterestActionLoading(false)
    }
  }

  async function handleAssignVolunteer(e: React.FormEvent) {
    e.preventDefault()
    if (!assignmentModal || !assignmentVolunteerId) return
    setAssignmentProcessing(true)
    try {
      await api.addCampaignVolunteer(assignmentModal.id, Number(assignmentVolunteerId))
      setAssignmentFeedback('Voluntário alocado com sucesso.')
      setAssignmentVolunteerId('')
      await loadAssignedVolunteers(assignmentModal.id)
    } catch (error: any) {
      setAssignmentFeedback(error?.message || 'Não foi possível alocar o voluntário.')
    } finally {
      setAssignmentProcessing(false)
    }
  }

  const candidateVolunteers = useMemo(() => {
    const assignedIds = new Set(assignedVolunteers.map(v => v.volunteer?.id))
    return availableVolunteers.filter(v => !assignedIds.has(v.id))
  }, [availableVolunteers, assignedVolunteers])

  const countsByStatus = useMemo(() => {
    const acc: Record<string, number> = { ACTIVE: 0, DRAFT: 0, PAUSED: 0, COMPLETED: 0, CANCELLED: 0 }
    data?.data?.forEach((c: any) => { if (acc[c.status] !== undefined) acc[c.status] += 1 })
    return acc
  }, [data])

  const totalCount = data?.data?.length ?? 0

  const filteredCampaigns = useMemo(() => {
    if (!status) return data?.data ?? []
    return (data?.data ?? []).filter((c: any) => c.status === status)
  }, [data, status])

  const { activeCampaigns, inactiveCampaigns } = useMemo(() => {
    const all = filteredCampaigns
    return {
      activeCampaigns: all.filter((c: any) => c.status === 'ACTIVE'),
      inactiveCampaigns: all.filter((c: any) => c.status !== 'ACTIVE'),
    }
  }, [filteredCampaigns])

  const fmtBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value)

  return (
    <div className="space-y-6">
      <div className="card hero-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 gradient-accent opacity-80 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6" style={{ pointerEvents: 'auto' }}>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">Campanhas</p>
            <h1 className="text-3xl font-display font-bold">Arrecadação estratégica</h1>
            <p className="text-sm text-muted mt-1">{totalCount} campanhas em andamento com objetivo claro.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/campaigns/new" className="btn-primary">
              <Plus size={16} /> Nova campanha
            </Link>
            <Link href="/insights" className="btn-outline flex items-center gap-2">
              <Sparkles size={16} /> Insights
            </Link>
          </div>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Busque campanhas ou metas"
              className="input w-full pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <StatusFilterChips
          styles={CAMPAIGN_STATUS_STYLE}
          order={CAMPAIGN_STATUS_ORDER}
          counts={countsByStatus}
          total={totalCount}
          value={status}
          onChange={setStatus}
          allLabel="Todas"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-48 animate-pulse" />)}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={status ? `Nenhuma campanha ${CAMPAIGN_STATUS_STYLE[status]?.label.toLowerCase() ?? ''}` : 'Nenhuma campanha encontrada'}
          description={status ? 'Tente outro filtro ou crie uma nova campanha.' : 'Crie uma nova campanha para engajar voluntários.'}
        />
      ) : (
        <>
          {activeCampaigns.length > 0 && (
            <div>
              {inactiveCampaigns.length > 0 && (
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Ativas</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeCampaigns.map((campaign: any) => {
                  const s = CAMPAIGN_STATUS_STYLE[campaign.status] ?? CAMPAIGN_STATUS_STYLE.DRAFT
                  return (
                    <div
                      key={campaign.id}
                      className="card relative overflow-hidden group transition hover:-translate-y-0.5"
                      style={{ borderTop: `4px solid ${s.bar}` }}
                    >
                      <div
                        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none"
                        style={{ backgroundColor: s.bg }}
                      />
                      <div className="relative p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Megaphone size={18} style={{ color: s.bar }} />
                            <h3 className="text-base font-semibold text-slate-900 truncate">{campaign.nome}</h3>
                          </div>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                            style={{ backgroundColor: s.bg, color: s.text }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.bar }} />
                            {s.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2">{campaign.descricao || 'Campanha sem descrição.'}</p>
                        <div className="flex items-center justify-between text-[12px] text-slate-500">
                          <span className="flex items-center gap-1"><Users size={12} /> {campaign.voluntariosAtivos ?? 0} voluntários</span>
                          {campaign.dataFim && (
                            <span>Até {new Date(campaign.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                          )}
                        </div>
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[12px] text-slate-600">
                            <span>Arrecadado</span>
                            <strong className="text-slate-900">{fmtBRL(campaign.arrecadado || 0)}</strong>
                          </div>
                          <div className="flex items-center justify-between text-[12px] text-slate-500">
                            <span>Meta</span>
                            <span>{fmtBRL(campaign.metaArrecadacao || 0)}</span>
                          </div>
                          <ProgressBar value={campaign.arrecadado || 0} max={campaign.metaArrecadacao || 1} size="sm" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                            onClick={() => openAssignmentModal(campaign)}
                          >
                            <UserPlus size={14} /> Alocar voluntários
                          </button>
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                            style={{ color: s.bar }}
                          >
                            Ver campanha <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {inactiveCampaigns.length > 0 && (
            <div className={activeCampaigns.length > 0 ? 'mt-8' : ''}>
              {activeCampaigns.length > 0 && (
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Inativas</h2>
              )}
              <div className="card divide-y divide-slate-100 overflow-hidden">
                {inactiveCampaigns.map((campaign: any) => {
                  const s = CAMPAIGN_STATUS_STYLE[campaign.status] ?? CAMPAIGN_STATUS_STYLE.DRAFT
                  return (
                    <div key={campaign.id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Megaphone size={16} className="text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <Link href={`/campaigns/${campaign.id}`} className="text-sm font-semibold text-slate-900 hover:text-brand-600 truncate block">
                            {campaign.nome}
                          </Link>
                          <p className="text-xs text-slate-400 truncate">{campaign.descricao || 'Sem descrição'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-xs text-slate-400 hidden sm:block">{new Date(campaign.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                          style={{ backgroundColor: s.bg, color: s.text }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.bar }} />
                          {s.label}
                        </span>
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="text-xs font-semibold text-brand-600 hover:underline flex-shrink-0"
                        >
                          Ver <ArrowRight size={12} className="inline" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Assignment Modal */}
      {assignmentModal && (
        <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4" onClick={closeAssignmentModal}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 font-display">Alocar voluntários</h2>
              <button onClick={closeAssignmentModal} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Gerenciando voluntários para <strong>{assignmentModal.nome}</strong></p>
              {assignmentFetching ? (
                <div className="h-20 flex items-center justify-center text-sm text-slate-400">Carregando...</div>
              ) : (
                <form onSubmit={handleAssignVolunteer} className="space-y-4">
                  <div>
                    <label className="label">Voluntário</label>
                    <select className="input" value={assignmentVolunteerId} onChange={e => setAssignmentVolunteerId(e.target.value)}>
                      <option value="">Selecione...</option>
                      {candidateVolunteers.map((v: any) => (
                        <option key={v.id} value={v.id}>{v.nome} {v.sobrenome}</option>
                      ))}
                    </select>
                  </div>
                  {assignedVolunteers.length > 0 && (
                    <div>
                      <label className="label">Voluntários alocados</label>
                      <div className="space-y-2">
                        {assignedVolunteers.map((av: any) => (
                          <div key={av.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                            <span>{av.volunteer?.nome} {av.volunteer?.sobrenome}</span>
                            <span className="text-xs text-slate-400">{new Date(av.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {assignmentFeedback && (
                    <p className={`text-sm font-semibold ${assignmentFeedback.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>{assignmentFeedback}</p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button type="button" className="btn-secondary flex-1" onClick={closeAssignmentModal}>Fechar</button>
                    <button type="submit" className="btn-primary flex-1" disabled={assignmentProcessing || !assignmentVolunteerId}>
                      {assignmentProcessing ? 'Alocando...' : 'Alocar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
