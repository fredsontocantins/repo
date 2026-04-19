'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Clock, XCircle, RotateCcw, Plus, ChevronDown, ChevronUp,
  CreditCard, ArrowDownCircle, ArrowUpCircle, DollarSign,
  Calendar, Search, Filter, RefreshCw
} from 'lucide-react'
import { api } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import { clsx } from 'clsx'
import { fmtBRL } from '@/lib/format'

// ─── Constants ──────────────────────────────────────────────────────────────

const PAY_STATUS_CFG: Record<string, { label: string; icon: any; bg: string; text: string; border: string; dot: string }> = {
  A_PAGAR:   { label: 'A Pagar',   icon: Clock,        bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  PAGO:      { label: 'Pago',      icon: CheckCircle2, bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  VENCIDO:   { label: 'Vencido',   icon: AlertTriangle,bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  CANCELADO: { label: 'Cancelado', icon: XCircle,      bg: 'bg-slate-100', text: 'text-slate-500',  border: 'border-slate-200',  dot: 'bg-slate-400' },
  ESTORNADO: { label: 'Estornado', icon: RotateCcw,    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
}

const REC_STATUS_CFG: Record<string, { label: string; icon: any; bg: string; text: string; border: string; dot: string }> = {
  A_RECEBER: { label: 'A Receber', icon: Clock,        bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  RECEBIDO:  { label: 'Recebido',  icon: CheckCircle2, bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  VENCIDO:   { label: 'Vencido',   icon: AlertTriangle,bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  CANCELADO: { label: 'Cancelado', icon: XCircle,      bg: 'bg-slate-100', text: 'text-slate-500',  border: 'border-slate-200',  dot: 'bg-slate-400' },
  ESTORNADO: { label: 'Estornado', icon: RotateCcw,    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
}

const PAY_CATS: Record<string, string> = {
  SALARIO: 'Salário', ALUGUEL: 'Aluguel', SERVICO: 'Serviço', MATERIAL: 'Material',
  TRANSPORTE: 'Transporte', ALIMENTACAO: 'Alimentação', MARKETING: 'Marketing',
  JURIDICO: 'Jurídico', CONTABILIDADE: 'Contabilidade', TECNOLOGIA: 'Tecnologia', OUTRO: 'Outro',
}

const REC_CATS: Record<string, string> = {
  DOACAO: 'Doação', PATROCINIO: 'Patrocínio', SUBVENCAO: 'Subvenção', PROJETO: 'Projeto',
  EVENTO: 'Evento', SERVICO_PRESTADO: 'Serviço Prestado', REEMBOLSO: 'Reembolso', OUTRO: 'Outro',
}

const FORMAS = ['PIX', 'TED', 'DOC', 'Boleto', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Cheque', 'Outro']

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusPill({ status, cfg }: { status: string; cfg: typeof PAY_STATUS_CFG }) {
  const c = cfg[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', icon: Clock }
  const Icon = c.icon
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border', c.bg, c.text, c.border)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}

// ─── Summary card ────────────────────────────────────────────────────────────
function SummaryCard({ label, value, sub, icon: Icon, colorClass, warn }: any) {
  return (
    <div className={clsx('card p-5 flex items-start justify-between', warn && 'border-red-200 bg-red-50/30')}>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={clsx('text-2xl font-black font-display', colorClass || 'text-slate-900')}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', warn ? 'bg-red-100' : 'bg-slate-100')}>
        <Icon size={18} className={warn ? 'text-red-500' : 'text-slate-500'} />
      </div>
    </div>
  )
}

function ExecStat({ label, value, sub, accent }: any) {
  return (
    <div className="card p-4 border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={clsx('text-2xl font-black font-display', accent || 'text-slate-900')}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

const formatPercent = (value?: number) => (value !== undefined ? `${Math.round(value * 100)}%` : '—')

function TrendChart({ data }: { data?: { label: string; payables: number; receivables: number; net: number }[] }) {
  if (!data) return null
  const maxAmount = Math.max(...data.map(d => Math.max(d.payables, d.receivables)), 1)
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="section-title text-sm">Fluxo de caixa • últimos 6 meses</h3>
        <span className="text-xs text-slate-500">Pagar / Receber</span>
      </div>
      <div className="flex items-end gap-3 h-32">
        {data.map(point => {
          const heightPay = Math.max(1, (point.payables / maxAmount) * 100)
          const heightRec = Math.max(1, (point.receivables / maxAmount) * 100)
          return (
            <div key={point.label} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex items-end gap-1 w-full h-24">
                <div className="w-2 bg-red-400 rounded-t-lg" style={{ height: `${heightPay}%` }} />
                <div className="w-2 bg-brand-400 rounded-t-lg" style={{ height: `${heightRec}%` }} />
              </div>
              <span className="text-xs text-slate-400">{point.label}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" />Pagar</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-brand-400 rounded-full" />Receber</span>
      </div>
    </div>
  )
}

function MixList({ title, data, total }: { title: string; data: { category: string; valor: number }[]; total: number }) {
  if (!data?.length) return null
  return (
    <div className="card p-5 space-y-3">
      <h3 className="section-title text-sm">{title}</h3>
      <div className="space-y-2 text-sm">
        {data.slice(0, 5).map(item => (
          <div key={item.category} className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{item.category}</p>
              <div className="h-1.5 w-full mt-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-800" style={{ width: `${Math.min(100, (item.valor / total) * 100)}%` }} />
              </div>
            </div>
            <span className="text-xs text-slate-500">{formatPercent(total ? item.valor / total : 0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const agingLabelMap: Record<string, string> = {
  'Até vencer': 'Até o vencimento',
  '0-30 dias': 'Vencidos até 30 dias',
  '31-60 dias': 'Vencidos 31-60 dias',
  '+60 dias': 'Atrasados acima de 60 dias',
}

const normalizeAgingLabel = (label: string) => agingLabelMap[label] || label

function AgingList({ label, buckets }: { label: string; buckets?: { label: string; value: number }[] }) {
  if (!buckets?.length) return null
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title text-sm">{label}</h3>
        <span className="text-xs text-slate-500">Dias em atraso</span>
      </div>
      <p className="text-xs text-slate-400 mb-3">Valores agrupados por faixa de atraso. Fonte: saneamento automático do sistema.</p>
      <div className="space-y-2 text-sm text-slate-600">
        {buckets.map(bucket => (
          <div key={bucket.label} className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{normalizeAgingLabel(bucket.label)}</span>
            <span className="font-semibold text-slate-800">{fmtBRL(bucket.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HorizonCards({ data }: { data?: { days: number; payables: number; receivables: number }[] }) {
  if (!data?.length) return null
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map(item => (
        <div key={item.days} className="card p-4 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Próximos {item.days} dias</p>
          <p className="text-sm text-slate-400 mt-1">A pagar</p>
          <p className="text-lg font-bold text-red-600 mb-1">{fmtBRL(item.payables)}</p>
          <p className="text-sm text-slate-400">A receber</p>
          <p className="text-lg font-bold text-brand-600">{fmtBRL(item.receivables)}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Quick action buttons per status ─────────────────────────────────────────
function PayableActions({ row, onAction }: { row: any; onAction: (action: string, row: any) => void }) {
  if (row.status === 'PAGO') return (
    <button onClick={() => onAction('estornar_pay', row)}
      className="text-xs px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 font-semibold flex items-center gap-1 transition-all">
      <RotateCcw size={11} /> Estornar
    </button>
  )
  if (['CANCELADO', 'ESTORNADO'].includes(row.status)) return (
    <span className="text-xs text-slate-400 italic">—</span>
  )
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onAction('pagar', row)}
        className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-semibold flex items-center gap-1 transition-all">
        <CheckCircle2 size={11} /> Pagar
      </button>
      <button onClick={() => onAction('cancelar_pay', row)}
        className="text-xs px-2 py-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200 font-semibold transition-all">
        <XCircle size={13} />
      </button>
    </div>
  )
}

function ReceivableActions({ row, onAction }: { row: any; onAction: (action: string, row: any) => void }) {
  if (row.status === 'RECEBIDO') return (
    <button onClick={() => onAction('estornar_rec', row)}
      className="text-xs px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 font-semibold flex items-center gap-1 transition-all">
      <RotateCcw size={11} /> Estornar
    </button>
  )
  if (['CANCELADO', 'ESTORNADO'].includes(row.status)) return (
    <span className="text-xs text-slate-400 italic">—</span>
  )
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onAction('receber', row)}
        className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-semibold flex items-center gap-1 transition-all">
        <CheckCircle2 size={11} /> Receber
      </button>
      <button onClick={() => onAction('cancelar_rec', row)}
        className="text-xs px-2 py-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200 font-semibold transition-all">
        <XCircle size={13} />
      </button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'pagar' | 'receber'

const blankPay = { descricao: '', categoria: 'OUTRO', valor: '', vencimento: '', fornecedor: '', notaFiscal: '', observacao: '' }
const blankRec = { descricao: '', categoria: 'DOACAO', valor: '', vencimento: '', pagador: '', emailPagador: '', observacao: '' }
const blankLiqPay = { valorPago: '', formaPagamento: 'PIX', dataPagamento: '', comprovante: '', observacao: '' }
const blankLiqRec = { valorRecebido: '', formaRecebimento: 'PIX', dataRecebimento: '', comprovante: '', observacao: '' }

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [dash, setDash] = useState<any>(null)
  const [payables, setPayables] = useState<any>(null)
  const [receivables, setReceivables] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [payStatus, setPayStatus] = useState('')
  const [recStatus, setRecStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Modals
  const [modal, setModal] = useState<string | null>(null)
  const [activeRow, setActiveRow] = useState<any>(null)
  const [formPay, setFormPay] = useState({ ...blankPay })
  const [formRec, setFormRec] = useState({ ...blankRec })
  const [formLiqPay, setFormLiqPay] = useState({ ...blankLiqPay })
  const [formLiqRec, setFormLiqRec] = useState({ ...blankLiqRec })
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
  const isVencido = (v: string) => v && new Date(v) < new Date()

  const loadDash = useCallback(async () => {
    const d = await api.getFinanceDashboard()
    setDash(d)
  }, [])

  const loadPayables = useCallback(async () => {
    const p: any = { page, limit: 20 }
    if (payStatus) p.status = payStatus
    if (search) p.search = search
    setPayables(await api.getPayables(p))
  }, [page, payStatus, search])

  const loadReceivables = useCallback(async () => {
    const p: any = { page, limit: 20 }
    if (recStatus) p.status = recStatus
    if (search) p.search = search
    setReceivables(await api.getReceivables(p))
  }, [page, recStatus, search])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadDash(), loadPayables(), loadReceivables()]).finally(() => setLoading(false))
  }, [loadDash, loadPayables, loadReceivables])

  function reload() { loadDash(); loadPayables(); loadReceivables() }

  function onAction(action: string, row: any) {
    setActiveRow(row)
    setMotivo('')
    if (action === 'pagar') {
      setFormLiqPay({ ...blankLiqPay, valorPago: String(row.valor), dataPagamento: new Date().toISOString().slice(0, 10) })
      setModal('liquidar_pay')
    } else if (action === 'receber') {
      setFormLiqRec({ ...blankLiqRec, valorRecebido: String(row.valor), dataRecebimento: new Date().toISOString().slice(0, 10) })
      setModal('liquidar_rec')
    } else {
      setModal(action)
    }
  }

  async function handleSavePay(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await api.createPayable({ ...formPay, valor: Number(formPay.valor) })
      setModal(null); setFormPay({ ...blankPay }); reload()
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function handleSaveRec(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await api.createReceivable({ ...formRec, valor: Number(formRec.valor) })
      setModal(null); setFormRec({ ...blankRec }); reload()
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function handleLiquidarPay(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await api.liquidarPayable(activeRow.id, { ...formLiqPay, valorPago: Number(formLiqPay.valorPago) })
      setDash(prev => {
        const payId = activeRow?.id
        if (!prev || !payId) return prev
        return {
          ...prev,
          risks: prev.risks?.filter(r => r.id !== payId) || [],
          proximosVencPay: prev.proximosVencPay?.filter(p => p.id !== payId) || [],
        }
      })
      setModal(null); reload()
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function handleLiquidarRec(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await api.liquidarReceivable(activeRow.id, { ...formLiqRec, valorRecebido: Number(formLiqRec.valorRecebido) })
      setModal(null); reload()
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function handleEstornarPay() {
    if (!motivo.trim()) return
    setSaving(true)
    try { await api.estornarPayable(activeRow.id, motivo); setModal(null); reload() }
    catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function handleEstornarRec() {
    if (!motivo.trim()) return
    setSaving(true)
    try { await api.estornarReceivable(activeRow.id, motivo); setModal(null); reload() }
    catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function handleCancelarPay() {
    if (!motivo.trim()) return
    setSaving(true)
    try { await api.cancelarPayable(activeRow.id, motivo); setModal(null); reload() }
    catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function handleCancelarRec() {
    if (!motivo.trim()) return
    setSaving(true)
    try { await api.cancelarReceivable(activeRow.id, motivo); setModal(null); reload() }
    catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  const d = dash?.resumo
  const exec = dash?.execSummary
  const trend = dash?.cashFlowTrend
  const paymentMixTotal = dash?.paymentMix?.reduce((sum: number, item: any) => sum + item.valor, 0) || 0
  const receivableMixTotal = dash?.receivableMix?.reduce((sum: number, item: any) => sum + item.valor, 0) || 0
  const payMixData = dash?.paymentMix?.map((item: any) => ({ ...item, category: PAY_CATS[item.category] || item.category })) || []
  const recMixData = dash?.receivableMix?.map((item: any) => ({ ...item, category: REC_CATS[item.category] || item.category })) || []
  const budget = dash?.budgetComparison
  const aging = dash?.aging
  const upcoming = dash?.upcomingWindows
  const risks = dash?.risks

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2"><Wallet size={24} className="text-brand-500" />Controle Financeiro</h1>
          <p className="text-slate-500 text-sm mt-1">Gestão de contas a pagar e a receber</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reload} className="btn-secondary text-xs py-2 px-3"><RefreshCw size={13} /> Atualizar</button>
          <button onClick={() => { setFormRec({ ...blankRec }); setModal('new_rec') }}
            className="btn-secondary text-xs py-2 px-3 text-green-700 border-green-200 hover:bg-green-50">
            <ArrowDownCircle size={14} className="text-green-600" /> A Receber
          </button>
          <button onClick={() => { setFormPay({ ...blankPay }); setModal('new_pay') }}
            className="btn-primary text-xs py-2 px-3">
            <ArrowUpCircle size={14} /> A Pagar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {([['dashboard', 'Dashboard', Wallet], ['pagar', 'Contas a Pagar', ArrowUpCircle], ['receber', 'Contas a Receber', ArrowDownCircle]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => { setTab(key); setPage(1) }}
            className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* Saldo + resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Saldo Atual" value={fmtBRL(d?.saldoAtual || 0)}
              sub="Recebido − Pago"
              icon={DollarSign}
              colorClass={d?.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'} />
            <SummaryCard label="Total a Pagar" value={fmtBRL(d?.totalAPagar || 0)}
              sub="Em aberto no prazo" icon={ArrowUpCircle} colorClass="text-blue-600" />
            <SummaryCard label="Total a Receber" value={fmtBRL(d?.totalAReceber || 0)}
              sub="Em aberto no prazo" icon={ArrowDownCircle} colorClass="text-indigo-600" />
            <SummaryCard label="Vencidos a Pagar" value={fmtBRL(d?.payVencidoValor || 0)}
              sub={`${d?.payVencidoCount || 0} título(s) vencido(s)`}
              icon={AlertTriangle} warn={d?.payVencidoCount > 0} />
          </div>

          {exec && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ExecStat label="Caixa disponível" value={fmtBRL(exec.cashOnHand || 0)} sub="Recebido − Pago" accent="text-slate-900" />
              <ExecStat label="Fluxo líquido (30d)" value={fmtBRL(exec.netFlowLast30 || 0)}
                sub="Receitas − pagamentos" accent={exec.netFlowLast30 >= 0 ? 'text-brand-600' : 'text-red-600'} />
              <ExecStat label="Runway" value={exec.runwayDays === null ? '> 365 dias' : `${exec.runwayDays} dias`}
                sub={exec.runRisk ? 'Atenção: fluxo apertado' : 'Estável'} accent={exec.runRisk ? 'text-orange-600' : 'text-slate-900'} />
              <ExecStat label="Cobertura de recebíveis" value={formatPercent(exec.receivableCoverage)} sub="Planejado vs. recebido" />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><TrendChart data={trend} /></div>
            <div className="space-y-4">
              <div className="card p-5 space-y-3">
                <h3 className="section-title text-sm">Orçamento vs Realizado</h3>
                {[['payables', 'Contas a pagar', 'bg-red-500'], ['receivables', 'Contas a receber', 'bg-brand-500']].map(([key, label, barColor]) => {
                  const config = key === 'payables' ? budget?.payables : budget?.receivables
                  const planned = config?.planned || 0
                  const actual = config?.actual || 0
                  const ratio = planned > 0 ? Math.min(100, (actual / planned) * 100) : 100
                  return (
                    <div key={key} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{label}</span>
                        <span>{planned ? `${Math.round(actual / planned * 100)}%` : '—'}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${ratio}%` }} />
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Planejado {fmtBRL(planned)}</span>
                        <span>Realizado {fmtBRL(actual)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <MixList title="Mix de pagamentos" data={payMixData} total={paymentMixTotal} />
            <MixList title="Mix de recebimentos" data={recMixData} total={receivableMixTotal} />
            <div className="space-y-4">
              <AgingList label="Mapa de atrasos • Contas a pagar" buckets={aging?.payables} />
              <AgingList label="Mapa de atrasos • Contas a receber" buckets={aging?.receivables} />
            </div>
          </div>

          <HorizonCards data={upcoming} />

          {risks?.length > 0 && (
            <div className="card p-5 border border-orange-200 bg-orange-50/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title text-sm">Principais riscos</h3>
                <span className="text-xs text-orange-600">Maiores vencidos</span>
              </div>
              <div className="space-y-3 text-sm">
                {risks.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-orange-700">{item.descricao}</p>
                      <p className="text-xs text-orange-500">{fmtBRL(item.valor)} · {fmtDate(item.vencimento)}</p>
                    </div>
                    <button onClick={() => onAction('pagar', item)}
                      className="text-xs px-3 py-1.5 rounded-full bg-orange-600 text-white">Liquidar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status breakdown - Pagar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <ArrowUpCircle size={16} className="text-red-500" /> Contas a Pagar — por Status
              </h3>
              <div className="space-y-2">
                {Object.keys(PAY_STATUS_CFG).map(s => {
                  const item = dash?.payByStatus?.find((x: any) => x.status === s)
                  const cfg = PAY_STATUS_CFG[s]
                  return (
                    <button key={s} onClick={() => { setTab('pagar'); setPayStatus(s) }}
                      className={clsx('w-full flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm', cfg.bg, cfg.border)}>
                      <div className="flex items-center gap-2">
                        <span className={clsx('w-2 h-2 rounded-full', cfg.dot)} />
                        <span className={clsx('text-sm font-semibold', cfg.text)}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={clsx('text-xs font-medium', cfg.text)}>{item?._count || 0} títulos</span>
                        <span className={clsx('text-sm font-bold', cfg.text)}>{fmtBRL(item?.valor || 0)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status breakdown - Receber */}
            <div className="card p-5">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <ArrowDownCircle size={16} className="text-green-500" /> Contas a Receber — por Status
              </h3>
              <div className="space-y-2">
                {Object.keys(REC_STATUS_CFG).map(s => {
                  const item = dash?.recByStatus?.find((x: any) => x.status === s)
                  const cfg = REC_STATUS_CFG[s]
                  return (
                    <button key={s} onClick={() => { setTab('receber'); setRecStatus(s) }}
                      className={clsx('w-full flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-sm', cfg.bg, cfg.border)}>
                      <div className="flex items-center gap-2">
                        <span className={clsx('w-2 h-2 rounded-full', cfg.dot)} />
                        <span className={clsx('text-sm font-semibold', cfg.text)}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={clsx('text-xs font-medium', cfg.text)}>{item?._count || 0} títulos</span>
                        <span className={clsx('text-sm font-bold', cfg.text)}>{fmtBRL(item?.valor || 0)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Próximos vencimentos */}
          {(dash?.proximosVencPay?.length > 0 || dash?.proximosVencRec?.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="section-title mb-3 text-red-600 flex items-center gap-2">
                  <Calendar size={15} /> Vencem nos próximos 7 dias — Pagar
                </h3>
                {dash?.proximosVencPay?.length === 0
                  ? <p className="text-slate-400 text-sm">Nenhum vencimento próximo.</p>
                  : dash?.proximosVencPay?.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.descricao}</p>
                        <p className="text-xs text-slate-400">{p.fornecedor || PAY_CATS[p.categoria]} · {fmtDate(p.vencimento)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">{fmtBRL(p.valor)}</span>
                        <button onClick={() => onAction('pagar', p)}
                          className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 font-semibold hover:bg-green-100 transition-all">
                          Pagar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="card p-5">
                <h3 className="section-title mb-3 text-indigo-600 flex items-center gap-2">
                  <Calendar size={15} /> Vencem nos próximos 7 dias — Receber
                </h3>
                {dash?.proximosVencRec?.length === 0
                  ? <p className="text-slate-400 text-sm">Nenhum vencimento próximo.</p>
                  : dash?.proximosVencRec?.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.descricao}</p>
                        <p className="text-xs text-slate-400">{r.pagador || REC_CATS[r.categoria]} · {fmtDate(r.vencimento)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-indigo-600">{fmtBRL(r.valor)}</span>
                        <button onClick={() => onAction('receber', r)}
                          className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 font-semibold hover:bg-green-100 transition-all">
                          Receber
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PAGAR TAB ── */}
      {tab === 'pagar' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="card p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-8 text-sm" placeholder="Buscar descrição, fornecedor..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['', 'A_PAGAR', 'VENCIDO', 'PAGO', 'CANCELADO', 'ESTORNADO'].map(s => {
                const cfg = s ? PAY_STATUS_CFG[s] : null
                return (
                  <button key={s} onClick={() => { setPayStatus(s); setPage(1) }}
                    className={clsx('text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all',
                      payStatus === s
                        ? (cfg ? clsx(cfg.bg, cfg.text, cfg.border) : 'bg-slate-800 text-white border-slate-800')
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50')}>
                    {cfg ? (
                      <span className="flex items-center gap-1.5">
                        <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />{cfg.label}
                      </span>
                    ) : 'Todos'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {['Status', 'Descrição', 'Categoria', 'Fornecedor', 'Vencimento', 'Valor', 'Pago', 'Ações'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-5 bg-slate-100 rounded animate-pulse" /></td></tr>
                    ))
                  ) : payables?.data?.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Nenhuma conta a pagar encontrada</td></tr>
                  ) : payables?.data?.map((p: any) => (
                    <tr key={p.id} className={clsx('border-b border-slate-50 hover:bg-slate-50/60 transition-colors',
                      p.status === 'VENCIDO' && 'bg-red-50/30',
                      p.status === 'PAGO' && 'bg-green-50/20',
                      ['CANCELADO', 'ESTORNADO'].includes(p.status) && 'opacity-60')}>
                      <td className="px-4 py-3"><StatusPill status={p.status} cfg={PAY_STATUS_CFG} /></td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">{p.descricao}</p>
                        {p.notaFiscal && <p className="text-xs text-slate-400">NF: {p.notaFiscal}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{PAY_CATS[p.categoria] || p.categoria}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{p.fornecedor || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-xs font-semibold', isVencido(p.vencimento) && p.status !== 'PAGO' ? 'text-red-600' : 'text-slate-600')}>
                          {fmtDate(p.vencimento)}
                        </span>
                        {p.dataPagamento && <p className="text-xs text-green-600 mt-0.5">Pago: {fmtDate(p.dataPagamento)}</p>}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 text-sm whitespace-nowrap">{fmtBRL(p.valor)}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {p.valorPago ? <span className="text-green-600 font-semibold">{fmtBRL(p.valorPago)}</span> : <span className="text-slate-300">—</span>}
                        {p.formaPagamento && <p className="text-xs text-slate-400">{p.formaPagamento}</p>}
                      </td>
                      <td className="px-4 py-3"><PayableActions row={p} onAction={onAction} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {payables && payables.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button className="btn-secondary px-3 py-2 text-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
              <span className="text-sm text-slate-500">Página {page} de {payables.totalPages}</span>
              <button className="btn-secondary px-3 py-2 text-sm" onClick={() => setPage(p => p + 1)} disabled={page === payables.totalPages}>→</button>
            </div>
          )}
        </div>
      )}

      {/* ── RECEBER TAB ── */}
      {tab === 'receber' && (
        <div className="space-y-4">
          <div className="card p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-8 text-sm" placeholder="Buscar descrição, pagador..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['', 'A_RECEBER', 'VENCIDO', 'RECEBIDO', 'CANCELADO', 'ESTORNADO'].map(s => {
                const cfg = s ? REC_STATUS_CFG[s] : null
                return (
                  <button key={s} onClick={() => { setRecStatus(s); setPage(1) }}
                    className={clsx('text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all',
                      recStatus === s
                        ? (cfg ? clsx(cfg.bg, cfg.text, cfg.border) : 'bg-slate-800 text-white border-slate-800')
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50')}>
                    {cfg ? (
                      <span className="flex items-center gap-1.5">
                        <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />{cfg.label}
                      </span>
                    ) : 'Todos'}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {['Status', 'Descrição', 'Categoria', 'Pagador', 'Vencimento', 'Valor', 'Recebido', 'Ações'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-5 bg-slate-100 rounded animate-pulse" /></td></tr>
                    ))
                  ) : receivables?.data?.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Nenhuma conta a receber encontrada</td></tr>
                  ) : receivables?.data?.map((r: any) => (
                    <tr key={r.id} className={clsx('border-b border-slate-50 hover:bg-slate-50/60 transition-colors',
                      r.status === 'VENCIDO' && 'bg-red-50/30',
                      r.status === 'RECEBIDO' && 'bg-green-50/20',
                      ['CANCELADO', 'ESTORNADO'].includes(r.status) && 'opacity-60')}>
                      <td className="px-4 py-3"><StatusPill status={r.status} cfg={REC_STATUS_CFG} /></td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">{r.descricao}</p>
                        {r.campaign && <p className="text-xs text-brand-500">{r.campaign.nome}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{REC_CATS[r.categoria] || r.categoria}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{r.pagador || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-xs font-semibold', isVencido(r.vencimento) && r.status !== 'RECEBIDO' ? 'text-red-600' : 'text-slate-600')}>
                          {fmtDate(r.vencimento)}
                        </span>
                        {r.dataRecebimento && <p className="text-xs text-green-600 mt-0.5">Recebido: {fmtDate(r.dataRecebimento)}</p>}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 text-sm whitespace-nowrap">{fmtBRL(r.valor)}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {r.valorRecebido ? <span className="text-green-600 font-semibold">{fmtBRL(r.valorRecebido)}</span> : <span className="text-slate-300">—</span>}
                        {r.formaRecebimento && <p className="text-xs text-slate-400">{r.formaRecebimento}</p>}
                      </td>
                      <td className="px-4 py-3"><ReceivableActions row={r} onAction={onAction} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {receivables && receivables.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button className="btn-secondary px-3 py-2 text-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
              <span className="text-sm text-slate-500">Página {page} de {receivables.totalPages}</span>
              <button className="btn-secondary px-3 py-2 text-sm" onClick={() => setPage(p => p + 1)} disabled={page === receivables.totalPages}>→</button>
            </div>
          )}
        </div>
      )}

      {/* ═══ MODALS ═══════════════════════════════════════════════════════════ */}

      {/* Nova conta a pagar */}
      <Modal open={modal === 'new_pay'} onClose={() => setModal(null)} title="Nova Conta a Pagar" size="lg">
        <form onSubmit={handleSavePay} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Descrição *</label>
              <input className="input" required value={formPay.descricao} onChange={e => setFormPay(f => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Aluguel sede — Maio/2025" /></div>
            <div><label className="label">Categoria</label>
              <select className="input" value={formPay.categoria} onChange={e => setFormPay(f => ({ ...f, categoria: e.target.value }))}>
                {Object.entries(PAY_CATS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            <div><label className="label">Fornecedor</label>
              <input className="input" value={formPay.fornecedor} onChange={e => setFormPay(f => ({ ...f, fornecedor: e.target.value }))} /></div>
            <div><label className="label">Valor (R$) *</label>
              <input className="input" type="number" min="0" step="0.01" required value={formPay.valor}
                onChange={e => setFormPay(f => ({ ...f, valor: e.target.value }))} /></div>
            <div><label className="label">Vencimento *</label>
              <input className="input" type="date" required value={formPay.vencimento}
                onChange={e => setFormPay(f => ({ ...f, vencimento: e.target.value }))} /></div>
            <div><label className="label">Nota Fiscal</label>
              <input className="input" value={formPay.notaFiscal} onChange={e => setFormPay(f => ({ ...f, notaFiscal: e.target.value }))} /></div>
            <div className="col-span-2"><label className="label">Observação</label>
              <textarea className="input" rows={2} value={formPay.observacao}
                onChange={e => setFormPay(f => ({ ...f, observacao: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Salvando...' : 'Criar'}</button>
          </div>
        </form>
      </Modal>

      {/* Nova conta a receber */}
      <Modal open={modal === 'new_rec'} onClose={() => setModal(null)} title="Nova Conta a Receber" size="lg">
        <form onSubmit={handleSaveRec} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Descrição *</label>
              <input className="input" required value={formRec.descricao} onChange={e => setFormRec(f => ({ ...f, descricao: e.target.value }))} /></div>
            <div><label className="label">Categoria</label>
              <select className="input" value={formRec.categoria} onChange={e => setFormRec(f => ({ ...f, categoria: e.target.value }))}>
                {Object.entries(REC_CATS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            <div><label className="label">Pagador / Origem</label>
              <input className="input" value={formRec.pagador} onChange={e => setFormRec(f => ({ ...f, pagador: e.target.value }))} /></div>
            <div><label className="label">Valor (R$) *</label>
              <input className="input" type="number" min="0" step="0.01" required value={formRec.valor}
                onChange={e => setFormRec(f => ({ ...f, valor: e.target.value }))} /></div>
            <div><label className="label">Vencimento *</label>
              <input className="input" type="date" required value={formRec.vencimento}
                onChange={e => setFormRec(f => ({ ...f, vencimento: e.target.value }))} /></div>
            <div className="col-span-2"><label className="label">Observação</label>
              <textarea className="input" rows={2} value={formRec.observacao}
                onChange={e => setFormRec(f => ({ ...f, observacao: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Salvando...' : 'Criar'}</button>
          </div>
        </form>
      </Modal>

      {/* Liquidar - Pagar */}
      <Modal open={modal === 'liquidar_pay'} onClose={() => setModal(null)} title={`Pagar: ${activeRow?.descricao}`} size="md">
        <form onSubmit={handleLiquidarPay} className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            Valor original: <strong>{fmtBRL(activeRow?.valor)}</strong> · Vencimento: <strong>{fmtDate(activeRow?.vencimento)}</strong>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Valor Pago (R$) *</label>
              <input className="input" type="number" min="0" step="0.01" required value={formLiqPay.valorPago}
                onChange={e => setFormLiqPay(f => ({ ...f, valorPago: e.target.value }))} /></div>
            <div><label className="label">Forma de Pagamento *</label>
              <select className="input" required value={formLiqPay.formaPagamento}
                onChange={e => setFormLiqPay(f => ({ ...f, formaPagamento: e.target.value }))}>
                {FORMAS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
            <div><label className="label">Data do Pagamento</label>
              <input className="input" type="date" value={formLiqPay.dataPagamento}
                onChange={e => setFormLiqPay(f => ({ ...f, dataPagamento: e.target.value }))} /></div>
            <div><label className="label">Nº Comprovante</label>
              <input className="input" value={formLiqPay.comprovante}
                onChange={e => setFormLiqPay(f => ({ ...f, comprovante: e.target.value }))} /></div>
            <div className="col-span-2"><label className="label">Observação</label>
              <textarea className="input" rows={2} value={formLiqPay.observacao}
                onChange={e => setFormLiqPay(f => ({ ...f, observacao: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1 bg-green-600 hover:bg-green-700" disabled={saving}>
              <CheckCircle2 size={15} /> {saving ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Liquidar - Receber */}
      <Modal open={modal === 'liquidar_rec'} onClose={() => setModal(null)} title={`Receber: ${activeRow?.descricao}`} size="md">
        <form onSubmit={handleLiquidarRec} className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700">
            Valor original: <strong>{fmtBRL(activeRow?.valor)}</strong> · Vencimento: <strong>{fmtDate(activeRow?.vencimento)}</strong>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Valor Recebido (R$) *</label>
              <input className="input" type="number" min="0" step="0.01" required value={formLiqRec.valorRecebido}
                onChange={e => setFormLiqRec(f => ({ ...f, valorRecebido: e.target.value }))} /></div>
            <div><label className="label">Forma de Recebimento *</label>
              <select className="input" required value={formLiqRec.formaRecebimento}
                onChange={e => setFormLiqRec(f => ({ ...f, formaRecebimento: e.target.value }))}>
                {FORMAS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
            <div><label className="label">Data do Recebimento</label>
              <input className="input" type="date" value={formLiqRec.dataRecebimento}
                onChange={e => setFormLiqRec(f => ({ ...f, dataRecebimento: e.target.value }))} /></div>
            <div><label className="label">Nº Comprovante</label>
              <input className="input" value={formLiqRec.comprovante}
                onChange={e => setFormLiqRec(f => ({ ...f, comprovante: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1 bg-green-600 hover:bg-green-700" disabled={saving}>
              <CheckCircle2 size={15} /> {saving ? 'Processando...' : 'Confirmar Recebimento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Estornar/Cancelar - shared modal */}
      {['estornar_pay', 'estornar_rec', 'cancelar_pay', 'cancelar_rec'].map(action => (
        <Modal key={action} open={modal === action} onClose={() => setModal(null)}
          title={action.startsWith('estornar') ? 'Estornar Lançamento' : 'Cancelar Lançamento'} size="sm">
          <div className="space-y-4">
            <div className={clsx('p-3 rounded-xl border text-sm',
              action.startsWith('estornar') ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-red-50 border-red-200 text-red-700')}>
              <p className="font-semibold mb-1">{activeRow?.descricao}</p>
              <p>{fmtBRL(activeRow?.valor)} · {fmtDate(activeRow?.vencimento)}</p>
              {action.startsWith('estornar') && (
                <p className="mt-1 text-xs opacity-80">O valor será retirado dos totais do painel.</p>
              )}
            </div>
            <div>
              <label className="label">Motivo *</label>
              <textarea className="input" rows={3} required value={motivo} onChange={e => setMotivo(e.target.value)}
                placeholder="Descreva o motivo..." />
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancelar</button>
              <button disabled={!motivo.trim() || saving}
                onClick={action === 'estornar_pay' ? handleEstornarPay : action === 'estornar_rec' ? handleEstornarRec : action === 'cancelar_pay' ? handleCancelarPay : handleCancelarRec}
                className={clsx('btn-primary flex-1', action.startsWith('estornar') ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700')}>
                {saving ? 'Processando...' : action.startsWith('estornar') ? 'Estornar' : 'Cancelar Lançamento'}
              </button>
            </div>
          </div>
        </Modal>
      ))}
    </div>
  )
}
