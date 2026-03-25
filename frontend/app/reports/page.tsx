'use client'
import { useEffect, useState } from 'react'
import { FileBarChart, Plus, Download, Clock, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import EmptyState from '@/components/ui/EmptyState'

const TIPOS = [
  { value: 'general', label: 'Relatório Geral', desc: 'Visão completa de todas as métricas' },
  { value: 'volunteers', label: 'Relatório de Voluntários', desc: 'Listagem e estatísticas de voluntários' },
  { value: 'campaigns', label: 'Relatório de Campanhas', desc: 'Progresso e arrecadação por campanha' },
  { value: 'donations', label: 'Relatório de Doações', desc: 'Histórico e análise de doações' },
  { value: 'events', label: 'Relatório de Eventos', desc: 'Eventos realizados e participação' },
]

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try { setReports(await api.getReports()) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleGenerate(tipo: string) {
    setGenerating(tipo)
    try {
      await api.generateReport(tipo)
      load()
    } catch (e: any) { alert(e.message) }
    finally { setGenerating(null) }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Relatórios</h1>
        <p className="text-slate-500 text-sm mt-1">Gere e exporte relatórios detalhados</p>
      </div>

      {/* Generate cards */}
      <div>
        <h2 className="section-title mb-4">Gerar Novo Relatório</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPOS.map(t => (
            <div key={t.value} className="card-hover p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileBarChart size={18} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{t.label}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{t.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleGenerate(t.value)}
                disabled={generating === t.value}
                className="btn-primary w-full justify-center text-xs py-2"
              >
                {generating === t.value ? (
                  <><Clock size={13} className="animate-spin" /> Gerando...</>
                ) : (
                  <><Plus size={13} /> Gerar</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="section-title mb-4">Histórico de Relatórios</h2>
        {loading ? (
          <div className="card divide-y divide-slate-50">
            {[...Array(4)].map((_, i) => <div key={i} className="p-4 h-14 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/3" /></div>)}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState icon={FileBarChart} title="Nenhum relatório gerado" description="Gere seu primeiro relatório acima." />
        ) : (
          <div className="card divide-y divide-slate-50">
            {reports.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={15} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{r.nome}</p>
                    <p className="text-xs text-slate-400">
                      {r.geradoPor} · {new Date(r.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(r.dados, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = `${r.nome}.json`; a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Download size={12} /> Exportar JSON
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
