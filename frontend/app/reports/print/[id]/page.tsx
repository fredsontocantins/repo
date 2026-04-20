'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ManagementDashboard from '@/components/reports/ManagementDashboard'

const TIPO_LABEL: Record<string, string> = {
  general: 'Gerencial Geral',
  financial: 'Financeiro',
  engagement: 'Engajamento',
  conversion: 'Conversão do Portal',
  volunteers: 'Voluntários',
  campaigns: 'Campanhas',
  donations: 'Doações',
  events: 'Eventos',
}

const fmtBRL = (v: number) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtInt = (v: number) => Number(v || 0).toLocaleString('pt-BR')

export default function ReportPrintPage() {
  const params = useParams<{ id: string }>()
  const [report, setReport] = useState<any | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem(`report-print-${params.id}`)
    if (!raw) { setNotFound(true); return }
    try {
      setReport(JSON.parse(raw))
    } catch { setNotFound(true) }
  }, [params.id])

  useEffect(() => {
    if (report) {
      const t = setTimeout(() => window.print(), 400)
      return () => clearTimeout(t)
    }
  }, [report])

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Relatório não disponível</h1>
          <p className="text-sm text-slate-500">
            Abra a impressão diretamente a partir da página de Relatórios para que os dados sejam carregados.
          </p>
        </div>
      </div>
    )
  }

  if (!report) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 print:bg-white">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { size: A4; margin: 12mm; }
          .card { break-inside: avoid; }
        }
      `}</style>
      <div className="max-w-5xl mx-auto p-8 print:p-0">
        <header className="border-b-2 border-brand-600 pb-4 mb-6 print:mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
            Relatório · {TIPO_LABEL[report.tipo] || report.tipo}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{report.nome}</h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
            <span>Gerado em {new Date(report.createdAt).toLocaleString('pt-BR')}</span>
            {report.geradoPor && <span>· Por: {report.geradoPor}</span>}
          </div>
        </header>

        <div className="no-print mb-6 flex items-center justify-end gap-2">
          <button onClick={() => window.print()} className="btn-primary text-xs py-2 px-3">
            Imprimir / Salvar como PDF
          </button>
          <button onClick={() => window.close()} className="btn-secondary text-xs py-2 px-3">
            Fechar
          </button>
        </div>

        {report.tipo === 'general' ? (
          <ManagementDashboard data={report.dados} />
        ) : (
          <GenericPrintView tipo={report.tipo} dados={report.dados} />
        )}

        <footer className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
          Relatório gerado pelo sistema — {new Date().toLocaleString('pt-BR')}
        </footer>
      </div>
    </div>
  )
}

function GenericPrintView({ tipo, dados }: { tipo: string; dados: any }) {
  if (!dados) return <p className="text-sm text-slate-500">Relatório sem dados.</p>
  return (
    <div className="space-y-6">
      {dados.kpis && <KpiGrid kpis={dados.kpis} />}
      {dados.totals && <KpiGrid kpis={dados.totals} />}
      {dados.funnel && <KpiGrid kpis={dados.funnel} />}
      {dados.doacoesPortal && <Section title="Doações do Portal"><KpiGrid kpis={dados.doacoesPortal} small /></Section>}
      {dados.breakdowns && (
        <Section title="Distribuições">
          {Object.entries(dados.breakdowns).map(([k, rows]: any) => (
            <Table key={k} title={k} rows={rows} />
          ))}
        </Section>
      )}
      {dados.aging && (
        <Section title="Aging">
          {Object.entries(dados.aging).map(([k, row]: any) => (
            <div key={k} className="mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">{k}</p>
              <KpiGrid kpis={row} small />
            </div>
          ))}
        </Section>
      )}
      {dados.topEngajados && <Table title="Top engajados" rows={dados.topEngajados} />}
      {dados.inativosPossiveis && <Table title="Inativos possíveis" rows={dados.inativosPossiveis} />}
      {dados.topDoadores && <Table title="Top doadores" rows={dados.topDoadores} />}
      {dados.volunteers && <Table title="Voluntários" rows={dados.volunteers} />}
      {dados.campaigns && <Table title="Campanhas" rows={dados.campaigns.map((c: any) => ({ ...c, _count: undefined }))} />}
      {dados.donations && <Table title="Doações" rows={dados.donations} />}
      {dados.events && <Table title="Eventos" rows={dados.events.map((e: any) => ({ ...e, _count: undefined }))} />}
      {dados.payables && <Table title="Contas a pagar" rows={dados.payables} />}
      {dados.receivables && <Table title="Contas a receber" rows={dados.receivables} />}
      {dados.interests && <Table title="Interesses" rows={dados.interests} />}
      {/* fallback */}
      {tipo === 'unknown' && <pre className="text-[10px] bg-slate-50 p-2 border rounded">{JSON.stringify(dados, null, 2)}</pre>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-4 print:border print:border-slate-200 print:shadow-none">
      <h2 className="text-sm font-bold text-slate-900 mb-3">{title}</h2>
      {children}
    </section>
  )
}

function KpiGrid({ kpis, small }: { kpis: Record<string, any>; small?: boolean }) {
  const entries = Object.entries(kpis).filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object')
  return (
    <div className={`grid ${small ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3`}>
      {entries.map(([k, v]) => (
        <div key={k} className="border border-slate-200 rounded-lg p-3 print:border-slate-300">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 truncate">{humanize(k)}</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{fmtValue(k, v)}</p>
        </div>
      ))}
    </div>
  )
}

function Table({ title, rows }: { title: string; rows: any[] }) {
  if (!Array.isArray(rows) || rows.length === 0) return null
  const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r || {})))).filter(h => h !== 'dados' && h !== 'filtros')
  return (
    <section className="card p-4 print:border print:border-slate-200 print:shadow-none">
      <h2 className="text-sm font-bold text-slate-900 mb-3">{humanize(title)}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              {headers.map(h => (
                <th key={h} className="py-1.5 px-2 font-semibold text-slate-600 uppercase tracking-wide text-[10px]">{humanize(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map((r, i) => (
              <tr key={i} className="border-b border-slate-100">
                {headers.map(h => (
                  <td key={h} className="py-1 px-2 text-slate-700 align-top">{renderCell(r[h])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 100 && (
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Mostrando 100 de {rows.length} registros. Para a lista completa, exporte em CSV ou JSON.
          </p>
        )}
      </div>
    </section>
  )
}

function humanize(s: string) {
  return s
    .replace(/([A-Z])/g, ' $1')
    .replace(/[._]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, c => c.toUpperCase())
}

function fmtValue(key: string, v: any) {
  if (typeof v === 'number') {
    if (/total|arrecad|valor|saldo|pago|recebido/i.test(key)) return fmtBRL(v)
    return fmtInt(v)
  }
  return String(v)
}

function renderCell(v: any): string {
  if (v === null || v === undefined) return '—'
  if (v instanceof Date) return v.toLocaleDateString('pt-BR')
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
    try { return new Date(v).toLocaleDateString('pt-BR') } catch { return v }
  }
  if (typeof v === 'object') return JSON.stringify(v)
  if (typeof v === 'number') return fmtInt(v)
  return String(v)
}
