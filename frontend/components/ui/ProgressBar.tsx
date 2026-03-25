interface ProgressBarProps {
  value: number
  max: number
  color?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export default function ProgressBar({ value, max, color = 'bg-brand-500', showLabel = true, size = 'md' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const heights = { sm: 'h-1.5', md: 'h-2.5' }
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-500">{pct}% concluído</span>
          <span className="text-xs font-medium text-slate-600">
            {value.toLocaleString('pt-BR')} / {max.toLocaleString('pt-BR')}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
