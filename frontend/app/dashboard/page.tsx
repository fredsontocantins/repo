'use client'
import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Users, Megaphone, Heart, Calendar, TrendingUp, Clock, Award, ArrowRight } from 'lucide-react'
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

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

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
    { href: '/volunteers', label: 'Ver Voluntários', icon: Users, color: 'from-blue-500 to-blue-600', module: 'volunteers' as ModuleKey },
    { href: '/campaigns', label: 'Ver Campanhas', icon: Megaphone, color: 'from-brand-500 to-brand-600', module: 'campaigns' as ModuleKey },
    { href: '/donations', label: 'Ver Doações', icon: Heart, color: 'from-red-500 to-rose-600', module: 'donations' as ModuleKey },
    { href: '/gamification', label: 'Leaderboard', icon: Award, color: 'from-amber-500 to-orange-500', module: 'gamification' as ModuleKey },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Bem-vindo, <span className="font-semibold text-slate-700">{user?.name}</span> 👋
          </p>
        </div>
        <div className="text-sm text-slate-400 bg-white border border-slate-100 rounded-xl px-4 py-2 shadow-sm">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Voluntários Ativos"
          value={loading ? '—' : fmt(stats?.volunteers?.active ?? 0)}
          icon={Users}
          iconBg="bg-blue-50" iconColor="text-blue-600"
          trend={12}
          trendLabel={`${stats?.volunteers?.newThisMonth ?? 0} novos este mês`}
        />
        <StatCard
          title="Campanhas Ativas"
          value={loading ? '—' : fmt(stats?.campaigns?.active ?? 0)}
          icon={Megaphone}
          iconBg="bg-brand-50" iconColor="text-brand-600"
          subtitle={`Total arrecadado: ${fmtBRL(stats?.campaigns?.totalArrecadado ?? 0)}`}
        />
        <StatCard
          title="Total Arrecadado"
          value={loading ? '—' : fmtBRL(stats?.donations?.totalMonetario ?? 0)}
          icon={Heart}
          iconBg="bg-red-50" iconColor="text-red-500"
          trend={8}
          trendLabel={`+${fmtBRL(stats?.donations?.newThisMonth ?? 0)} este mês`}
        />
        <StatCard
          title="Horas Voluntariadas"
          value={loading ? '—' : fmt(stats?.volunteers?.totalHoras ?? 0)}
          icon={Clock}
          iconBg="bg-amber-50" iconColor="text-amber-600"
          subtitle={`${stats?.events?.upcoming ?? 0} eventos agendados`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Crescimento Mensal</h2>
              <p className="text-slate-400 text-xs mt-0.5">Voluntários e arrecadação nos últimos 6 meses</p>
            </div>
            <span className="badge-pill bg-brand-50 text-brand-700">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockMonthly}>
              <defs>
                <linearGradient id="gVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="voluntarios" stroke="#22c55e" strokeWidth={2.5} fill="url(#gVol)" name="Voluntários" />
              <Area type="monotone" dataKey="doacoes" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gDon)" name="Doações (R$)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-6">
          <h2 className="section-title mb-1">Distribuição</h2>
          <p className="text-slate-400 text-xs mb-5">Status das campanhas</p>
          <div className="flex justify-center">
            <PieChart width={170} height={170}>
              <Pie data={[
                { name: 'Ativas', value: stats?.campaigns?.active ?? 3 },
                { name: 'Concluídas', value: (stats?.campaigns?.total ?? 5) - (stats?.campaigns?.active ?? 3) },
              ]} cx={85} cy={85} innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                {[0, 1].map(i => <Cell key={i} fill={COLORS[i]} strokeWidth={0} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </div>
          <div className="space-y-2 mt-2">
            {[
              { label: 'Ativas', color: COLORS[0], value: stats?.campaigns?.active ?? 3 },
              { label: 'Concluídas', color: COLORS[1], value: (stats?.campaigns?.total ?? 5) - (stats?.campaigns?.active ?? 3) },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-800">{item.value}</span>
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
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </div>
              <ArrowRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
          ) : null,
        )}
      </div>
    </div>
  )
}
