'use client'
import { useEffect, useState } from 'react'
import { Settings, Building2, Mail, Phone, MapPin, Globe, Save } from 'lucide-react'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.getOrganization().then(o => {
      setOrg(o)
      setForm({ name: o.name, description: o.description || '', email: o.email || '', phone: o.phone || '', website: o.website || '', address: o.address || '', city: o.city || '', state: o.state || '' })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateOrganization(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
      <div className="card p-6 space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}</div>
    </div>
  )

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os dados da sua organização</p>
        </div>
      </div>

      {/* Stats summary */}
      {org?._count && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Voluntários', value: org._count.volunteers },
            { label: 'Campanhas', value: org._count.campaigns },
            { label: 'Doações', value: org._count.donations },
            { label: 'Eventos', value: org._count.events },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 font-display">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <Building2 size={18} className="text-slate-500" />
            <h2 className="section-title">Dados da Organização</h2>
          </div>

          <div>
            <label className="label">Nome da Organização *</label>
            <input className="input" required value={form.name || ''} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea className="input" rows={3} value={form.description || ''} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} placeholder="Sobre sua organização..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label"><Mail size={13} className="inline mr-1.5 text-slate-400" />Email</label>
              <input className="input" type="email" value={form.email || ''} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label"><Phone size={13} className="inline mr-1.5 text-slate-400" />Telefone</label>
              <input className="input" value={form.phone || ''} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="label"><Globe size={13} className="inline mr-1.5 text-slate-400" />Website</label>
              <input className="input" type="url" value={form.website || ''} onChange={e => setForm((f: any) => ({ ...f, website: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="label"><MapPin size={13} className="inline mr-1.5 text-slate-400" />Endereço</label>
              <input className="input" value={form.address || ''} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="label">Cidade</label>
              <input className="input" value={form.city || ''} onChange={e => setForm((f: any) => ({ ...f, city: e.target.value }))} />
            </div>
            <div>
              <label className="label">Estado</label>
              <input className="input" value={form.state || ''} onChange={e => setForm((f: any) => ({ ...f, state: e.target.value }))} placeholder="SP" maxLength={2} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          {saved && <span className="text-green-600 text-sm font-medium flex items-center gap-1.5">✓ Salvo com sucesso!</span>}
        </div>
      </form>
    </div>
  )
}
