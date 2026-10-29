import type { RefObject } from 'react'
import type { TamaguiElement } from 'tamagui/unstyled'
import type { KanbanColumn } from './moves'

export interface DragTarget {
  columnId: string
  index: number
}

/** Where the floating card is: the pointer, less where the card was held. */
export interface DragOverlay {
  x: number
  y: number
  dx: number
  dy: number
  width: number
}

export interface DragOptions {
  /** The columns as the drag would leave them, to find the place under the pointer. */
  preview: RefObject<readonly KanbanColumn[]>
  draggingId: RefObject<string | null>
  /** The board's scrolling box, scrolled when the pointer nears its edges. */
  board: RefObject<TamaguiElement | null>
  /** Each column's list of cards, and each card. */
  columns: RefObject<Map<string, TamaguiElement>>
  cards: RefObject<Map<string, TamaguiElement>>
  canDrag: (itemId: string) => boolean
  onStart: (itemId: string) => void
  onOver: (target: DragTarget) => void
  onDrop: () => void
  onCancel: () => void
}

export type Rect = { x: number; y: number; width: number; height: number }

/** The place under a point: the nearest column, and the index among its other cards. */
export function placeAt(
  x: number,
  y: number,
  preview: readonly KanbanColumn[],
  draggingId: string | null,
  rectOf: (kind: 'column' | 'card', id: string) => Rect | null,
): DragTarget | null {
  let best: KanbanColumn | null = null
  let distance = Infinity
  for (const column of preview) {
    const rect = rectOf('column', column.id)
    if (!rect) continue
    const away = x < rect.x ? rect.x - x : x > rect.x + rect.width ? x - rect.x - rect.width : 0
    if (away < distance) {
      best = column
      distance = away
    }
  }
  if (!best) return null
  let index = 0
  for (const item of best.items) {
    if (item.id === draggingId) continue
    const rect = rectOf('card', item.id)
    if (rect && y > rect.y + rect.height / 2) index++
  }
  return { columnId: best.id, index }
}
