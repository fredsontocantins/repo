'use client'
import { useEffect, useState, useCallback } from 'react'
import { Heart, Plus, Search, DollarSign, Package, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { api } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { CHART_AXIS, CHART_TOOLTIP_STYLE, DONATION_TYPE_COLOR } from '@/lib/chart-colors'

const TIPO_OPTIONS = ['MONETARY', 'FOOD', 'CLOTHING', 'MEDICINE', 'EQUIPMENT', 'SERVICE', 'OTHER']
const TIPO_LABELS: Record<string, string> = {
  MONETARY: 'Monetária', FOOD: 'Alimentos', CLOTHING: 'Roupas',
  MEDICINE: 'Medicamentos', EQUIPMENT: 'Equipamentos', SERVICE: 'Serviço', OTHER: 'Outro',
}

export default function DonationsPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ tipo: 'MONETARY', valor: '', descricao: '', doadorNome: '', doadorEmail: '', campaignId: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 15 }
      if (tipo) params.tipo = tipo
      const [res, s] = await Promise.all([api.getDonations(params), stats ? null : api.getDonationStats()])
      setData(res)
      if (s) setStats(s)
    } finally { setLoading(false) }
  }, [tipo, page])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createDonation({
        ...form,
        valor: form.valor ? Number(form.valor) : undefined,
        campaignId: form.campaignId ? Number(form.campaignId) : undefined,
      })
      setShowModal(false)
      setForm({ tipo: 'MONETARY', valor: '', descricao: '', doadorNome: '', doadorEmail: '', campaignId: '' })
      load()
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Doações</h1>
          <p className="text-slate-500 text-sm mt-1">{data?.total ?? '—'} doações registradas</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Registrar Doação
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 grid grid-cols-2 gap-4 content-start">
            <div className="card p-4 col-span-2 flex items-center gap-3">
              <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 font-display">{fmtBRL(stats.totalMonetario)}</p>
                <p className="text-xs text-slate-500">Total em dinheiro</p>
              </div>
            </div>
            {stats.byTipo?.slice(0, 4).map((t: any) => (
              <div key={t.tipo} className="card p-3">
                <StatusBadge status={t.tipo} />
                <p className="text-lg font-bold text-slate-900 font-display mt-2">{t.count}</p>
                {t.total > 0 && <p className="text-xs text-slate-400">{fmtBRL(t.total)}</p>}
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 card p-6">
            <h2 className="section-title mb-4">Doações por Tipo</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={stats.byTipo?.map((t: any) => ({ ...t, nome: TIPO_LABELS[t.tipo] || t.tipo }))}
                barSize={32}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_AXIS.grid} vertical={false} />
                <XAxis dataKey="nome" tick={{ fontSize: CHART_AXIS.tickFontSize, fill: CHART_AXIS.tick }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: CHART_AXIS.tickFontSize, fill: CHART_AXIS.tick }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'rgba(34, 81, 138, 0.06)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Quantidade">
                  {stats.byTipo?.map((t: any) => (
                    <Cell key={t.tipo} fill={DONATION_TYPE_COLOR[t.tipo] ?? '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar doações..." />
        </div>
        <select className="input w-auto min-w-[160px]" value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPO_OPTIONS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="card divide-y divide-slate-50">
          {[...Array(6)].map((_, i) => <div key={i} className="p-4 h-16 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3" /></div>)}
        </div>
      ) : data?.data?.length === 0 ? (
        <EmptyState icon={Heart} title="Nenhuma doação encontrada" />
      ) : (
        <div className="card divide-y divide-slate-50">
          {data?.data?.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                  {d.tipo === 'MONETARY' ? <DollarSign size={16} className="text-green-600" /> : <Package size={16} className="text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{d.doadorNome || 'Doador Anônimo'}</p>
                  <p className="text-xs text-slate-400">
                    {d.campaign?.nome || 'Sem campanha'} · {new Date(d.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={d.tipo} />
                <StatusBadge status={d.status} />
                {d.valor && <p className="font-bold text-slate-900 text-sm">{fmtBRL(d.valor)}</p>}
                {d.descricao && !d.valor && <p className="text-sm text-slate-600">{d.descricao}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-secondary px-3 py-2" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
          <span className="text-sm text-slate-600 px-3">Página {page} de {data.totalPages}</span>
          <button className="btn-secondary px-3 py-2" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>→</button>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar Doação">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Tipo de Doação *</label>
            <select className="input" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              {TIPO_OPTIONS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
            </select>
          </div>
          {form.tipo === 'MONETARY' && (
            <div>
              <label className="label">Valor (R$) *</label>
              <input className="input" type="number" min="0" step="0.01" required value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00" />
            </div>
          )}
          {form.tipo !== 'MONETARY' && (
            <div>
              <label className="label">Descrição *</label>
              <textarea className="input" rows={2} required value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descreva a doação..." />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nome do Doador</label>
              <input className="input" value={form.doadorNome} onChange={e => setForm(f => ({ ...f, doadorNome: e.target.value }))} placeholder="Maria Silva" />
            </div>
            <div>
              <label className="label">Email do Doador</label>
              <input className="input" type="email" value={form.doadorEmail} onChange={e => setForm(f => ({ ...f, doadorEmail: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Salvando...' : 'Registrar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
