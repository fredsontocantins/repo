'use client'
import { useEffect, useState, useCallback } from 'react'
import { Calendar, Plus, MapPin, Users, Clock, UserPlus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'

export default function EventsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '', local: '', dataInicio: '', dataFim: '', capacidade: '' })
  const [saving, setSaving] = useState(false)
  const [eventAssignment, setEventAssignment] = useState<any>(null)
  const [eventAssignedVolunteers, setEventAssignedVolunteers] = useState<any[]>([])
  const [eventVolunteerOptions, setEventVolunteerOptions] = useState<any[]>([])
  const [eventAssignmentFetching, setEventAssignmentFetching] = useState(false)
  const [eventAssignmentProcessing, setEventAssignmentProcessing] = useState(false)
  const [eventSelectedVolunteerId, setEventSelectedVolunteerId] = useState('')
  const [eventAssignmentFeedback, setEventAssignmentFeedback] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (status) params.status = status
      setData(await api.getEvents(params))
    } finally { setLoading(false) }
  }, [status])

  useEffect(() => { load() }, [load])

  const loadEventVolunteerOptions = useCallback(async () => {
    try {
      const res = await api.getVolunteers({ status: 'ACTIVE', limit: 80 })
      setEventVolunteerOptions(res?.data || [])
    } catch (error) {
      console.error('Erro ao carregar voluntários para eventos', error)
    }
  }, [])

  useEffect(() => { loadEventVolunteerOptions() }, [loadEventVolunteerOptions])

  const loadEventAssignments = useCallback(async (eventId: number) => {
    setEventAssignmentFetching(true)
    try {
      const list = await api.getEventVolunteers(eventId)
      setEventAssignedVolunteers(list || [])
    } catch (error: any) {
      console.error('Falha ao carregar voluntários do evento', error)
      setEventAssignmentFeedback(error?.message || 'Não foi possível carregar os voluntários.')
    } finally {
      setEventAssignmentFetching(false)
    }
  }, [])

  const openEventAssignmentModal = useCallback(async (event: any) => {
    setEventAssignment(event)
    setEventSelectedVolunteerId('')
    setEventAssignmentFeedback('')
    await loadEventAssignments(event.id)
  }, [loadEventAssignments])

  const closeEventAssignmentModal = () => {
    setEventAssignment(null)
    setEventAssignedVolunteers([])
    setEventAssignmentFeedback('')
    setEventSelectedVolunteerId('')
  }

  async function handleEventAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!eventAssignment || !eventSelectedVolunteerId) return
    setEventAssignmentProcessing(true)
    try {
      await api.registerEventVolunteer(eventAssignment.id, Number(eventSelectedVolunteerId))
      setEventAssignmentFeedback('Voluntário registrado no evento.')
      setEventSelectedVolunteerId('')
      await loadEventAssignments(eventAssignment.id)
    } catch (error: any) {
      setEventAssignmentFeedback(error?.message || 'Não foi possível registrar o voluntário.')
    } finally {
      setEventAssignmentProcessing(false)
    }
  }

  async function handleEventRemoveVolunteer(volunteerId?: number) {
    if (!eventAssignment || !volunteerId) return
    setEventAssignmentProcessing(true)
    try {
      await api.removeEventVolunteer(eventAssignment.id, volunteerId)
      setEventAssignmentFeedback('Voluntário removido do evento.')
      await loadEventAssignments(eventAssignment.id)
    } catch (error: any) {
      setEventAssignmentFeedback(error?.message || 'Não foi possível remover o voluntário.')
    } finally {
      setEventAssignmentProcessing(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createEvent({
        ...form,
        capacidade: form.capacidade ? Number(form.capacidade) : undefined,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim || undefined,
      })
      setShowModal(false)
      load()
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }

  const statusColor: Record<string, string> = {
    SCHEDULED: 'border-t-blue-400',
    ONGOING: 'border-t-green-500',
    COMPLETED: 'border-t-slate-400',
    CANCELLED: 'border-t-red-400',
  }

  const eventCandidateVolunteers = eventVolunteerOptions.filter(vol => !eventAssignedVolunteers.some(av => av.volunteer?.id === vol.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Eventos</h1>
          <p className="text-slate-500 text-sm mt-1">{data?.total ?? '—'} eventos cadastrados</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      <div className="card p-4 flex gap-3">
        <select className="input w-auto min-w-[180px]" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-44 animate-pulse" />)}
        </div>
      ) : data?.data?.length === 0 ? (
        <EmptyState icon={Calendar} title="Nenhum evento encontrado" description="Crie o primeiro evento da organização." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data?.map((ev: any) => (
            <div key={ev.id} className={`card-hover p-5 border-t-4 ${statusColor[ev.status] || 'border-t-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900 flex-1 leading-snug">{ev.nome}</h3>
                <StatusBadge status={ev.status} />
              </div>
              {ev.descricao && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{ev.descricao}</p>}
              <div className="space-y-2">
                {ev.local && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{ev.local}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={12} className="text-slate-400" />
                  <span>{new Date(ev.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                {ev.capacidade && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={12} className="text-slate-400" />
                    <span>{ev._count?.registrations ?? 0}/{ev.capacidade} inscritos</span>
                  </div>
                )}
              </div>
              {ev.campaign && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <p className="text-xs text-brand-600 font-medium">{ev.campaign.nome}</p>
                </div>
              )}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary text-xs flex items-center gap-2 px-3 py-2"
                  onClick={() => openEventAssignmentModal(ev)}
                >
                  <UserPlus size={14} /> Voluntários
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(eventAssignment)} onClose={closeEventAssignmentModal} title={`Gerenciar voluntários · ${eventAssignment?.nome || ''}`} size="lg">
        {eventAssignment && (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Evento</p>
              <h3 className="text-2xl font-black text-slate-900">{eventAssignment.nome}</h3>
              <p className="text-sm text-slate-500">{eventAssignment.descricao || 'Sem descrição adicional.'}</p>
            </div>
            <form onSubmit={handleEventAssign} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-[0.3em]">Adicionar voluntário</label>
                <select
                  className="input"
                  value={eventSelectedVolunteerId}
                  onChange={e => setEventSelectedVolunteerId(e.target.value)}
                >
                  <option value="">Selecione um voluntário ativo</option>
                  {eventCandidateVolunteers.map(vol => (
                    <option key={vol.id} value={vol.id}>{vol.nome} {vol.profissao ? `· ${vol.profissao}` : ''}</option>
                  ))}
                </select>
                {eventCandidateVolunteers.length === 0 && (
                  <p className="text-xs text-slate-400">Não há voluntários livres para este evento.</p>
                )}
              </div>
              {eventAssignmentFeedback && <p className="text-sm text-emerald-600">{eventAssignmentFeedback}</p>}
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={!eventSelectedVolunteerId || eventAssignmentProcessing}
              >
                <UserPlus size={16} />
                {eventAssignmentProcessing ? 'Aguarde...' : 'Registrar voluntário'}
              </button>
            </form>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Voluntários registrados</p>
                <span className="text-xs text-slate-400">{eventAssignedVolunteers.length} total</span>
              </div>
              {eventAssignmentFetching ? (
                <p className="text-sm text-slate-500">Carregando lista...</p>
              ) : eventAssignedVolunteers.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum voluntário registrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {eventAssignedVolunteers.map(registration => (
                    <div key={registration.id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-2xl p-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{registration.volunteer?.nome || 'Voluntário desconhecido'}</p>
                        <p className="text-xs text-slate-500">{registration.volunteer?.profissao || 'Profissão não informada'}</p>
                        <p className="text-xs text-slate-400 mt-1">{registration.checkedIn ? 'Check-in confirmado' : 'Sem check-in'}</p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary text-xs flex items-center gap-1 px-3 py-1"
                        onClick={() => handleEventRemoveVolunteer(registration.volunteer?.id)}
                        disabled={eventAssignmentProcessing}
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Evento" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nome do evento *</label>
              <input className="input" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Mutirão de Limpeza" />
            </div>
            <div className="col-span-2">
              <label className="label">Descrição</label>
              <textarea className="input" rows={2} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">Local</label>
              <input className="input" value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))} placeholder="Endereço ou nome do local" />
            </div>
            <div>
              <label className="label">Data de Início *</label>
              <input className="input" type="datetime-local" required value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
            </div>
            <div>
              <label className="label">Data de Fim</label>
              <input className="input" type="datetime-local" value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} />
            </div>
            <div>
              <label className="label">Capacidade</label>
              <input className="input" type="number" value={form.capacidade} onChange={e => setForm(f => ({ ...f, capacidade: e.target.value }))} placeholder="50" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Salvando...' : 'Criar Evento'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
