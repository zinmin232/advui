import { useEffect, useRef, useState } from 'react'
import { type DragOptions, type DragOverlay, placeAt } from './place'

// A mouse drag starts after this many pixels; a touch drag after holding
// still this long, so a swipe still scrolls the board.
const slop = 4
const holdMs = 250
// Near the board's edges a drag scrolls it sideways.
const edge = 48
const scrollStep = 16

type Press = {
  itemId: string
  pointerId: number
  touch: boolean
  x: number
  y: number
  overlay: DragOverlay
  started: boolean
  timer?: ReturnType<typeof setTimeout>
  /** Removes the listeners added for this press: its own, from that render. */
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
}

/**
 * Web: pointer events on the card, then on the window, so the drag goes on
 * while the card moves between columns (it mounts again there). A mouse
 * starts dragging once it moves; a finger once it has held still.
 */
export function useDrag(options: DragOptions) {
  const handlers = useRef(options)
  handlers.current = options
  const press = useRef<Press | null>(null)
  const [overlay, setOverlay] = useState<DragOverlay | null>(null)
  // A click follows the pointerup that ends a drag; it is not a press.
  const dragged = useRef(false)

  const rectOf = (kind: 'column' | 'card', id: string) => {
    const node = (
      kind === 'column' ? handlers.current.columns : handlers.current.cards
    ).current.get(id)
    const rect = (node as HTMLElement | undefined)?.getBoundingClientRect()
    return rect ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height } : null
  }

  const end = () => {
    const current = press.current
    if (!current) return
    clearTimeout(current.timer)
    current.detach()
    press.current = null
    setOverlay(null)
  }

  const begin = () => {
    const current = press.current
    if (!current || current.started) return
    current.started = true
    handlers.current.onStart(current.itemId)
    setOverlay(current.overlay)
  }

  function onMove(event: PointerEvent) {
    const current = press.current
    if (!current || event.pointerId !== current.pointerId) return
    if (!current.started) {
      const moved = Math.hypot(event.clientX - current.x, event.clientY - current.y) > slop
      // A finger that moves before the hold is scrolling.
      if (current.touch) return moved ? end() : undefined
      if (!moved) return
      begin()
    }
    const next = { ...current.overlay, x: event.clientX, y: event.clientY }
    current.overlay = next
    setOverlay(next)
    const board = handlers.current.board.current as HTMLElement | null
    if (board) {
      const rect = board.getBoundingClientRect()
      if (event.clientX < rect.left + edge) board.scrollLeft -= scrollStep
      else if (event.clientX > rect.right - edge) board.scrollLeft += scrollStep
    }
    const target = placeAt(
      event.clientX,
      event.clientY,
      handlers.current.preview.current,
      handlers.current.draggingId.current,
      rectOf,
    )
    if (target) handlers.current.onOver(target)
  }

  function onUp(event: PointerEvent) {
    const current = press.current
    if (!current || event.pointerId !== current.pointerId) return
    if (current.started) {
      dragged.current = true
      setTimeout(() => {
        dragged.current = false
      })
      handlers.current.onDrop()
    }
    end()
  }

  function onPointerCancel(event: PointerEvent) {
    const current = press.current
    if (!current || event.pointerId !== current.pointerId) return
    if (current.started) handlers.current.onCancel()
    end()
  }

  function onKey(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !press.current?.started) return
    event.preventDefault()
    event.stopPropagation()
    handlers.current.onCancel()
    end()
  }

  // Once a touch drag has started, the page must not scroll under it.
  function blockScroll(event: TouchEvent) {
    if (press.current?.started) event.preventDefault()
  }

  // Unmounted mid-drag: no listeners stay behind.
  useEffect(
    () => () => {
      clearTimeout(press.current?.timer)
      press.current?.detach()
    },
    [],
  )

  return {
    overlay,
    boardProps: {},
    columnProps: (_columnId: string) => ({}),
    consumePress: () => dragged.current,
    cardProps: (itemId: string) => ({
      // A long touch would open the browser's menu over the card.
      onContextMenu: (event: { preventDefault: () => void }) => {
        if (press.current?.touch) event.preventDefault()
      },
      onPointerDown: (event: PointerDown) => {
        if (event.button !== 0 || press.current || !handlers.current.canDrag(itemId)) return
        const touch = event.pointerType === 'touch'
        const card = event.currentTarget
        const rect = card.getBoundingClientRect()
        if (!touch) {
          // No text selection while dragging. That also skips the focus a
          // press would give, so the card takes it here.
          event.preventDefault()
          card.focus({ preventScroll: true })
        }
        press.current = {
          itemId,
          pointerId: event.pointerId,
          touch,
          x: event.clientX,
          y: event.clientY,
          overlay: {
            x: event.clientX,
            y: event.clientY,
            dx: event.clientX - rect.left,
            dy: event.clientY - rect.top,
            width: rect.width,
          },
          started: false,
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
      },
    }),
    cardLayout: (_itemId: string, _columnId: string) => ({}),
  }
}
