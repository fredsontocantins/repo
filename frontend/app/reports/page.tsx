'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  FileBarChart, Plus, Download, Clock, CheckCircle2, BarChart3,
  Users, HeartHandshake, Target, Calendar, Banknote, Activity,
  TrendingUp, Eye, FileText, FileJson, Printer, X, RefreshCw,
} from 'lucide-react'
import { api } from '@/lib/api'
import EmptyState from '@/components/ui/EmptyState'
import ManagementDashboard from '@/components/reports/ManagementDashboard'
import { exportCSV, exportJSON, exportPDF } from '@/lib/report-export'

const TIPOS = [
  { value: 'general',     label: 'Gerencial Geral',      desc: 'Visão consolidada de todos os módulos',      icon: BarChart3,      color: '#22518a' },
  { value: 'financial',   label: 'Financeiro',           desc: 'Fluxo de caixa, aging, pagar e receber',     icon: Banknote,       color: '#16a34a' },
  { value: 'engagement',  label: 'Engajamento',          desc: 'Participação, taxa de ativação e inativos',  icon: Activity,       color: '#f59e0b' },
  { value: 'conversion',  label: 'Conversão do Portal',  desc: 'Funil de interesses públicos até voluntário',icon: TrendingUp,     color: '#9333ea' },
  { value: 'volunteers',  label: 'Voluntários',          desc: 'Listagem, ranking e horas contribuídas',     icon: Users,          color: '#22518a' },
  { value: 'campaigns',   label: 'Campanhas',            desc: 'Progresso, meta e alocação',                 icon: Target,         color: '#16a34a' },
  { value: 'donations',   label: 'Doações',              desc: 'Por tipo, status e top doadores',            icon: HeartHandshake, color: '#dc2626' },
  { value: 'events',      label: 'Eventos',              desc: 'Inscrição, check-in e taxa de ocupação',     icon: Calendar,       color: '#0ea5e9' },
]

const TIPO_LABEL: Record<string, string> = Object.fromEntries(TIPOS.map(t => [t.value, t.label]))

type PeriodKey = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom'
const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: '7d',  label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: '1y',  label: '1 ano' },
  { key: 'all', label: 'Tudo' },
  { key: 'custom', label: 'Personalizado' },
]

