import type { RefObject } from 'react'
import type { TamaguiElement } from 'tamagui/unstyled'
import { addDays, minutesPerDay, startOfDay } from './dates'
import { type CalendarEvent, eventEnd } from './events'

/** An event's new times, after a drag, a key press or a screen reader action. */
export interface CalendarEventChange {
  event: CalendarEvent
  start: Date
  end: Date
}

/** What a drag does: the whole event moves, or its end does. */
export type EventEdit = 'move' | 'resize'

const minuteMs = 60_000

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

// A time on `day`, `minutes` from its midnight by the clock (a daylight saving
// change does not shift it off the steps).
const onDay = (day: Date, minutes: number) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes)

const minutesOf = (date: Date) => date.getHours() * 60 + date.getMinutes()

/**
 * The event `minutes` and `days` later, its start rounded to the steps from
 * midnight (15 → :00, :15, :30, :45) and its length kept. The start stays on
 * its day: from midnight to a step before the next.
 */
export function moveTimes(event: CalendarEvent, minutes: number, days: number, step: number) {
  const length = eventEnd(event).getTime() - event.start.getTime()
  const into = Math.round((minutesOf(event.start) + minutes) / step) * step
  const start = onDay(addDays(event.start, days), clamp(into, 0, minutesPerDay - step))
  return { start, end: new Date(start.getTime() + length) }
}

/**
 * The event with its end `minutes` later, on the steps: at least a step after
 * its start, and no later than the midnight that ends its last day.
 */
export function resizeTimes(event: CalendarEvent, minutes: number, step: number) {
  const end = eventEnd(event)
  // The day it ends on: an end at midnight belongs to the day before.
  const lastDay = startOfDay(new Date(end.getTime() - 1))
  const nextMidnight = addDays(lastDay, 1)
  const into = (end >= nextMidnight ? minutesPerDay : minutesOf(end)) + minutes
  const earliest = event.start.getTime() + step * minuteMs
  const moved = onDay(lastDay, Math.round(into / step) * step).getTime()
  return {
    start: event.start,
    end: new Date(clamp(moved, earliest, Math.max(earliest, nextMidnight.getTime()))),
  }
}

/** Whether new times differ from the event's own. */
export const changesTimes = (event: CalendarEvent, times: { start: Date; end: Date }) =>
  times.start.getTime() !== event.start.getTime() ||
  times.end.getTime() !== eventEnd(event).getTime()

export interface EventDragOptions {
  /** Pixels per minute on the hours. */
  minuteHeight: number
  /** Minutes the times snap to. */
  step: number
  /** The shown days' columns, in order: the day under the pointer is the nearest. */
  columns: RefObject<(TamaguiElement | null)[]>
  /** The scrolling hours, scrolled when a drag nears their top or bottom (web). */
  scroller: RefObject<TamaguiElement | null>
  canEdit: (event: CalendarEvent) => boolean
  /** Where the event would land while it is dragged; null once the drag ends. */
  onPreview: (change: CalendarEventChange | null) => void
  onCommit: (change: CalendarEventChange) => void
}

/** The column nearest to `x`, by its index, or -1 before they are measured. */
export function dayAt(x: number, rects: ({ x: number; width: number } | null)[]) {
  let best = -1
  let distance = Infinity
  rects.forEach((rect, index) => {
    if (!rect) return
    const away = x < rect.x ? rect.x - x : x > rect.x + rect.width ? x - rect.x - rect.width : 0
    if (away < distance) {
      best = index
      distance = away
    }
  })
  return best
}
