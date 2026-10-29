// Local calendar days: the time part is dropped, so days never shift with
// time zones. Core's Calendar keeps its own copies; these add weeks and minutes.

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

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function startOfWeek(date: Date, weekStartsOn: number) {
  return addDays(startOfDay(date), -((date.getDay() - weekStartsOn + 7) % 7))
}

/** The days of the week holding `date`, from `weekStartsOn`. */
export function weekDays(date: Date, weekStartsOn: number, length = 7) {
  const start = startOfWeek(date, weekStartsOn)
  return Array.from({ length }, (_, i) => addDays(start, i))
}

/** The weeks that hold a day of `month`: four to six rows of seven days. */
export function monthWeeks(month: Date, weekStartsOn: number) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const weeks: Date[][] = []
  for (let start = startOfWeek(first, weekStartsOn); ; start = addDays(start, 7)) {
    if (weeks.length && !isSameMonth(start, month)) break
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(start, i)))
  }
  return weeks
}

/** The days of `month`, in order. */
export function monthDays(month: Date) {
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  return Array.from(
    { length: count },
    (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
  )
}

export const minutesPerDay = 24 * 60

/**
 * Minutes from the start of `day` to `date` on the clock, clamped to that
 * day. By the clock, so a day with a daylight saving change still has 24 hours.
 */
export function minutesInto(day: Date, date: Date) {
  if (date < startOfDay(day)) return 0
  if (date >= addDays(day, 1)) return minutesPerDay
  return date.getHours() * 60 + date.getMinutes()
}

/** ISO date without time zones, for keys: `2026-10-28`. */
export function dayKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
