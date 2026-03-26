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

export default function StatCard({ title, value, icon: Icon, iconColor = 'text-brand-500', iconBg = 'bg-white/10', trend, trendLabel, subtitle }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
        {trend !== undefined && (
          <span className={clsx('flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border',
            trend >= 0 ? 'text-blue-200 bg-blue-500/20 border-blue-500/40' : 'text-pink-100 bg-pink-400/20 border-pink-400/30'
          )}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white font-display">{value}</p>
        <p className="text-sm font-medium text-[rgba(191,201,247,0.7)] mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-[rgba(191,201,247,0.6)] mt-1">{subtitle}</p>}
        {trendLabel && <p className="text-xs text-[rgba(191,201,247,0.6)] mt-1">{trendLabel}</p>}
      </div>
    </div>
  )
}
