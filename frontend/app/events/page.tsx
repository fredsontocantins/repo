'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Calendar, Plus, MapPin, Users, Clock, UserPlus, Trash2, Sparkles, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import StatusFilterChips from '@/components/ui/StatusFilterChips'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { EVENT_STATUS_STYLE, EVENT_STATUS_ORDER } from '@/lib/chart-colors'

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
      setData(await api.getEvents({ limit: 200 }))
    } finally { setLoading(false) }
  }, [])

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

  const eventCandidateVolunteers = eventVolunteerOptions.filter(vol => !eventAssignedVolunteers.some(av => av.volunteer?.id === vol.id))

  const countsByStatus = useMemo(() => {
    const acc: Record<string, number> = { SCHEDULED: 0, ONGOING: 0, COMPLETED: 0, CANCELLED: 0 }
    data?.data?.forEach((ev: any) => { if (acc[ev.status] !== undefined) acc[ev.status] += 1 })
    return acc
  }, [data])

  const totalCount = data?.data?.length ?? 0

  const filteredEvents = useMemo(() => {
    if (!status) return data?.data ?? []
    return (data?.data ?? []).filter((ev: any) => ev.status === status)
  }, [data, status])

  return (
    <div className="space-y-6">
      <div className="card hero-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 gradient-accent opacity-80" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">Eventos</p>
            <h1 className="text-3xl font-display font-semibold">Agenda em movimento</h1>
            <p className="text-sm text-muted mt-1">{data?.total ?? '—'} eventos gerenciados com CTA direto para voluntários e campanhas.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Novo Evento
            </button>
            <button className="btn-outline">
              <Sparkles size={16} /> Insights
            </button>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <StatusFilterChips
          styles={EVENT_STATUS_STYLE}
          order={EVENT_STATUS_ORDER}
          counts={countsByStatus}
          total={totalCount}
          value={status}
          onChange={setStatus}
          allLabel="Todos"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-48 animate-pulse" />)}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={status ? `Nenhum evento ${EVENT_STATUS_STYLE[status]?.label.toLowerCase() ?? ''}` : 'Nenhum evento encontrado'}
          description={status ? 'Tente outro filtro ou crie um novo evento.' : 'Crie o primeiro evento da organização.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((ev: any) => {
            const s = EVENT_STATUS_STYLE[ev.status] ?? EVENT_STATUS_STYLE.SCHEDULED
            return (
              <div
                key={ev.id}
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
                      <Calendar size={18} style={{ color: s.bar }} />
                      <h3 className="text-base font-semibold text-slate-900 truncate">{ev.nome}</h3>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                      style={{ backgroundColor: s.bg, color: s.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.bar }} />
                      {s.label}
                    </span>
                  </div>
                  {ev.descricao && <p className="text-sm text-slate-500 line-clamp-2">{ev.descricao}</p>}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {ev.local && (
                      <div className="flex items-center gap-2"><MapPin size={12} className="text-slate-400" /><span>{ev.local}</span></div>
                    )}
                    <div className="flex items-center gap-2"><Clock size={12} className="text-slate-400" /><span>{new Date(ev.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span></div>
                    {ev.capacidade && (
                      <div className="flex items-center gap-2"><Users size={12} className="text-slate-400" /><span>{ev._count?.registrations ?? 0}/{ev.capacidade} inscritos</span></div>
                    )}
                  </div>
                  {ev.campaign && (
                    <div className="text-xs" style={{ color: s.bar }}>Campanha: {ev.campaign.nome}</div>
                  )}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      className="btn-outline text-[11px] flex items-center gap-2 px-3 py-1"
                      onClick={() => openEventAssignmentModal(ev)}
                    >
                      <UserPlus size={14} /> Voluntários
                    </button>
                    <Link href={`/events/${ev.id}`} className="flex items-center gap-1 font-semibold" style={{ color: s.bar }}>
                      Detalhes <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={Boolean(eventAssignment)} onClose={closeEventAssignmentModal} title={`Gerenciar voluntários · ${eventAssignment?.nome || ''}`} size="lg">
        {eventAssignment && (
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-accent">Evento</p>
              <h3 className="text-2xl font-black text-white">{eventAssignment.nome}</h3>
              <p className="text-sm text-muted">{eventAssignment.descricao || 'Sem descrição adicional.'}</p>
            </div>
            <form onSubmit={handleEventAssign} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted uppercase tracking-[0.3em]">Adicionar voluntário</label>
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
                  <p className="text-xs text-muted">Não há voluntários livres para este evento.</p>
                )}
              </div>
              {eventAssignmentFeedback && <p className="text-sm text-accent">{eventAssignmentFeedback}</p>}
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
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Voluntários registrados</p>
                <span className="text-xs text-muted">{eventAssignedVolunteers.length} total</span>
              </div>
              {eventAssignmentFetching ? (
                <p className="text-sm text-muted">Carregando lista...</p>
              ) : eventAssignedVolunteers.length === 0 ? (
                <p className="text-sm text-muted">Nenhum voluntário registrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {eventAssignedVolunteers.map(registration => (
                    <div key={registration.id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-2xl p-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{registration.volunteer?.nome || 'Voluntário desconhecido'}</p>
                        <p className="text-xs text-muted">{registration.volunteer?.profissao || 'Profissão não informada'}</p>
                        <p className="text-xs text-muted mt-1">{registration.checkedIn ? 'Check-in confirmado' : 'Sem check-in'}</p>
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
