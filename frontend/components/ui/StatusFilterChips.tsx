'use client'
import { clsx } from 'clsx'
import type { StatusStyle } from '@/lib/chart-colors'

interface Props {
  styles: Record<string, StatusStyle>
  order: readonly string[]
  counts: Record<string, number>
  total: number
  value: string
  onChange: (next: string) => void
  allLabel?: string
}

/**
 * Kanban-style filter chips. "All" chip resets the filter; each status
 * chip shows a colored dot and the count. Active chip fills with the
 * status color so the user instantly sees what is selected.
 */
export default function StatusFilterChips({
  styles,
  order,
  counts,
  total,
  value,
  onChange,
  allLabel = 'Todas',
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('')}
        className={clsx(
          'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition',
          value === ''
            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
            : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:text-brand-700',
        )}
      >
        <span className={clsx('w-1.5 h-1.5 rounded-full', value === '' ? 'bg-white' : 'bg-slate-400')} />
        {allLabel}
        <span className={clsx('text-[11px] font-bold', value === '' ? 'text-white/90' : 'text-slate-500')}>{total}</span>
      </button>
      {order.map(key => {
        const s = styles[key]
        if (!s) return null
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(active ? '' : key)}
            className={clsx(
              'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition',
              !active && 'bg-white hover:bg-slate-50',
            )}
            style={
              active
                ? { backgroundColor: s.bar, color: '#fff', borderColor: s.bar }
                : { color: s.text, borderColor: s.bar + '55' }
            }
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: active ? '#fff' : s.bar }}
            />
            {s.label}
            <span className={clsx('text-[11px] font-bold', active ? 'text-white/90' : 'text-slate-500')}>
              {counts[key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}
