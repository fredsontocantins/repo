'use client'
import { useEffect, useState } from 'react'
import { ShieldCheck, UserPlus, Check, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import clsx from 'clsx'

const roleCapabilities = [
  {
    role: 'SUPER_ADMIN',
    title: 'Super Administrador',
    description: 'Controle total sobre toda a plataforma e organizações conectadas.',
    permissions: [
      'Gerencia organizações e parâmetros globais',
      'Cria e remove administradores e coordenadores',
      'Define acessos e aprovações críticas',
      'Visualiza relatórios consolidados',
    ],
    accent: 'from-slate-800 to-brand-600',
  },
  {
    role: 'ADMIN',
    title: 'Administrador Organizacional',
    description: 'Responsável por operações administrativas da organização atual.',
    permissions: [
      'Configura dados da organização e portal público',
      'Gerencia campanhas, eventos, certificações e finanças',
      'Controla usuários internos (coordenação, voluntários e membros)',
      'Revisa metas e relatórios de alta prioridade',
    ],
    accent: 'from-brand-500 to-brand-700',
  },
  {
    role: 'COORDINATOR',
    title: 'Coordenador Operacional',
    description: 'Cuida do dia a dia das campanhas, voluntários e eventos.',
    permissions: [
      'Gerencia voluntários, badges e pontuação',
      'Supervisiona eventos e inscrições de voluntários',
      'Aprova intenções de voluntariado e certificados',
      'Acompanha doações e impactos sociais',
    ],
    accent: 'from-blue-500 to-blue-700',
  },
  {
    role: 'VOLUNTEER',
    title: 'Voluntário',
    description: 'Acesso restrito ao portal de atividades e ao próprio histórico.',
    permissions: [
      'Visualiza campanhas públicas e ranking',
      'Acompanha badges, certificados e pontos pessoais',
      'Consulta eventos e confirma participação',
    ],
    accent: 'from-amber-500 to-amber-700',
  },
]

const roleOptions = roleCapabilities.map(({ role }) => role)

export default function UsersPage() {
  const { user } = useAuthStore()
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role ?? '')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'COORDINATOR' })

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin])

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await api.getUsers({ limit: 50 })
      setUsers(res.data || [])
    } catch (err: any) {
      console.error(err)
      setError('Não foi possível carregar os usuários.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await api.createUser(form)
      setMessage('Usuário criado com sucesso.')
      setForm({ name: '', email: '', password: '', role: 'COORDINATOR' })
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'Não foi possível criar o usuário.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRoleChange(userId: number, role: string) {
    setMessage('')
    setError('')
    try {
      await api.updateUser(userId, { role })
      setMessage('Perfil atualizado.')
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar o cargo.')
    }
  }

  async function toggleActive(userId: number, active: boolean) {
    setMessage('')
    setError('')
    try {
      await api.updateUser(userId, { isActive: !active })
      setMessage(active ? 'Usuário desativado.' : 'Usuário reativado.')
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar o status.')
    }
  }

  if (!isAdmin) {
    return (
      <div className="card p-6">
        <p className="text-lg font-semibold text-slate-900">Controle acionado apenas para administradores.</p>
        <p className="text-sm text-slate-500 mt-2">Peça para um administrador revisar o acesso.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <h1 className="page-title">Controle de Usuários</h1>
        <p className="text-slate-500 text-sm">Defina quem pode mexer nos módulos principais e acompanhe o status das contas.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleCapabilities.map(({ role, title, description, permissions, accent }) => (
          <div key={role} className="rounded-3xl border border-slate-100 p-4 bg-gradient-to-br shadow-sm" style={{ backgroundImage: `linear-gradient(135deg, ${accent})` }}>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">{role}</p>
            <h2 className="text-white text-lg font-semibold mt-2">{title}</h2>
            <p className="text-white/80 text-sm mt-2">{description}</p>
            <ul className="mt-4 space-y-1 text-xs text-white/90 list-disc list-inside">
              {permissions.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Usuários cadastrados</h2>
          {message && <span className="text-brand-600 text-sm font-medium flex items-center gap-1"><Check size={14} />{message}</span>}
          {error && <span className="text-rose-500 text-sm font-medium flex items-center gap-1"><X size={14} />{error}</span>}
        </div>
        <div className="card p-5 space-y-4">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nome</label>
                <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Senha</label>
                <input className="input" type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="label">Cargo</label>
                <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {roleOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn-primary flex items-center gap-2 w-full justify-center" disabled={saving}>
              <UserPlus size={16} />
              {saving ? 'Criando...' : 'Criar Usuário'}
            </button>
          </form>
        </div>
      </section>

      <section className="card p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Nome</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Cargo</th>
                <th className="pb-3">Organização</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">Carregando usuários...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                users.map(account => (
                  <tr key={account.id} className="border-t border-slate-100 align-top">
                    <td className="py-3 font-semibold text-slate-900">{account.name}</td>
                    <td className="py-3 text-slate-500">{account.email}</td>
                    <td className="py-3">
                      <select
                        className="input text-xs"
                        value={account.role}
                        onChange={e => handleRoleChange(account.id, e.target.value)}
                      >
                        {roleOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-slate-500">{account.organization?.name || '—'}</td>
                    <td className="py-3">
                      <button
                        className={clsx(
                          'text-xs font-semibold px-3 py-1 rounded-full transition',
                          account.isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                        )}
                        onClick={() => toggleActive(account.id, account.isActive)}
                      >
                        {account.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(account.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
