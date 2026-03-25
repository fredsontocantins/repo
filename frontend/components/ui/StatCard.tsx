import { clsx } from 'clsx'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: number
  trendLabel?: string
  subtitle?: string
}

export default function StatCard({ title, value, icon: Icon, iconColor = 'text-brand-600', iconBg = 'bg-brand-50', trend, trendLabel, subtitle }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
        {trend !== undefined && (
          <span className={clsx('flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg',
            trend >= 0 ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'
          )}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 font-display">{value}</p>
        <p className="text-sm font-medium text-slate-500 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trendLabel && <p className="text-xs text-slate-400 mt-1">{trendLabel}</p>}
      </div>
    </div>
  )
}
