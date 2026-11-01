import { useEffect, useMemo, useRef } from 'react'
import { type GestureResponderEvent, PanResponder } from 'react-native'
import { useScrollLock } from '@advui/core'
import {
  type CalendarEventChange,
  type EventDragOptions,
  type EventEdit,
  changesTimes,
  dayAt,
  moveTimes,
  resizeTimes,
} from './editing'
import { type CalendarEvent, eventEnd } from './events'

type Measurable = {
  measure?: (
    done: (
      x: number,
      y: number,
      width: number,
      height: number,
      pageX: number,
      pageY: number,
    ) => void,
  ) => void
}

// A long press this close to an event's bottom edge changes when it ends.
const edgeZone = 16

/**
 * Native: a long press picks the event up, and from then on the grid claims
 * each move before a scroll view can, until the finger lifts (as Kanban
 * does). The pickup stops the Adv UI scroll views around the grid
 * (useScrollLock) before the finger moves; the grid's own ScrollArea stops
 * while there is a preview. A press near the event's bottom edge changes when
 * it ends. Columns are measured from the root view at the pickup, as the
 * finger's pageX is.
 */
export function useEventDrag(options: EventDragOptions) {
  const handlers = useRef(options)
  handlers.current = options
  const active = useRef<{
    event: CalendarEvent
    edit: EventEdit
    day: number
    y: number
    rects: ({ x: number; width: number } | null)[]
    last: CalendarEventChange | null
  } | null>(null)
  const claimed = useRef(false)
  const lockScroll = useScrollLock()
  const releaseScroll = useRef<(() => void) | null>(null)

  const finish = (commit: boolean) => {
    const current = active.current
    if (!current) return
    active.current = null
    claimed.current = false
    releaseScroll.current?.()
    releaseScroll.current = null
    handlers.current.onPreview(null)
    if (commit && current.last && changesTimes(current.event, current.last)) {
      handlers.current.onCommit(current.last)
    }
  }

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: () => !!active.current,
        onPanResponderGrant: () => {
          claimed.current = true
        },
        onPanResponderMove: (_, gesture) => {
          const current = active.current
          if (!current) return
          const { minuteHeight, step } = handlers.current
          const minutes = (gesture.moveY - current.y) / minuteHeight
          const { event } = current
          let times
          if (current.edit === 'resize') {
            times = resizeTimes(event, minutes, step)
          } else {
            const day = dayAt(gesture.moveX, current.rects)
            times = moveTimes(event, minutes, day === -1 ? 0 : day - current.day, step)
          }
          current.last = { event, ...times }
          handlers.current.onPreview(current.last)
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: () => finish(true),
        onPanResponderTerminate: () => finish(false),
      }),
    [],
  )

  useEffect(
    () => () => {
      active.current = null
      releaseScroll.current?.()
    },
    [],
  )

  const pickUp = (event: CalendarEvent, day: number, edit: EventEdit, y: number) => {
    const rects: ({ x: number; width: number } | null)[] = []
    handlers.current.columns.current.forEach((node, index) => {
      rects[index] = null
      ;(node as Measurable | null)?.measure?.((_x, _y, width, _height, pageX) => {
        rects[index] = { x: pageX, width }
      })
    })
    active.current = { event, edit, day, y, rects, last: null }
    releaseScroll.current = lockScroll()
    handlers.current.onPreview({ event, start: event.start, end: eventEnd(event) })
  }

  return {
    gridProps: pan.panHandlers,
    consumePress: () => false,
    eventProps: (event: CalendarEvent, day: number) => ({
      delayLongPress: 300,
      onLongPress: (press: GestureResponderEvent) => {
        if (active.current || !handlers.current.canEdit(event)) return
        const { pageY } = press.nativeEvent
        const target = press.currentTarget as unknown as Measurable | null
        if (!target?.measure) return pickUp(event, day, 'move', pageY)
        target.measure((_x, _y, _width, height, _pageX, top) => {
          pickUp(event, day, pageY > top + height - edgeZone ? 'resize' : 'move', pageY)
        })
      },
      // A long press that lifts without moving: the grid never took the
      // gesture, so the event hears the end.
      onPressOut: () => {
        setTimeout(() => {
          if (active.current && !claimed.current) finish(true)
        })
      },
    }),
    // A long press near the bottom edge resizes: there is no edge to hold.
    handleProps: (_event: CalendarEvent, _day: number) => null,
  }
}
