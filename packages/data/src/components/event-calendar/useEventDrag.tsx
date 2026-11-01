import { useEffect, useRef } from 'react'
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

// A mouse drag starts after this many pixels; a touch drag after holding
// still this long, so a swipe still scrolls the hours.
const slop = 4
const holdMs = 250
// Near the top or bottom of the hours, a drag scrolls them.
const edge = 32
const scrollStep = 12

type Press = {
  event: CalendarEvent
  edit: EventEdit
  day: number
  pointerId: number
  touch: boolean
  x: number
  y: number
  scrollTop: number
  started: boolean
  last: CalendarEventChange | null
  timer?: ReturnType<typeof setTimeout>
  detach: () => void
}

type PointerDown = {
  button: number
  pointerId: number
  pointerType: string
  clientX: number
  clientY: number
  currentTarget: HTMLElement
  preventDefault: () => void
  stopPropagation: () => void
}

/**
 * Web: pointer events on the event, then on the window, so the drag goes on
 * while the event moves to another day's column (it mounts again there). A
 * press on its bottom edge changes when it ends; anywhere else moves it.
 */
export function useEventDrag(options: EventDragOptions) {
  const handlers = useRef(options)
  handlers.current = options
  const press = useRef<Press | null>(null)
  // A click follows the pointerup that ends a drag; it is not a press.
  const dragged = useRef(false)

  const scroller = () => handlers.current.scroller.current as HTMLElement | null

  const end = () => {
    const current = press.current
    if (!current) return
    clearTimeout(current.timer)
    current.detach()
    press.current = null
  }

  const begin = () => {
    const current = press.current
    if (!current || current.started) return
    current.started = true
    const { event } = current
    handlers.current.onPreview({ event, start: event.start, end: eventEnd(event) })
  }

  function onMove(pointer: PointerEvent) {
    const current = press.current
    if (!current || pointer.pointerId !== current.pointerId) return
    if (!current.started) {
      const moved = Math.hypot(pointer.clientX - current.x, pointer.clientY - current.y) > slop
      // A finger that moves before the hold is scrolling.
      if (current.touch) return moved ? end() : undefined
      if (!moved) return
      begin()
    }
    const hours = scroller()
    if (hours) {
      const rect = hours.getBoundingClientRect()
      if (pointer.clientY < rect.top + edge) hours.scrollTop -= scrollStep
      else if (pointer.clientY > rect.bottom - edge) hours.scrollTop += scrollStep
    }
    const { minuteHeight, step, columns } = handlers.current
    const scrolled = (hours?.scrollTop ?? 0) - current.scrollTop
    const minutes = (pointer.clientY - current.y + scrolled) / minuteHeight
    const { event } = current
    let times
    if (current.edit === 'resize') {
      times = resizeTimes(event, minutes, step)
    } else {
      const rects = columns.current.map((node) => {
        const rect = (node as HTMLElement | null)?.getBoundingClientRect()
        return rect ? { x: rect.left, width: rect.width } : null
      })
      const day = dayAt(pointer.clientX, rects)
      times = moveTimes(event, minutes, day === -1 ? 0 : day - current.day, step)
    }
    current.last = { event, ...times }
    handlers.current.onPreview(current.last)
  }

  function onUp(pointer: PointerEvent) {
    const current = press.current
    if (!current || pointer.pointerId !== current.pointerId) return
    if (current.started) {
      dragged.current = true
      setTimeout(() => {
        dragged.current = false
      })
      handlers.current.onPreview(null)
      if (current.last && changesTimes(current.event, current.last)) {
        handlers.current.onCommit(current.last)
      }
    }
    end()
  }

  function onPointerCancel(pointer: PointerEvent) {
    const current = press.current
    if (!current || pointer.pointerId !== current.pointerId) return
    if (current.started) handlers.current.onPreview(null)
    end()
  }

  function onKey(key: KeyboardEvent) {
    if (key.key !== 'Escape' || !press.current?.started) return
    key.preventDefault()
    key.stopPropagation()
    handlers.current.onPreview(null)
    end()
  }

  // Once a touch drag has started, the page must not scroll under it.
  function blockScroll(touch: TouchEvent) {
    if (press.current?.started) touch.preventDefault()
  }

  // Unmounted mid-drag: no listeners stay behind.
  useEffect(
    () => () => {
      clearTimeout(press.current?.timer)
      press.current?.detach()
    },
    [],
  )

  const start = (event: CalendarEvent, day: number, edit: EventEdit, pointer: PointerDown) => {
    if (pointer.button !== 0 || press.current || !handlers.current.canEdit(event)) return
    // The bottom edge sits inside the event: only one of them starts.
    pointer.stopPropagation()
    const touch = pointer.pointerType === 'touch'
    if (!touch) {
      // No text selection while dragging. That also skips the focus a press
      // would give, so the event takes it here.
      pointer.preventDefault()
      const button = pointer.currentTarget.closest('button') ?? pointer.currentTarget
      button.focus({ preventScroll: true })
    }
    press.current = {
      event,
      edit,
      day,
      pointerId: pointer.pointerId,
      touch,
      x: pointer.clientX,
      y: pointer.clientY,
      scrollTop: scroller()?.scrollTop ?? 0,
      started: false,
      last: null,
      ...(touch && { timer: setTimeout(begin, holdMs) }),
      detach: () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onPointerCancel)
        window.removeEventListener('keydown', onKey, true)
        document.removeEventListener('touchmove', blockScroll)
      },
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onPointerCancel)
    window.addEventListener('keydown', onKey, true)
    if (touch) document.addEventListener('touchmove', blockScroll, { passive: false })
  }

  return {
    gridProps: {},
    consumePress: () => dragged.current,
    eventProps: (event: CalendarEvent, day: number) => ({
      // A long touch would open the browser's menu over the event.
      onContextMenu: (menu: { preventDefault: () => void }) => {
        if (press.current?.touch) menu.preventDefault()
      },
      onPointerDown: (pointer: PointerDown) => start(event, day, 'move', pointer),
    }),
    /** The bottom edge, which changes when the event ends. Null where the event takes it (native). */
    handleProps: (event: CalendarEvent, day: number) => ({
      cursor: 'ns-resize' as const,
      onPointerDown: (pointer: PointerDown) => start(event, day, 'resize', pointer),
    }),
  }
}
