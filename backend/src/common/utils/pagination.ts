export type PaginationInput = { page?: number | string; limit?: number | string }

export function toPositiveInt(value: number | string | undefined, fallback: number) {
  const parsed = typeof value === 'number' ? value : value ? Number(value) : NaN
  const normalized = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
  return normalized
}

export function normalizePagination(input?: PaginationInput, defaultLimit = 20) {
  const fallbackLimit = Math.max(1, defaultLimit)
  const page = toPositiveInt(input?.page, 1)
  const limit = toPositiveInt(input?.limit, fallbackLimit)
  const skip = Math.max(0, (page - 1) * limit)
  return { page, limit, skip }
}
