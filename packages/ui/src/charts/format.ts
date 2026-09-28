const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const full = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

/** Axis ticks: 1.2K, 3.4M. */
export const formatCompact = (value: number) => compact.format(value)

/** Tooltips and the table: 1,234.5. */
export const formatFull = (value: number) => full.format(value)

/** Reads a numeric field; anything else counts as missing. */
export function numberAt(row: Record<string, unknown>, key: string): number | null {
  const value = row[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
