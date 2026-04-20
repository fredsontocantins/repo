'use client'
import { ReactNode } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import {
  Users, HeartHandshake, Target, Calendar, Clock, AlertTriangle,
  TrendingUp, Award, Activity, Banknote,
} from 'lucide-react'
import {
  CAMPAIGN_STATUS_STYLE, VOLUNTEER_STATUS_STYLE, DONATION_TYPE_COLOR,
  SERIES_COLOR, CHART_AXIS, CHART_TOOLTIP_STYLE, statusColor, donationTypeColor,
} from '@/lib/chart-colors'

const fmtBRL = (v: number) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtInt = (v: number) => Number(v || 0).toLocaleString('pt-BR')
const fmtMonth = (m: string) => {
  const [y, mo] = m.split('-')
  return new Date(Number(y), Number(mo) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

const LABEL_CAMP: Record<string, string> = Object.fromEntries(
  Object.entries(CAMPAIGN_STATUS_STYLE).map(([k, v]) => [k, v.label]),
)
const LABEL_VOL: Record<string, string> = Object.fromEntries(
  Object.entries(VOLUNTEER_STATUS_STYLE).map(([k, v]) => [k, v.label]),
)
const LABEL_DONATION_TYPE: Record<string, string> = {
  MONETARY: 'Monetária', FOOD: 'Alimentos', CLOTHING: 'Roupas',
  MEDICINE: 'Medicamentos', EQUIPMENT: 'Equipamentos', SERVICE: 'Serviço', OTHER: 'Outros',
}

interface KpiProps {
  icon: ReactNode
  label: string
  value: string
  accent: string
  hint?: string
}
function Kpi({ icon, label, value, accent, hint }: KpiProps) {
  return (
    <div className="card p-5 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between pl-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function ManagementDashboard({ data }: { data: any }) {
  if (!data) return null

  const kpis = data.kpis || {}
  const timeseries = data.timeseries || { donations: [], volunteers: [] }

  // Merge donations + volunteers into one timeseries for the combined chart
  const seriesMap = new Map<string, any>()
  for (const d of timeseries.donations || []) seriesMap.set(d.month, { month: d.month, donations: d.valor || 0 })
  for (const v of timeseries.volunteers || []) {
    const curr = seriesMap.get(v.month) || { month: v.month, donations: 0 }
    curr.volunteers = v.count || 0
    seriesMap.set(v.month, curr)
  }
  const series = Array.from(seriesMap.values())
    .map(r => ({ ...r, label: fmtMonth(r.month) }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const campaignsByStatus = (data.breakdowns?.campaignsByStatus || [])
    .map((r: any) => ({ name: LABEL_CAMP[r.key] || r.key, value: r.count, fill: statusColor(r.key) }))
  const volunteersByStatus = (data.breakdowns?.volunteersByStatus || [])
    .map((r: any) => ({ name: LABEL_VOL[r.key] || r.key, value: r.count, fill: statusColor(r.key) }))
  const donationsByType = (data.breakdowns?.donationsByType || [])
    .map((r: any) => ({ name: LABEL_DONATION_TYPE[r.key] || r.key, count: r.count, total: r.total, fill: donationTypeColor(r.key) }))

  const top = data.rankings || {}
  const attention = data.attention || {}
  const upcoming = data.upcomingEvents || []

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<Banknote size={18} />}
          label="Arrecadação (período)"
          value={fmtBRL(kpis.totalArrecadado)}
          accent="#16a34a"
          hint={`${fmtInt(kpis.totalDoacoesConfirmadas)} doações confirmadas`}
        />
        <Kpi
          icon={<Users size={18} />}
          label="Voluntários ativos"
          value={fmtInt(kpis.voluntariosAtivos)}
          accent="#22518a"
          hint={kpis.novosVoluntariosPeriodo ? `+${fmtInt(kpis.novosVoluntariosPeriodo)} no período` : undefined}
        />
        <Kpi
          icon={<Clock size={18} />}
          label="Horas contribuídas"
          value={fmtInt(kpis.horasContribuidas)}
          accent="#f59e0b"
          hint="Total acumulado"
        />
        <Kpi
          icon={<Target size={18} />}
          label="Campanhas"
          value={fmtInt(kpis.totalCampanhas)}
          accent="#9333ea"
          hint={`${fmtInt(kpis.totalEventos)} eventos cadastrados`}
        />
      </div>

      {/* Attention strip */}
      {(attention.interessesPendentes > 0 || attention.voluntariosPendentes > 0 || (attention.campanhas || []).length > 0) && (
        <div className="card p-4 border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900">Precisa de atenção</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {attention.interessesPendentes > 0 && (
              <a href="/volunteer-interests" className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition">
                <span className="text-slate-700">Interesses de voluntariado pendentes</span>
                <span className="font-bold text-amber-700">{fmtInt(attention.interessesPendentes)}</span>
              </a>
            )}
            {attention.voluntariosPendentes > 0 && (
              <a href="/volunteers" className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition">
                <span className="text-slate-700">Voluntários aguardando aprovação</span>
                <span className="font-bold text-amber-700">{fmtInt(attention.voluntariosPendentes)}</span>
              </a>
            )}
            {(attention.campanhas || []).slice(0, 3).map((c: any) => (
              <a key={c.id} href={`/campaigns/${c.id}`} className="flex flex-col p-3 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition">
                <span className="text-xs text-slate-500 truncate">{c.nome}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold text-slate-700">{c.pct}% da meta</span>
                  {c.diasRestantes !== null && c.diasRestantes <= 7 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-700 rounded">
                      {c.diasRestantes <= 0 ? 'Encerra hoje' : `${c.diasRestantes}d restantes`}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Charts row 1 — timeseries + campaign status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Evolução mensal</h3>
            <span className="text-xs text-slate-400">(doações R$ + novos voluntários)</span>
          </div>
          {series.length === 0 ? (
            <EmptySeries />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_AXIS.grid} />
                  <XAxis dataKey="label" tick={{ fontSize: CHART_AXIS.tickFontSize, fill: CHART_AXIS.tick }} />
                  <YAxis yAxisId="left" tick={{ fontSize: CHART_AXIS.tickFontSize, fill: CHART_AXIS.tick }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: CHART_AXIS.tickFontSize, fill: CHART_AXIS.tick }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: any, name: any) => name === 'donations' ? fmtBRL(value) : fmtInt(value)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area yAxisId="left" type="monotone" name="Doações R$" dataKey="donations" stroke={SERIES_COLOR.donations} fill={SERIES_COLOR.donations} fillOpacity={0.18} />
                  <Area yAxisId="right" type="monotone" name="Novos voluntários" dataKey="volunteers" stroke={SERIES_COLOR.volunteers} fill={SERIES_COLOR.volunteers} fillOpacity={0.18} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Status das campanhas</h3>
          </div>
          {campaignsByStatus.length === 0 ? (
            <EmptySeries />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={campaignsByStatus} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} label={(e) => `${e.name} (${e.value})`} labelLine={false}>
                    {campaignsByStatus.map((e: any) => <Cell key={e.name} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 — volunteer status + donation type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Distribuição de voluntários</h3>
          </div>
          {volunteersByStatus.length === 0 ? <EmptySeries /> : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volunteersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_AXIS.grid} />
                  <XAxis dataKey="name" tick={{ fontSize: CHART_AXIS.tickFontSize, fill: CHART_AXIS.tick }} />
                  <YAxis tick={{ fontSize: CHART_AXIS.tickFontSize, fill: CHART_AXIS.tick }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Voluntários" radius={[6, 6, 0, 0]}>
                    {volunteersByStatus.map((e: any) => <Cell key={e.name} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <HeartHandshake size={16} className="text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Doações por tipo</h3>
          </div>
          {donationsByType.length === 0 ? <EmptySeries /> : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donationsByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_AXIS.grid} />
                  <XAxis dataKey="name" tick={{ fontSize: CHART_AXIS.tickFontSize, fill: CHART_AXIS.tick }} />
                  <YAxis tick={{ fontSize: CHART_AXIS.tickFontSize, fill: CHART_AXIS.tick }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="count" name="Quantidade" radius={[6, 6, 0, 0]}>
                    {donationsByType.map((e: any) => <Cell key={e.name} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Rankings + upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Top 10 voluntários</h3>
          </div>
          {(top.topVolunteers || []).length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Sem voluntários ativos no período.</p>
          ) : (
            <ol className="space-y-2">
              {top.topVolunteers.map((v: any, i: number) => (
                <li key={v.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: i < 3 ? ['#f59e0b', '#94a3b8', '#b45309'][i] : '#22518a' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{v.nome}</p>
                    <p className="text-xs text-slate-400 truncate">{v.profissao || 'Sem profissão'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs flex-shrink-0">
                    <span className="text-amber-600 font-semibold">{fmtInt(v.pontos)} pts</span>
                    <span className="text-blue-600 font-semibold">{fmtInt(v.horasContribuidas)}h</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Top 10 campanhas por arrecadação</h3>
          </div>
          {(top.topCampaigns || []).length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Sem campanhas cadastradas.</p>
          ) : (
            <ol className="space-y-2">
              {top.topCampaigns.map((c: any, i: number) => {
                const arrec = Number(c.arrecadado || 0)
                const meta = Number(c.metaArrecadacao || 0)
                const pct = meta > 0 ? Math.min(100, Math.round((arrec / meta) * 100)) : null
                const color = statusColor(c.status)
                return (
                  <li key={c.id} className="p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-start gap-3">
                      <span className="w-1 flex-shrink-0 self-stretch rounded-full" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <a href={`/campaigns/${c.id}`} className="text-sm font-semibold text-slate-800 hover:text-brand-600 truncate block">{c.nome}</a>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}1a`, color }}>
                            {LABEL_CAMP[c.status] || c.status}
                          </span>
                          <span className="text-xs text-green-700 font-semibold">{fmtBRL(arrec)}</span>
                          {pct !== null && <span className="text-xs text-slate-500">· {pct}% da meta</span>}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Próximos eventos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {upcoming.map((e: any) => (
              <a key={e.id} href={`/events/${e.id}`} className="block p-3 border border-slate-200 rounded-lg hover:border-brand-300 hover:bg-slate-50/50 transition">
                <p className="text-xs font-bold text-brand-600">
                  {new Date(e.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate mt-1">{e.nome}</p>
                {e.local && <p className="text-[11px] text-slate-400 truncate">{e.local}</p>}
                <div className="flex items-center gap-1 mt-2">
                  <Activity size={11} className="text-slate-400" />
                  <span className="text-[11px] text-slate-500">
                    {e._count?.registrations ?? 0}
                    {e.capacidade ? ` / ${e.capacidade}` : ''} inscritos
                  </span>
                  {e.ocupacaoPct !== null && e.ocupacaoPct >= 80 && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded">
                      {e.ocupacaoPct}%
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptySeries() {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-slate-400">
      Sem dados no período selecionado.
    </div>
  )
}