function rangeFromPeriod(key: PeriodKey, from?: string, to?: string): { dataInicio?: string; dataFim?: string } {
  if (key === 'all') return {}
  if (key === 'custom') return { dataInicio: from, dataFim: to }
  const now = new Date()
  const fromD = new Date(now)
  if (key === '7d')  fromD.setDate(now.getDate() - 7)
  if (key === '30d') fromD.setDate(now.getDate() - 30)
  if (key === '90d') fromD.setDate(now.getDate() - 90)
  if (key === '1y')  fromD.setFullYear(now.getFullYear() - 1)
  return { dataInicio: fromD.toISOString(), dataFim: now.toISOString() }
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodKey>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)

  const [reports, setReports] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [preview, setPreview] = useState<any | null>(null)

  const filtros = useMemo(
    () => rangeFromPeriod(period, customFrom || undefined, customTo || undefined),
    [period, customFrom, customTo],
  )

  const loadDashboard = async () => {
    setDashboardLoading(true)
    try {
      const data = await api.previewReport('general', filtros)
      setDashboardData(data)
    } catch (e: any) {
      console.error(e)
    } finally {
      setDashboardLoading(false)
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try { setReports(await api.getReports()) }
    finally { setHistoryLoading(false) }
  }

  useEffect(() => { loadDashboard() }, [period, customFrom, customTo]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadHistory() }, [])

  async function handleGenerate(tipo: string) {
    setGenerating(tipo)
    try {
      await api.generateReport(tipo, filtros)
      loadHistory()
    } catch (e: any) { alert(e.message) }
    finally { setGenerating(null) }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="text-slate-500 text-sm mt-1">Painel gerencial, catálogo e histórico de relatórios.</p>
        </div>
        <button onClick={loadDashboard} className="btn-secondary text-xs py-2 px-3" disabled={dashboardLoading}>
          <RefreshCw size={13} className={dashboardLoading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {/* Period filter */}
      <div className="card p-4">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar size={15} className="text-brand-600" />
            Período
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                  period === p.key
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <input
                type="date"
                value={customFrom.slice(0, 10)}
                onChange={e => setCustomFrom(e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5"
              />
              <span className="text-xs text-slate-400">até</span>
              <input
                type="date"
                value={customTo.slice(0, 10)}
                onChange={e => setCustomTo(e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : '')}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5"
              />
            </div>
          )}
        </div>
      </div>

      {/* Management Dashboard */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-brand-600" />
          <h2 className="section-title">Painel Gerencial</h2>
        </div>
        {dashboardLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="card p-5 h-24 animate-pulse bg-slate-50" />)}
            </div>
            <div className="card p-5 h-64 animate-pulse bg-slate-50" />
          </div>
        ) : (
          <ManagementDashboard data={dashboardData} />
        )}
      </section>

      {/* Catálogo de relatórios */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FileBarChart size={18} className="text-brand-600" />
          <h2 className="section-title">Gerar Relatório</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIPOS.map(t => {
            const Icon = t.icon
            return (
              <div key={t.value} className="card p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${t.color}1a`, color: t.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm">{t.label}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{t.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerate(t.value)}
                  disabled={generating === t.value}
                  className="btn-primary w-full justify-center text-xs py-2 mt-auto"
                >
                  {generating === t.value ? (
                    <><Clock size={13} className="animate-spin" /> Gerando...</>
                  ) : (
                    <><Plus size={13} /> Gerar</>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Histórico */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-brand-600" />
          <h2 className="section-title">Histórico de Relatórios</h2>
        </div>
        {historyLoading ? (
          <div className="card divide-y divide-slate-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 h-14 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState icon={FileBarChart} title="Nenhum relatório gerado" description="Gere seu primeiro relatório acima." />
        ) : (
          <div className="card divide-y divide-slate-50">
            {reports.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between gap-2 px-5 py-4 hover:bg-slate-50/50 transition-colors flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={15} className="text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{r.nome}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {r.tipo && <span className="font-semibold">{TIPO_LABEL[r.tipo] || r.tipo}</span>}
                      {r.geradoPor && <> · {r.geradoPor}</>}
                      {' · '}
                      {new Date(r.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => setPreview(r)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 px-2 py-1.5 rounded-md transition"
                    title="Visualizar"
                  >
                    <Eye size={12} /> Ver
                  </button>
                  <button
                    onClick={() => exportCSV(r.dados, r.nome)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 px-2 py-1.5 rounded-md transition"
                    title="Exportar CSV"
                  >
                    <FileText size={12} /> CSV
                  </button>
                  <button
                    onClick={() => exportJSON(r.dados, r.nome)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 px-2 py-1.5 rounded-md transition"
                    title="Exportar JSON"
                  >
                    <FileJson size={12} /> JSON
                  </button>
                  <button
                    onClick={() => exportPDF(r)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 px-2 py-1.5 rounded-md transition"
                    title="Imprimir / Exportar PDF"
                  >
                    <Printer size={12} /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal de preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <header className="bg-brand-600 text-white px-5 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="font-bold text-base truncate">{preview.nome}</h2>
                <p className="text-xs text-white/80 mt-0.5">
                  {TIPO_LABEL[preview.tipo] || preview.tipo}
                  {' · '}
                  Gerado em {new Date(preview.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => exportCSV(preview.dados, preview.nome)} className="inline-flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 px-2 py-1.5 rounded-md transition">
                  <FileText size={12} /> CSV
                </button>
                <button onClick={() => exportJSON(preview.dados, preview.nome)} className="inline-flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 px-2 py-1.5 rounded-md transition">
                  <FileJson size={12} /> JSON
                </button>
                <button onClick={() => exportPDF(preview)} className="inline-flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 px-2 py-1.5 rounded-md transition">
                  <Printer size={12} /> PDF
                </button>
                <button onClick={() => setPreview(null)} className="p-1.5 hover:bg-white/15 rounded-md transition" title="Fechar">
                  <X size={16} />
                </button>
              </div>
            </header>
            <div className="p-5 overflow-y-auto bg-slate-50">
              {preview.tipo === 'general' && preview.dados ? (
                <ManagementDashboard data={preview.dados} />
              ) : (
                <pre className="text-xs bg-white border border-slate-200 rounded-lg p-4 overflow-auto max-h-[65vh]">
                  {JSON.stringify(preview.dados, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
        <Download size={12} /> CSV é compatível com Excel e Google Sheets. PDF abre a impressão do navegador (escolha "Salvar como PDF").
      </div>
    </div>
  )
}
