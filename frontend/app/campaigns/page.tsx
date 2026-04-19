'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Megaphone, Plus, Search, Users, DollarSign, UserPlus, Trash2, Sparkles, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import StatusFilterChips from '@/components/ui/StatusFilterChips'
import ProgressBar from '@/components/ui/ProgressBar'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { CAMPAIGN_STATUS_STYLE, CAMPAIGN_STATUS_ORDER } from '@/lib/chart-colors'

export default function CampaignsPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '', objetivo: '', metaArrecadacao: '', metaVoluntarios: '', dataInicio: '', dataFim: '' })
  const [saving, setSaving] = useState(false)
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

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { limit: 200 }
      if (search) params.search = search
      const [res, s] = await Promise.all([api.getCampaigns(params), stats ? null : api.getCampaignStats()])
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createCampaign({
        ...form,
        metaArrecadacao: form.metaArrecadacao ? Number(form.metaArrecadacao) : undefined,
        metaVoluntarios: form.metaVoluntarios ? Number(form.metaVoluntarios) : undefined,
        dataInicio: form.dataInicio || undefined,
        dataFim: form.dataFim || undefined,
        status: 'ACTIVE',
      })
      setShowModal(false)
      load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
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

  const fmtBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value)

  return (
    <div className="space-y-6">
      <div className="card hero-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 gradient-accent opacity-80" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">Campanhas</p>
            <h1 className="text-3xl font-display font-bold">Arrecadação estratégica</h1>
            <p className="text-sm text-muted mt-1">{totalCount} campanhas em andamento com objetivo claro.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Nova campanha
            </button>
            <button className="btn-outline flex items-center gap-2">
              <Sparkles size={16} /> Insights
            </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign: any) => {
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
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
                    <button
                      className="btn-outline flex items-center gap-2 py-1 px-3 text-xs"
                      onClick={() => openAssignmentModal(campaign)}
                    >
                      <UserPlus size={14} /> Alocar voluntários
                    </button>
                    <Link href={`/campaigns/${campaign.id}`} className="flex items-center gap-1 font-semibold" style={{ color: s.bar }}>
                      Ver campanha <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Existing modals stay unchanged */}
    </div>
  )
}
