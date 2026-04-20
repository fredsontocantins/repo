'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Users, Search, Plus, Filter, Star, Clock, Check, X, Pause, Play, Loader2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import StatusFilterChips from '@/components/ui/StatusFilterChips'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { VOLUNTEER_STATUS_STYLE, VOLUNTEER_STATUS_ORDER } from '@/lib/chart-colors'

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
  const [busyId, setBusyId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 12 }
      if (search) params.search = search
      if (status) params.status = status
      const [res, s] = await Promise.all([api.getVolunteers(params), api.getVolunteerStats()])
      setData(res)
      setStats(s)
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

  async function changeStatus(v: any, newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING', label: string) {
    setBusyId(v.id)
    setToast(null)
    try {
      await api.updateVolunteer(v.id, { status: newStatus })
      setToast({ kind: 'ok', text: `${v.nome}: ${label}` })
      await load()
    } catch (err: any) {
      setToast({ kind: 'err', text: err?.message || 'Falha ao atualizar status' })
    } finally {
      setBusyId(null)
      setTimeout(() => setToast(null), 4000)
    }
  }

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)

  const statusCounts = useMemo(() => ({
    ACTIVE: stats?.active ?? 0,
    PENDING: stats?.pending ?? 0,
    INACTIVE: stats?.inactive ?? 0,
    SUSPENDED: stats?.suspended ?? 0,
  }), [stats])

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

      {/* Pending action banner */}
      {stats?.pending > 0 && status !== 'PENDING' && (
        <button
          type="button"
          onClick={() => { setStatus('PENDING'); setPage(1) }}
          className="w-full card p-4 flex items-center gap-4 border-l-4 border-amber-400 hover:bg-amber-50 transition text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm">
              {stats.pending} voluntário{stats.pending > 1 ? 's' : ''} aguardando aprovação
            </p>
            <p className="text-xs text-slate-500">
              Clique para revisar e ativar/rejeitar cadastros pendentes.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-white">Revisar</span>
        </button>
      )}

      {status === 'PENDING' && (
        <div className="card p-4 flex items-center gap-3 border-l-4 border-amber-400 bg-amber-50/40">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-slate-700">
            Use os botões <strong className="text-green-700">Ativar</strong> ou <strong className="text-red-700">Rejeitar</strong> em cada card abaixo para decidir o cadastro.
          </p>
        </div>
      )}

      {toast && (
        <div className={`card p-3 flex items-center gap-2 border-l-4 ${
          toast.kind === 'ok' ? 'border-green-400 text-green-800' : 'border-red-400 text-red-800'
        }`}>
          {toast.kind === 'ok' ? <Check size={16} /> : <X size={16} />}
          <p className="text-sm font-medium">{toast.text}</p>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nome, email ou profissão..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <StatusFilterChips
          styles={VOLUNTEER_STATUS_STYLE}
          order={VOLUNTEER_STATUS_ORDER}
          counts={statusCounts}
          total={stats?.total ?? (data?.total ?? 0)}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1) }}
        />
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
          {data?.data?.map((v: any) => {
            const s = VOLUNTEER_STATUS_STYLE[v.status] ?? VOLUNTEER_STATUS_STYLE.PENDING
            return (
              <div
                key={v.id}
                className="card p-5 flex flex-col gap-3 transition hover:-translate-y-0.5"
                style={{ borderTop: `4px solid ${s.bar}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ backgroundColor: s.bar }}
                    >
                      {v.nome[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm leading-tight truncate">{v.nome}</p>
                      <p className="text-slate-400 text-xs mt-1 truncate">{v.profissao || 'Sem profissão'}</p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.bar }} />
                    {s.label}
                  </span>
                </div>

                {v.email && <p className="text-xs text-slate-400 truncate">{v.email}</p>}

                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
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

                {/* Status actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  {v.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        onClick={() => changeStatus(v, 'ACTIVE', 'ativado com sucesso')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {busyId === v.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        Ativar
                      </button>
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        onClick={() => {
                          if (confirm(`Rejeitar o cadastro de ${v.nome}?`)) {
                            changeStatus(v, 'INACTIVE', 'cadastro rejeitado')
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <X size={13} /> Rejeitar
                      </button>
                    </>
                  )}
                  {v.status === 'ACTIVE' && (
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      onClick={() => {
                        if (confirm(`Suspender temporariamente ${v.nome}?`)) {
                          changeStatus(v, 'SUSPENDED', 'suspenso')
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-50 transition-colors"
                    >
                      {busyId === v.id ? <Loader2 size={13} className="animate-spin" /> : <Pause size={13} />}
                      Suspender
                    </button>
                  )}
                  {(v.status === 'SUSPENDED' || v.status === 'INACTIVE') && (
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      onClick={() => changeStatus(v, 'ACTIVE', 'reativado')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {busyId === v.id ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                      Reativar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
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
