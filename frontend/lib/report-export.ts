/**
 * Helpers to export report data as JSON / CSV / printable HTML (PDF via print).
 */

export function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`)
}

/**
 * Flattens the report payload into one or more CSV sections.
 * Produces a single .csv with multiple sections separated by a blank line,
 * so a single download covers the whole report.
 */
export function exportCSV(data: any, filename: string) {
  const sections: { title: string; rows: any[] }[] = []

  const pushIfArray = (title: string, rows: any) => {
    if (Array.isArray(rows) && rows.length > 0) sections.push({ title, rows })
  }

  // Known top-level array-like sections by convention
  if (data?.kpis) sections.push({ title: 'KPIs', rows: [flatten(data.kpis)] })
  if (data?.totals) sections.push({ title: 'Totais', rows: [flatten(data.totals)] })
  if (data?.funnel) sections.push({ title: 'Funil', rows: [flatten(data.funnel)] })

  if (data?.breakdowns) {
    for (const [k, rows] of Object.entries(data.breakdowns)) pushIfArray(k, rows)
  }
  if (data?.aging) {
    for (const [k, rows] of Object.entries(data.aging)) {
      sections.push({ title: `aging.${k}`, rows: [flatten(rows)] })
    }
  }

  pushIfArray('timeseries.donations', data?.timeseries?.donations)
  pushIfArray('timeseries.volunteers', data?.timeseries?.volunteers)
  pushIfArray('topVolunteers', data?.rankings?.topVolunteers ?? data?.topEngajados)
  pushIfArray('topCampaigns', data?.rankings?.topCampaigns)
  pushIfArray('upcomingEvents', data?.upcomingEvents)
  pushIfArray('volunteers', data?.volunteers)
  pushIfArray('campaigns', data?.campaigns)
  pushIfArray('donations', data?.donations)
  pushIfArray('events', data?.events)
  pushIfArray('payables', data?.payables)
  pushIfArray('receivables', data?.receivables)
  pushIfArray('interests', data?.interests)
  pushIfArray('topDoadores', data?.topDoadores)
  pushIfArray('inativosPossiveis', data?.inativosPossiveis)

  if (sections.length === 0) {
    // fallback: best effort
    sections.push({ title: 'dados', rows: [flatten(data)] })
  }

  const csv = sections
    .map(s => `# ${s.title}\n${toCSV(s.rows.map(r => flatten(r)))}`)
    .join('\n\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

function flatten(obj: any, prefix = ''): Record<string, any> {
  if (obj === null || obj === undefined) return {}
  if (typeof obj !== 'object' || obj instanceof Date) return { [prefix || 'value']: toScalar(obj) }
  if (Array.isArray(obj)) return { [prefix || 'value']: JSON.stringify(obj) }
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !(v instanceof Date) && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key))
    } else {
      out[key] = toScalar(v)
    }
  }
  return out
}

function toScalar(v: any): any {
  if (v instanceof Date) return v.toISOString()
  if (Array.isArray(v)) return JSON.stringify(v)
  return v
}

function toCSV(rows: Record<string, any>[]): string {
  if (rows.length === 0) return ''
  const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))))
  const esc = (v: any) => {
    if (v === null || v === undefined) return ''
    const s = String(v).replace(/"/g, '""')
    return /[",\n;]/.test(s) ? `"${s}"` : s
  }
  const head = headers.join(';')
  const body = rows.map(r => headers.map(h => esc(r[h])).join(';')).join('\n')
  return `${head}\n${body}`
}

/**
 * Opens the printable view in a new window and triggers the native
 * print dialog. User picks "Save as PDF" to produce a PDF.
 *
 * The report payload is stashed in sessionStorage under a per-report key
 * so the print window (same-origin) can read it without needing a new
 * authenticated request.
 */
export function exportPDF(report: { id: number; nome: string; tipo: string; createdAt: string; geradoPor?: string | null; dados: any }) {
  const key = `report-print-${report.id}`
  try {
    sessionStorage.setItem(key, JSON.stringify(report))
  } catch {
    alert('Não foi possível preparar a impressão.')
    return
  }
  const win = window.open(`/reports/print/${report.id}`, '_blank', 'width=1024,height=768')
  if (!win) {
    alert('Permita pop-ups para exportar em PDF.')
    sessionStorage.removeItem(key)
  }
}
