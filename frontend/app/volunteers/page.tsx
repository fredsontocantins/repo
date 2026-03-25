'use client'
import { useEffect, useState, useCallback } from 'react'
import { Users, Search, Plus, Filter, Star, Clock, Award } from 'lucide-react'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'

const statusOptions = ['', 'ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']

export default function VolunteersPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', profissao: '', bio: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 12 }
      if (search) params.search = search
      if (status) params.status = status
      const [res, s] = await Promise.all([api.getVolunteers(params), stats ? null : api.getVolunteerStats()])
      setData(res)
      if (s) setStats(s)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [search, status, page])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createVolunteer(form)
      setShowModal(false)
      setForm({ nome: '', email: '', telefone: '', profissao: '', bio: '' })
      load()
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Voluntários</h1>
          <p className="text-slate-500 text-sm mt-1">{data?.total ?? '—'} voluntários cadastrados</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo Voluntário
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: fmt(stats.total), icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Ativos', value: fmt(stats.active), icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Horas Totais', value: fmt(stats.totalHoras), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pendentes', value: fmt(stats.pending), icon: Filter, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 font-display leading-none">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nome, email ou profissão..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className="input w-auto min-w-[160px]" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">Todos os status</option>
          {statusOptions.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum voluntário encontrado" description="Tente ajustar os filtros ou adicione um novo voluntário." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.data?.map((v: any) => (
            <div key={v.id} className="card-hover p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {v.nome[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm leading-none truncate">{v.nome}</p>
                    <p className="text-slate-400 text-xs mt-1 truncate">{v.profissao || 'Sem profissão'}</p>
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>

              {v.email && <p className="text-xs text-slate-400 truncate">{v.email}</p>}

              <div className="flex items-center gap-3 pt-1 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{fmt(v.pontos)}</span>
                  <span className="text-slate-400">pts</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-600">
                  <Clock size={12} />
                  <span className="font-semibold">{v.horasContribuidas}h</span>
                </div>
                {v.badges?.length > 0 && (
                  <div className="flex items-center gap-1 ml-auto">
                    {v.badges.slice(0, 3).map((b: any) => (
                      <span key={b.id} className="text-sm" title={b.badge.nome}>{b.badge.icone}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-secondary px-3 py-2" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
          <span className="text-sm text-slate-600 px-3">Página {page} de {data.totalPages}</span>
          <button className="btn-secondary px-3 py-2" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>→</button>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Voluntário">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nome completo *</label>
              <input className="input" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="João da Silva" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="joao@email.com" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-0000" />
            </div>
            <div className="col-span-2">
              <label className="label">Profissão</label>
              <input className="input" value={form.profissao} onChange={e => setForm(f => ({ ...f, profissao: e.target.value }))} placeholder="Médico, Professor, etc." />
            </div>
            <div className="col-span-2">
              <label className="label">Bio / Observações</label>
              <textarea className="input" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Sobre o voluntário..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Salvando...' : 'Criar Voluntário'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
