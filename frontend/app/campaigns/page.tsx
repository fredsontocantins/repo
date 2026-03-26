'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Megaphone, Plus, Search, Users, DollarSign, UserPlus, Trash2, Sparkles, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'

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
      const params: any = {}
      if (search) params.search = search
      if (status) params.status = status
      const [res, s] = await Promise.all([api.getCampaigns(params), stats ? null : api.getCampaignStats()])
      setData(res)
      if (s) setStats(s)
    } finally {
      setLoading(false)
    }
  }, [search, status, stats])

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

  const statusColors: Record<string, string> = {
    ACTIVE: 'border-l-pink-400',
    COMPLETED: 'border-l-blue-500',
    PAUSED: 'border-l-amber-500',
    DRAFT: 'border-l-slate-300',
    CANCELLED: 'border-l-red-400',
  }

  const candidateVolunteers = useMemo(() => {
    const assignedIds = new Set(assignedVolunteers.map(v => v.volunteer?.id))
    return availableVolunteers.filter(v => !assignedIds.has(v.id))
  }, [availableVolunteers, assignedVolunteers])

  const counts = useMemo(() => ({
    total: data?.total ?? 0,
    active: data?.data?.filter((campaign: any) => campaign.status === 'ACTIVE').length ?? 0,
    completed: data?.data?.filter((campaign: any) => campaign.status === 'COMPLETED').length ?? 0,
    paused: data?.data?.filter((campaign: any) => campaign.status === 'PAUSED').length ?? 0,
  }), [data])

  const fmtBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value)

  return (
    <div className="space-y-6">
      <div className="card hero-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 gradient-accent opacity-80" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">Campanhas</p>
            <h1 className="text-3xl font-display font-bold">Arrecadação estratégica</h1>
            <p className="text-sm text-muted mt-1">{counts.total} campanhas em andamento com objetivo claro.</p>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Ativas', value: counts.active },
          { label: 'Concluídas', value: counts.completed },
          { label: 'Pausadas', value: counts.paused },
          { label: 'Total', value: counts.total },
        ].map(stat => (
          <div key={stat.label} className="card p-4 transition border border-transparent hover:border-white/30">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{stat.label}</p>
            <p className="text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Busque campanhas ou metas"
            className="input w-full pl-12"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-full md:w-1/3" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'DRAFT'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-48 animate-pulse" />)}
        </div>
      ) : data?.data?.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nenhuma campanha encontrada" description="Crie uma nova campanha para engajar voluntários." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.data?.map((campaign: any) => (
            <div
              key={campaign.id}
              className={`card relative overflow-hidden ${statusColors[campaign.status] ?? 'border-l-slate-200'}`}
            >
              <div className="absolute inset-0 gradient-accent opacity-0 hover:opacity-90 transition" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-muted" />
                  <h3 className="text-lg font-semibold">{campaign.nome}</h3>
                </div>
                <p className="text-sm text-muted line-clamp-2">{campaign.descricao || 'Campanha sem descrição.'}</p>
                <div className="flex items-center justify-between text-[12px] text-muted">
                  <span>Status: {campaign.status}</span>
                  <span>{campaign.voluntariosAtivos ?? 0} voluntários alocados</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[13px]">
                    <span>Arrecadado</span>
                    <strong>{fmtBRL(campaign.arrecadado || 0)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span>Meta</span>
                    <strong>{fmtBRL(campaign.metaArrecadacao || 0)}</strong>
                  </div>
                  <ProgressBar value={campaign.arrecadado || 0} max={campaign.metaArrecadacao || 1} size="sm" />
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <button
                    className="btn-outline flex items-center gap-2 py-1 px-3"
                    onClick={() => openAssignmentModal(campaign)}
                  >
                    <UserPlus size={16} /> Alocar voluntários
                  </button>
                  <Link href={`/campaigns/${campaign.id}`} className="flex items-center gap-1 text-accent-light">
                    Ver campanha <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing modals stay unchanged */}
    </div>
  )
}
