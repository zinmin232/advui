import { addDays, minutesInto, minutesPerDay, startOfDay } from './dates'

export type CalendarEventTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  /**
   * When it ends. Default: an hour after `start`. For an all-day event, the
   * last day it covers (default: the day of `start`).
   */
  end?: Date
  /** Fills whole days, shown above the hours in the week and day views. */
  allDay?: boolean
  /** Color. Default `primary`. */
  tone?: CalendarEventTone
  /** Not moved or resized, even with `onEventChange`. */
  readOnly?: boolean
}

const hour = 60 * 60_000

export function eventEnd(event: CalendarEvent) {
  return event.end ?? (event.allDay ? event.start : new Date(event.start.getTime() + hour))
}

/** Whether the event covers any part of `day`. */
export function isOnDay(event: CalendarEvent, day: Date) {
  const dayStart = startOfDay(day)
  if (event.allDay) {
    return startOfDay(event.start) <= dayStart && dayStart <= startOfDay(eventEnd(event))
  }
  const dayEnd = addDays(dayStart, 1)
  const end = eventEnd(event)
  // An event with no length still shows on its day.
  if (end.getTime() <= event.start.getTime()) return event.start >= dayStart && event.start < dayEnd
  return event.start < dayEnd && end > dayStart
}

/** All-day events first, then by start, longer first, then by title. */
export function compareEvents(a: CalendarEvent, b: CalendarEvent) {
  if (!!a.allDay !== !!b.allDay) return a.allDay ? -1 : 1
  return (
    a.start.getTime() - b.start.getTime() ||
    eventEnd(b).getTime() - eventEnd(a).getTime() ||
    a.title.localeCompare(b.title)
  )
}

export function eventsOnDay(events: readonly CalendarEvent[], day: Date) {
  return events.filter((event) => isOnDay(event, day)).sort(compareEvents)
}

export interface PlacedEvent {
  event: CalendarEvent
  /** Minutes from the start of the day. */
  top: number
  bottom: number
  /** Overlapping events sit side by side: this one's column of `columns`. */
  column: number
  columns: number
}

/**
 * Places a day's timed events on its hours. Events that overlap share the
 * width in columns; each group of overlapping events gets as many columns
 * as it needs at its busiest.
 */
export function placeEvents(events: readonly CalendarEvent[], day: Date, minLength = 0) {
  const timed = eventsOnDay(events, day).filter((event) => !event.allDay)
  const placed: PlacedEvent[] = []
  let group: PlacedEvent[] = []
  let columnEnds: number[] = []
  let groupEnd = -1
  const closeGroup = () => {
    for (const item of group) item.columns = columnEnds.length
    group = []
    columnEnds = []
  }
  for (const event of timed) {
    // At least `minLength` tall, so a short event still has room for its title.
    const start = minutesInto(day, event.start)
    const bottom = Math.min(
      minutesPerDay,
      Math.max(minutesInto(day, eventEnd(event)), start + minLength),
    )
    const top = Math.min(start, Math.max(0, bottom - minLength))
    if (top >= groupEnd) closeGroup()
    let column = columnEnds.findIndex((end) => end <= top)
    if (column === -1) column = columnEnds.push(bottom) - 1
    else columnEnds[column] = bottom
    const item = { event, top, bottom, column, columns: 1 }
    group.push(item)
    placed.push(item)
    groupEnd = Math.max(groupEnd, bottom)
  }
  closeGroup()
  return placed
}
