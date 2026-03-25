'use client'
import { useEffect, useState, useCallback } from 'react'
import { Award, Plus, Search, CheckCircle2, XCircle, Copy, Send, Shield, Download } from 'lucide-react'
import { api } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { clsx } from 'clsx'

const TIPO_LABELS: Record<string, string> = {
  PARTICIPATION: 'Participação', HOURS: 'Horas Voluntariadas',
  ACHIEVEMENT: 'Conquista', RECOGNITION: 'Reconhecimento',
}
const TIPO_COLORS: Record<string, string> = {
  PARTICIPATION: 'bg-blue-50 text-blue-700',
  HOURS: 'bg-amber-50 text-amber-700',
  ACHIEVEMENT: 'bg-purple-50 text-purple-700',
  RECOGNITION: 'bg-brand-50 text-brand-700',
}

const blankForm = {
  volunteerId: '', tipo: 'PARTICIPATION', titulo: '', descricao: '',
  horasCertificadas: '', dataAtividade: '', dataValidade: '',
  campaignId: '', assinante: '', cargoAssinante: '',
}

export default function CertificatesPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [form, setForm] = useState({ ...blankForm })
  const [bulkIds, setBulkIds] = useState('')
  const [bulkForm, setBulkForm] = useState({ tipo: 'PARTICIPATION', titulo: '', descricao: '', horasCertificadas: '', assinante: '', cargoAssinante: '' })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<any>(null)
  const [revokeMotivo, setRevokeMotivo] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 15 }
      const [res, s, vols, camps] = await Promise.all([
        api.getCertificates(params),
        stats ? null : api.getCertificateStats(),
        volunteers.length ? null : api.getVolunteers({ limit: 200 }),
        campaigns.length ? null : api.getCampaigns({ limit: 100 }),
      ])
      setData(res)
      if (s) setStats(s)
      if (vols) setVolunteers(vols.data || [])
      if (camps) setCampaigns(camps.data || [])
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createCertificate({
        ...form,
        volunteerId: Number(form.volunteerId),
        campaignId: form.campaignId ? Number(form.campaignId) : undefined,
        horasCertificadas: form.horasCertificadas ? Number(form.horasCertificadas) : undefined,
        dataAtividade: form.dataAtividade || undefined,
        dataValidade: form.dataValidade || undefined,
      })
      setShowModal(false); setForm({ ...blankForm }); load()
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function handleBulk(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const ids = bulkIds.split(',').map(s => Number(s.trim())).filter(Boolean)
      if (!ids.length) { alert('Informe os IDs dos voluntários'); setSaving(false); return }
      const res = await api.issueBulkCertificates({
        ...bulkForm,
        volunteerIds: ids,
        horasCertificadas: bulkForm.horasCertificadas ? Number(bulkForm.horasCertificadas) : undefined,
      })
      alert(`✅ ${res.emitidos}/${res.total} certificados emitidos com sucesso!`)
      setShowBulkModal(false); load()
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function handleRevoke() {
    if (!revokeTarget || !revokeMotivo) return
    try {
      await api.revokeCertificate(revokeTarget.id, revokeMotivo)
      setRevokeTarget(null); setRevokeMotivo(''); load()
    } catch (e: any) { alert(e.message) }
  }

  function copyCodigo(codigo: string) {
    navigator.clipboard.writeText(codigo)
    setCopied(codigo)
    setTimeout(() => setCopied(null), 2000)
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={15} className="text-brand-500" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Administrativo</span>
          </div>
          <h1 className="page-title">Certificados</h1>
          <p className="text-slate-500 text-sm mt-1">{data?.total ?? '—'} certificados emitidos</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowBulkModal(true)}>
            <Send size={15} /> Emissão em Lote
          </button>
          <button className="btn-primary" onClick={() => { setForm({ ...blankForm }); setShowModal(true) }}>
            <Plus size={15} /> Emitir Certificado
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center"><Award size={16} className="text-brand-600" /></div>
            <div>
              <p className="text-xl font-bold text-slate-900 font-display leading-none">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total emitidos</p>
            </div>
          </div>
          {stats.porTipo?.slice(0, 3).map((t: any) => (
            <div key={t.tipo} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><Award size={16} className="text-blue-500" /></div>
              <div>
                <p className="text-xl font-bold text-slate-900 font-display leading-none">{t._count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{TIPO_LABELS[t.tipo]}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar certificados..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="card divide-y divide-slate-50">{[...Array(6)].map((_, i) => <div key={i} className="p-5 h-16 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3" /></div>)}</div>
      ) : data?.data?.length === 0 ? (
        <EmptyState icon={Award} title="Nenhum certificado emitido" description="Emita o primeiro certificado para um voluntário."
          action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={15} />Emitir Certificado</button>} />
      ) : (
        <div className="card divide-y divide-slate-50">
          {data?.data?.map((c: any) => (
            <div key={c.id} className={clsx('px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors', c.revogado && 'opacity-60')}>
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award size={18} className={c.revogado ? 'text-red-400' : 'text-brand-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">{c.titulo}</p>
                  <span className={clsx('badge-pill text-xs', TIPO_COLORS[c.tipo] || 'bg-slate-100 text-slate-600')}>
                    {TIPO_LABELS[c.tipo]}
                  </span>
                  {c.revogado && <span className="badge-pill bg-red-50 text-red-500 text-xs">Revogado</span>}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {c.volunteer?.nome} · {fmtDate(c.dataEmissao)}
                  {c.campaign && ` · ${c.campaign.nome}`}
                  {c.horasCertificadas && ` · ${c.horasCertificadas}h`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Código copiável */}
                <button
                  onClick={() => copyCodigo(c.codigo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-700 transition-all"
                  title="Copiar código">
                  {copied === c.codigo ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                  {c.codigo}
                </button>

                <a href={`/portal/certificate?codigo=${c.codigo}`} target="_blank"
                  className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all" title="Ver certificado">
                  <Download size={14} />
                </a>

                {!c.revogado && (
                  <button onClick={() => setRevokeTarget(c)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Revogar">
                    <XCircle size={14} />
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

      {/* Emit modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Emitir Certificado" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Voluntário *</label>
              <select className="input" required value={form.volunteerId} onChange={e => setForm(f => ({ ...f, volunteerId: e.target.value }))}>
                <option value="">Selecione o voluntário...</option>
                {volunteers.map(v => <option key={v.id} value={v.id}>{v.nome} {v.email ? `(${v.email})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Campanha (opcional)</label>
              <select className="input" value={form.campaignId} onChange={e => setForm(f => ({ ...f, campaignId: e.target.value }))}>
                <option value="">Nenhuma</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Título do Certificado *</label>
              <input className="input" required value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Participação no Mutirão de Limpeza 2024" />
            </div>
            <div className="col-span-2">
              <label className="label">Texto descritivo</label>
              <textarea className="input" rows={2} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Participou ativamente contribuindo com..." />
            </div>
            <div>
              <label className="label">Horas certificadas</label>
              <input className="input" type="number" min="0" step="0.5" value={form.horasCertificadas}
                onChange={e => setForm(f => ({ ...f, horasCertificadas: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className="label">Data da atividade</label>
              <input className="input" type="date" value={form.dataAtividade}
                onChange={e => setForm(f => ({ ...f, dataAtividade: e.target.value }))} />
            </div>
            <div>
              <label className="label">Assinante</label>
              <input className="input" value={form.assinante} onChange={e => setForm(f => ({ ...f, assinante: e.target.value }))}
                placeholder="Nome do responsável" />
            </div>
            <div>
              <label className="label">Cargo do assinante</label>
              <input className="input" value={form.cargoAssinante} onChange={e => setForm(f => ({ ...f, cargoAssinante: e.target.value }))}
                placeholder="Diretora Executiva" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Emitindo...' : 'Emitir Certificado'}</button>
          </div>
        </form>
      </Modal>

      {/* Bulk modal */}
      <Modal open={showBulkModal} onClose={() => setShowBulkModal(false)} title="Emissão em Lote" size="lg">
        <form onSubmit={handleBulk} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            💡 Informe os IDs dos voluntários separados por vírgula. Ex: <code className="font-mono">1, 4, 7, 12</code>
          </div>
          <div>
            <label className="label">IDs dos Voluntários *</label>
            <textarea className="input font-mono" rows={2} required value={bulkIds}
              onChange={e => setBulkIds(e.target.value)} placeholder="1, 4, 7, 12, 15..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={bulkForm.tipo} onChange={e => setBulkForm(f => ({ ...f, tipo: e.target.value }))}>
                {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Horas certificadas</label>
              <input className="input" type="number" min="0" step="0.5" value={bulkForm.horasCertificadas}
                onChange={e => setBulkForm(f => ({ ...f, horasCertificadas: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">Título *</label>
              <input className="input" required value={bulkForm.titulo} onChange={e => setBulkForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Certificado de Participação — Campanha 2024" />
            </div>
            <div className="col-span-2">
              <label className="label">Texto descritivo</label>
              <textarea className="input" rows={2} value={bulkForm.descricao}
                onChange={e => setBulkForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Participou ativamente..." />
            </div>
            <div>
              <label className="label">Assinante</label>
              <input className="input" value={bulkForm.assinante} onChange={e => setBulkForm(f => ({ ...f, assinante: e.target.value }))} />
            </div>
            <div>
              <label className="label">Cargo do assinante</label>
              <input className="input" value={bulkForm.cargoAssinante} onChange={e => setBulkForm(f => ({ ...f, cargoAssinante: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowBulkModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Emitindo...' : 'Emitir em Lote'}</button>
          </div>
        </form>
      </Modal>

      {/* Revoke confirm */}
      <Modal open={!!revokeTarget} onClose={() => { setRevokeTarget(null); setRevokeMotivo('') }} title="Revogar Certificado" size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            Você está revogando o certificado <strong>{revokeTarget?.titulo}</strong> de <strong>{revokeTarget?.volunteer?.nome}</strong>.
            Esta ação não pode ser desfeita.
          </div>
          <div>
            <label className="label">Motivo da revogação *</label>
            <textarea className="input" rows={3} required value={revokeMotivo}
              onChange={e => setRevokeMotivo(e.target.value)} placeholder="Descreva o motivo..." />
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => { setRevokeTarget(null); setRevokeMotivo('') }}>Cancelar</button>
            <button className="btn-danger flex-1" onClick={handleRevoke} disabled={!revokeMotivo.trim()}>Revogar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
