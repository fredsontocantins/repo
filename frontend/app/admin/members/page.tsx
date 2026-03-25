'use client'
import { useEffect, useState, useCallback } from 'react'
import { UsersRound, Plus, Search, Mail, Phone, Building2, Shield, UserCheck, UserX } from 'lucide-react'
import { api } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { clsx } from 'clsx'

const ROLE_LABELS: Record<string, string> = {
  DIRECTOR: 'Diretor(a)', MANAGER: 'Gerente', COORDINATOR: 'Coordenador(a)',
  ANALYST: 'Analista', INTERN: 'Estagiário(a)',
}
const ROLE_COLORS: Record<string, string> = {
  DIRECTOR: 'bg-purple-50 text-purple-700',
  MANAGER: 'bg-blue-50 text-blue-700',
  COORDINATOR: 'bg-brand-50 text-brand-700',
  ANALYST: 'bg-amber-50 text-amber-700',
  INTERN: 'bg-slate-100 text-slate-600',
}

const DEPTS = ['Gestão', 'Financeiro', 'Comunicação', 'Captação', 'Voluntariado', 'TI', 'Jurídico', 'RH', 'Operações']

const blankForm = { nome: '', email: '', cargo: '', role: 'ANALYST', departamento: '', telefone: '', bio: '' }

export default function MembersPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [form, setForm] = useState({ ...blankForm })
  const [saving, setSaving] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 16 }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const [res, s] = await Promise.all([api.getMembers(params), stats ? null : api.getMemberStats()])
      setData(res)
      if (s) setStats(s)
    } finally { setLoading(false) }
  }, [search, roleFilter, page])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditTarget(null); setForm({ ...blankForm }); setShowModal(true) }
  function openEdit(m: any) {
    setEditTarget(m)
    setForm({ nome: m.nome, email: m.email, cargo: m.cargo || '', role: m.role, departamento: m.departamento || '', telefone: m.telefone || '', bio: m.bio || '' })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editTarget) await api.updateMember(editTarget.id, form)
      else await api.createMember(form)
      setShowModal(false)
      load()
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  async function handleDeactivate() {
    if (!confirmDeactivate) return
    try {
      await api.deactivateMember(confirmDeactivate.id)
      setConfirmDeactivate(null)
      load()
    } catch (e: any) { alert(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-brand-500" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Administrativo</span>
          </div>
          <h1 className="page-title">Equipe Interna</h1>
          <p className="text-slate-500 text-sm mt-1">{data?.total ?? '—'} membros cadastrados</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={15} /> Novo Membro</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: UsersRound, bg: 'bg-slate-50', color: 'text-slate-600' },
            { label: 'Ativos', value: stats.active, icon: UserCheck, bg: 'bg-green-50', color: 'text-green-600' },
            ...stats.byRole?.slice(0, 2).map((r: any) => ({
              label: ROLE_LABELS[r.role] || r.role,
              value: r._count,
              icon: Building2,
              bg: 'bg-blue-50',
              color: 'text-blue-600',
            })) || [],
          ].map((s, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
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

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar por nome, email, cargo..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input w-auto min-w-[170px]" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Todos os cargos</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-slate-50" />)}
        </div>
      ) : data?.data?.length === 0 ? (
        <EmptyState icon={UsersRound} title="Nenhum membro encontrado" description="Adicione membros da equipe interna." action={<button className="btn-primary" onClick={openCreate}><Plus size={15} />Novo Membro</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.data?.map((m: any) => (
            <div key={m.id} className={clsx('card p-5 flex flex-col gap-3 relative', !m.isActive && 'opacity-60')}>
              {!m.isActive && (
                <div className="absolute top-3 right-3">
                  <span className="badge-pill bg-red-50 text-red-500">Inativo</span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                  {m.nome[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm leading-none">{m.nome}</p>
                  <p className="text-slate-400 text-xs mt-1">{m.cargo || 'Sem cargo'}</p>
                  {m.departamento && (
                    <span className="inline-block mt-1.5 text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {m.departamento}
                    </span>
                  )}
                </div>
              </div>

              <span className={clsx('badge-pill w-fit text-xs', ROLE_COLORS[m.role] || 'bg-slate-100 text-slate-600')}>
                {ROLE_LABELS[m.role] || m.role}
              </span>

              <div className="space-y-1.5 text-xs text-slate-500">
                {m.email && <div className="flex items-center gap-2"><Mail size={11} className="text-slate-400" /><span className="truncate">{m.email}</span></div>}
                {m.telefone && <div className="flex items-center gap-2"><Phone size={11} className="text-slate-400" /><span>{m.telefone}</span></div>}
              </div>

              <div className="flex gap-2 pt-1 border-t border-slate-50">
                <button className="btn-secondary text-xs py-1.5 flex-1" onClick={() => openEdit(m)}>Editar</button>
                {m.isActive && (
                  <button className="btn-secondary text-xs py-1.5 px-2 text-red-500 hover:bg-red-50 hover:border-red-100"
                    onClick={() => setConfirmDeactivate(m)} title="Desativar">
                    <UserX size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-secondary px-3 py-2" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
          <span className="text-sm text-slate-500">Página {page} de {data.totalPages}</span>
          <button className="btn-secondary px-3 py-2" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>→</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTarget ? 'Editar Membro' : 'Novo Membro da Equipe'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nome completo *</label>
              <input className="input" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ana Costa" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-0000" />
            </div>
            <div>
              <label className="label">Cargo / Função</label>
              <input className="input" value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} placeholder="Ex: Coordenadora de Projetos" />
            </div>
            <div>
              <label className="label">Nível Hierárquico</label>
              <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Departamento</label>
              <select className="input" value={form.departamento} onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))}>
                <option value="">Selecione...</option>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Bio / Observações</label>
              <textarea className="input" rows={2} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Breve descrição..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Salvando...' : editTarget ? 'Salvar' : 'Criar Membro'}</button>
          </div>
        </form>
      </Modal>

      {/* Deactivate confirm */}
      <Modal open={!!confirmDeactivate} onClose={() => setConfirmDeactivate(null)} title="Desativar Membro" size="sm">
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserX size={24} className="text-red-500" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">Desativar {confirmDeactivate?.nome}?</p>
          <p className="text-slate-400 text-sm mb-6">O membro ficará inativo mas seus dados serão preservados.</p>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setConfirmDeactivate(null)}>Cancelar</button>
            <button className="btn-danger flex-1" onClick={handleDeactivate}>Desativar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
