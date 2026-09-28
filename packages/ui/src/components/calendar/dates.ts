// Calendar-day helpers. Dates are local calendar days: the time part is
// ignored, so a picked day never shifts with time zones.

export interface DateRange {
  start: Date | null
  end: Date | null
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Same day of the month, clamped to the target month's length (31 Jan + 1 → 28/29 Feb). */
export function addMonths(date: Date, months: number) {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), last))
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function compareDays(a: Date, b: Date) {
  return startOfDay(a).getTime() - startOfDay(b).getTime()
}

export function clampDay(date: Date, min?: Date, max?: Date) {
  if (min && compareDays(date, min) < 0) return startOfDay(min)
  if (max && compareDays(date, max) > 0) return startOfDay(max)
  return startOfDay(date)
}

/** Six rows of seven days covering `month`, starting on `weekStartsOn`. */
export function monthGrid(month: Date, weekStartsOn: number) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = addDays(first, -((first.getDay() - weekStartsOn + 7) % 7))
  return Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) => addDays(start, row * 7 + col)),
  )
}

/** ISO date without time zones: `2026-09-28`. */
export function toISODate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
