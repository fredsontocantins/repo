'use client'
import { useEffect, useState } from 'react'
import { LucideIcon, Users, Megaphone, Heart, Calendar, TrendingUp, Clock, Award, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import StatCard from '@/components/ui/StatCard'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { hasModuleAccess, type ModuleKey } from '@/lib/permissions'

const mockMonthly = [
  { mes: 'Out', voluntarios: 42, doacoes: 8500 },
  { mes: 'Nov', voluntarios: 55, doacoes: 12000 },
  { mes: 'Dez', voluntarios: 48, doacoes: 9800 },
  { mes: 'Jan', voluntarios: 67, doacoes: 15200 },
  { mes: 'Fev', voluntarios: 74, doacoes: 18500 },
  { mes: 'Mar', voluntarios: 89, doacoes: 22000 },
]

const COLORS = ['#ff6fb5', '#2c3e8a']

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)
  const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(n)
  const quickLinks: Array<{ href: string; label: string; icon: LucideIcon; color: string; module: ModuleKey }> = [
    { href: '/volunteers', label: 'Ver Voluntários', icon: Users, color: 'from-blue-400/80 to-blue-500', module: 'volunteers' as ModuleKey },
    { href: '/campaigns', label: 'Ver Campanhas', icon: Megaphone, color: 'from-pink-400 to-rose-500', module: 'campaigns' as ModuleKey },
    { href: '/donations', label: 'Ver Doações', icon: Heart, color: 'from-blue-300 to-blue-400', module: 'donations' as ModuleKey },
    { href: '/gamification', label: 'Leaderboard', icon: Award, color: 'from-blue-500 to-blue-600', module: 'gamification' as ModuleKey },
  ]

  return (
    <div className="space-y-8">
      <div className="card hero-card p-8 overflow-hidden relative">
        <div className="absolute inset-0 gradient-accent opacity-70" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">Painel Estratégico</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Inteligência de voluntariado</h1>
            <p className="text-base text-muted mt-2 max-w-2xl">Visualize campanhas, eventos e finanças com todas as métricas centralizadas e CTAs claros.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/campaigns" className="btn-primary flex items-center gap-2">
                <Sparkles size={16} /> Explorar campanhas
              </Link>
              <Link href="/portal/voluntarios-unidos" className="btn-outline">
                Portal público ativo
              </Link>
            </div>
          </div>
          <div className="glass-panel w-full md:w-72">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Atualizações rápidas</p>
            <p className="text-3xl font-semibold mt-3">{loading ? '—' : fmtBRL(stats?.donations?.totalMonetario ?? 0)}</p>
            <p className="text-sm text-muted">Recebido este mês · {stats?.donations?.newThisMonth ?? 0} novas doações</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Voluntários Ativos"
          value={loading ? '—' : fmt(stats?.volunteers?.active ?? 0)}
          icon={Users}
          iconBg="bg-blue-50" iconColor="text-blue-600"
          trend={loading ? 0 : stats?.volunteers?.newThisMonth ?? 0}
          trendLabel={`${stats?.volunteers?.newThisMonth ?? 0} novos este mês`}
        />
        <StatCard
          title="Campanhas Ativas"
          value={loading ? '—' : fmt(stats?.campaigns?.active ?? 0)}
          icon={Megaphone}
          iconBg="bg-pink-50" iconColor="text-pink-500"
          subtitle={`Arrecadado: ${fmtBRL(stats?.campaigns?.totalArrecadado ?? 0)}`}
        />
        <StatCard
          title="Total Arrecadado"
          value={loading ? '—' : fmtBRL(stats?.donations?.totalMonetario ?? 0)}
          icon={Heart}
          iconBg="bg-blue-light" iconColor="text-blue-400"
          trend={loading ? 0 : stats?.donations?.newThisMonth ?? 0}
          trendLabel={`+${fmtBRL(stats?.donations?.newThisMonth ?? 0)} este mês`}
        />
        <StatCard
          title="Horas Voluntariadas"
          value={loading ? '—' : fmt(stats?.volunteers?.totalHoras ?? 0)}
          icon={Clock}
          iconBg="bg-pink-50" iconColor="text-pink-500"
          subtitle={`${stats?.events?.upcoming ?? 0} eventos agendados`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title text-white">Crescimento Mensal</h2>
              <p className="text-muted text-xs mt-0.5">Voluntários x arrecadação (6 meses)</p>
            </div>
            <span className="pill">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockMonthly} margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(255, 111, 181, 0.7)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="rgba(255, 111, 181, 0.1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDoa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(116, 192, 255, 0.7)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="rgba(116, 192, 255, 0.1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.65)' }} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.65)' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff' }} />
              <Area type="monotone" dataKey="voluntarios" stroke="var(--pink)" strokeWidth={3} fill="url(#gVol)" name="Voluntários" />
              <Area type="monotone" dataKey="doacoes" stroke="var(--blue)" strokeWidth={3} fill="url(#gDoa)" name="Doações (R$)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h2 className="section-title text-white mb-1">Status das campanhas</h2>
          <p className="text-muted text-xs mb-4">Distribuição entre abertas e concluídas</p>
          <div className="flex justify-center">
            <PieChart width={180} height={180}>
              <Pie data={[
                { name: 'Ativas', value: stats?.campaigns?.active ?? 3 },
                { name: 'Concluídas', value: (stats?.campaigns?.total ?? 5) - (stats?.campaigns?.active ?? 3) },
              ]} cx={90} cy={90} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                <Cell fill="var(--pink)" />
                <Cell fill="var(--blue)" />
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff' }} />
            </PieChart>
          </div>
          <div className="space-y-3 mt-2">
            {[
              { label: 'Ativas', value: stats?.campaigns?.active ?? 3, color: 'var(--pink)' },
              { label: 'Concluídas', value: (stats?.campaigns?.total ?? 5) - (stats?.campaigns?.active ?? 3), color: 'var(--blue)' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted">{item.label}</span>
                </div>
                <span className="text-sm font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, color, module }) =>
          hasModuleAccess(user?.modules, module) ? (
            <Link key={href} href={href}
              className="card-hover p-5 flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                  <Icon size={17} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-muted">{label}</span>
              </div>
              <ArrowRight size={15} className="text-white/60 group-hover:text-white transition-colors" />
            </Link>
          ) : null,
        )}
      </div>
    </div>
  )
}
