'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Megaphone, Plus, Search, Target, Users, DollarSign, ClipboardList, UserPlus, Trash2 } from 'lucide-react'
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
    } finally { setLoading(false) }
  }, [search, status])

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
    load()
    loadInterests()
  }, [load, loadInterests])

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

  async function handleRemoveVolunteer(volunteerId?: number) {
    if (!assignmentModal || !volunteerId) return
    setAssignmentProcessing(true)
    try {
      await api.removeCampaignVolunteer(assignmentModal.id, volunteerId)
      setAssignmentFeedback('Voluntário removido.')
      await loadAssignedVolunteers(assignmentModal.id)
    } catch (error: any) {
      setAssignmentFeedback(error?.message || 'Não foi possível remover o voluntário.')
    } finally {
      setAssignmentProcessing(false)
    }
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
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
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
      setSelectedInterest(null)
      setRejectMotivo('')
      refreshAll()
    } catch (error: any) {
      alert(error.message || 'Não foi possível atualizar a intenção.')
    } finally {
      setInterestActionLoading(false)
    }
  }

  const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(n)
  const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)

  const statusColors: Record<string, string> = {
    ACTIVE: 'border-l-brand-500',
    COMPLETED: 'border-l-blue-500',
    PAUSED: 'border-l-amber-500',
    DRAFT: 'border-l-slate-300',
    CANCELLED: 'border-l-red-400',
  }

  const candidateVolunteers = useMemo(() => {
    const assignedIds = new Set(assignedVolunteers.map(v => v.volunteer?.id))
    return availableVolunteers.filter(v => !assignedIds.has(v.id))
  }, [availableVolunteers, assignedVolunteers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Campanhas</h1>
          <p className="text-slate-500 text-sm mt-1">{data?.total ?? '—'} campanhas no total</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nova Campanha
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: fmt(stats.total), icon: Megaphone, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Ativas', value: fmt(stats.active), icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Concluídas', value: fmt(stats.completed), icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Arrecadado', value: fmtBRL(stats.totalArrecadado), icon: DollarSign, color: 'text-brand-600', bg: 'bg-brand-50' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 font-display leading-none">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar campanha..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto min-w-[160px]" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {['ACTIVE', 'DRAFT', 'PAUSED', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card p-6 h-32 animate-pulse bg-slate-50" />)}</div>
      ) : data?.data?.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nenhuma campanha encontrada" description="Crie sua primeira campanha." />
      ) : (
        <div className="space-y-4">
          {data?.data?.map((c: any) => (
            <div key={c.id} className={`card-hover p-6 border-l-4 ${statusColors[c.status] || 'border-l-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-900">{c.nome}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-1">{c.descricao || c.objetivo}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xl font-bold text-slate-900 font-display">{fmtBRL(c.arrecadado)}</p>
                  {c.metaArrecadacao && <p className="text-xs text-slate-400">meta: {fmtBRL(c.metaArrecadacao)}</p>}
                </div>
              </div>

              {c.metaArrecadacao && (
                <ProgressBar value={c.arrecadado} max={c.metaArrecadacao} />
              )}

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users size={13} />
                  <span>{c.voluntariosAtivos}{c.metaVoluntarios ? `/${c.metaVoluntarios}` : ''} voluntários</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <DollarSign size={13} />
                  <span>{c._count?.donations || 0} doações</span>
                </div>
                {c.dataInicio && (
                  <div className="text-xs text-slate-400 ml-auto">
                    Início: {new Date(c.dataInicio).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary text-xs flex items-center gap-2 px-3 py-2"
                  onClick={() => openAssignmentModal(c)}
                >
                  <UserPlus size={14} /> Gerenciar voluntários
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {interests?.data?.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-500 flex items-center gap-2"><ClipboardList size={16} /> Intenções pendentes</p>
              <h3 className="text-2xl font-black">Novas intenções de voluntariado</h3>
            </div>
            <span className="text-sm text-slate-500">{interests.total} aguardam análise</span>
          </div>
          {interestFeedback && <p className="text-sm text-emerald-600">{interestFeedback}</p>}
          <div className="grid md:grid-cols-2 gap-4">
            {interestLoading ? (
              [...Array(2)].map((_, idx) => (
                <div key={idx} className="h-32 rounded-2xl bg-slate-100" />
              ))
            ) : (
              interests.data.map((interest: any) => (
                <article key={interest.id} className="card-hover p-4 border border-slate-100 rounded-2xl bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{interest.nome}</p>
                      <p className="text-xs text-slate-500">{interest.profissao || 'Profissão não informada'}</p>
                    </div>
                    <span className="text-xs uppercase text-emerald-600 font-bold">{interest.campaign?.nome}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{interest.mensagem || 'Sem mensagem adicional.'}</p>
                  <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-3">
                    <span>Email: {interest.email}</span>
                    <span>Telefone: {interest.telefone || '—'}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button className="btn-secondary text-xs px-3 py-2" onClick={() => setSelectedInterest(interest)}>Ver</button>
                    <button className="btn-primary text-xs px-3 py-2" onClick={() => handleInterestAction('approve', interest)} disabled={interestActionLoading}>Aprovar</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      <Modal open={Boolean(selectedInterest)} onClose={() => setSelectedInterest(null)} title="Intenção de voluntariado" size="md">
        {selectedInterest && (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Campanha</p>
              <h3 className="text-2xl font-black text-slate-900">{selectedInterest.nome}</h3>
              <p className="text-sm text-slate-500">{selectedInterest.campaign?.nome || '—'}</p>
            </div>
            <div className="text-sm text-slate-600">
              <p><strong>Email:</strong> {selectedInterest.email}</p>
              <p><strong>Telefone:</strong> {selectedInterest.telefone || '—'}</p>
              <p><strong>Profissão:</strong> {selectedInterest.profissao || '—'}</p>
              <p className="mt-2">{selectedInterest.mensagem || 'Sem mensagem adicional.'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase tracking-[0.3em]">Motivo da rejeição</label>
              <textarea
                className="input"
                rows={3}
                value={rejectMotivo}
                onChange={e => setRejectMotivo(e.target.value)}
                placeholder="Informe o motivo para rejeitar esta intenção"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-primary flex-1"
                disabled={interestActionLoading}
                onClick={() => handleInterestAction('approve', selectedInterest)}
              >
                {interestActionLoading ? 'Atualizando...' : 'Aprovar'}
              </button>
              <button
                type="button"
                className="btn-secondary flex-1 text-xs"
                disabled={interestActionLoading || !rejectMotivo.trim()}
                onClick={() => handleInterestAction('reject', selectedInterest)}
              >
                Rejeitar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(assignmentModal)} onClose={closeAssignmentModal} title={`Gerenciar voluntários · ${assignmentModal?.nome || ''}`} size="lg">
        {assignmentModal && (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Campanha</p>
              <h3 className="text-2xl font-black text-slate-900">{assignmentModal.nome}</h3>
              <p className="text-sm text-slate-500">{assignmentModal.descricao || assignmentModal.objetivo}</p>
            </div>
            <form onSubmit={handleAssignVolunteer} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-[0.3em]">Adicionar voluntário</label>
                <select
                  className="input"
                  value={assignmentVolunteerId}
                  onChange={e => setAssignmentVolunteerId(e.target.value)}
                >
                  <option value="">Selecione um voluntário ativo</option>
                  {candidateVolunteers.map(vol => (
                    <option key={vol.id} value={vol.id}>{vol.nome} {vol.profissao ? `· ${vol.profissao}` : ''}</option>
                  ))}
                </select>
                {candidateVolunteers.length === 0 && (
                  <p className="text-xs text-slate-400">Nenhum voluntário disponível para alocar.</p>
                )}
              </div>
              {assignmentFeedback && <p className="text-sm text-emerald-600">{assignmentFeedback}</p>}
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={!assignmentVolunteerId || assignmentProcessing}
              >
                <UserPlus size={16} />
                {assignmentProcessing ? 'Aguarde...' : 'Alocar voluntário'}
              </button>
            </form>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Voluntários alocados</p>
                <span className="text-xs text-slate-400">{assignedVolunteers.length} total</span>
              </div>
              {assignmentFetching ? (
                <p className="text-sm text-slate-500">Carregando lista...</p>
              ) : assignedVolunteers.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum voluntário vinculado a esta campanha.</p>
              ) : (
                <div className="space-y-2">
                  {assignedVolunteers.map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-2xl p-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{assignment.volunteer?.nome || 'Voluntário anônimo'}</p>
                        <p className="text-xs text-slate-500">{assignment.volunteer?.profissao || 'Profissão não informada'}</p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary text-xs flex items-center gap-1 px-3 py-1"
                        onClick={() => handleRemoveVolunteer(assignment.volunteer?.id)}
                        disabled={assignmentProcessing}
                      >
                        <Trash2 size={14} />
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nova Campanha" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nome da campanha *</label>
              <input className="input" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Alimentação Solidária" />
            </div>
            <div className="col-span-2">
              <label className="label">Descrição</label>
              <textarea className="input" rows={2} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descreva a campanha..." />
            </div>
            <div>
              <label className="label">Meta de Arrecadação (R$)</label>
              <input className="input" type="number" value={form.metaArrecadacao} onChange={e => setForm(f => ({ ...f, metaArrecadacao: e.target.value }))} placeholder="50000" />
            </div>
            <div>
              <label className="label">Meta de Voluntários</label>
              <input className="input" type="number" value={form.metaVoluntarios} onChange={e => setForm(f => ({ ...f, metaVoluntarios: e.target.value }))} placeholder="30" />
            </div>
            <div>
              <label className="label">Data de Início</label>
              <input className="input" type="date" value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
            </div>
            <div>
              <label className="label">Data de Fim</label>
              <input className="input" type="date" value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Salvando...' : 'Criar Campanha'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
