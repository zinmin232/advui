import { useEffect, useMemo, useRef, useState } from 'react'
import { type GestureResponderEvent, type LayoutChangeEvent, PanResponder } from 'react-native'
import { type DragOptions, type DragOverlay, type Rect, placeAt } from './place'

type Measurable = { measureInWindow?: (callback: (...rect: number[]) => void) => void }

/**
 * Native: a long press picks the card up. From then on the board claims each
 * move before the card or a scroll view can (as Color Picker's guard does),
 * until the finger lifts. Columns are measured in the window when the drag
 * starts; cards report their place in their column as they lay out.
 */
export function useDrag(options: DragOptions) {
  const handlers = useRef(options)
  handlers.current = options
  const [overlay, setOverlay] = useState<DragOverlay | null>(null)
  const active = useRef<{ itemId: string; overlay: DragOverlay } | null>(null)
  const claimed = useRef(false)
  const columnRects = useRef(new Map<string, Rect>())
  const cardLayouts = useRef(new Map<string, Rect>())
  // The card that lists each card: its place is relative to that column.
  const cardColumns = useRef(new Map<string, string>())

  const rectOf = (kind: 'column' | 'card', id: string): Rect | null => {
    if (kind === 'column') return columnRects.current.get(id) ?? null
    const layout = cardLayouts.current.get(id)
    const column = columnRects.current.get(cardColumns.current.get(id) ?? '')
    return layout && column ? { ...layout, x: column.x + layout.x, y: column.y + layout.y } : null
  }

  const finish = (drop: boolean) => {
    if (!active.current) return
    active.current = null
    claimed.current = false
    setOverlay(null)
    if (drop) handlers.current.onDrop()
    else handlers.current.onCancel()
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
          current.overlay = { ...current.overlay, x: gesture.moveX, y: gesture.moveY }
          setOverlay(current.overlay)
          const target = placeAt(
            gesture.moveX,
            gesture.moveY,
            handlers.current.preview.current,
            handlers.current.draggingId.current,
            rectOf,
          )
          if (target) handlers.current.onOver(target)
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
    },
    [],
  )

  return {
    overlay,
    boardProps: pan.panHandlers,
    columnProps: (columnId: string) => ({
      onLayout: () => {
        const node = handlers.current.columns.current.get(columnId) as Measurable | undefined
        node?.measureInWindow?.((x, y, width, height) =>
          columnRects.current.set(columnId, { x: x!, y: y!, width: width!, height: height! }),
        )
      },
    }),
    consumePress: () => false,
    cardLayout: (itemId: string, columnId: string) => ({
      onLayout: (event: LayoutChangeEvent) => {
        cardLayouts.current.set(itemId, event.nativeEvent.layout)
        cardColumns.current.set(itemId, columnId)
      },
    }),
    cardProps: (itemId: string) => ({
      delayLongPress: 300,
      onLongPress: (event: GestureResponderEvent) => {
        if (active.current || !handlers.current.canDrag(itemId)) return
        const { pageX, pageY, locationX, locationY } = event.nativeEvent
        // Columns move as the board scrolls: measure them now.
        for (const [columnId, node] of handlers.current.columns.current) {
          ;(node as Measurable).measureInWindow?.((x, y, width, height) =>
            columnRects.current.set(columnId, { x: x!, y: y!, width: width!, height: height! }),
          )
        }
        const width = cardLayouts.current.get(itemId)?.width ?? 0
        const next = { x: pageX, y: pageY, dx: locationX, dy: locationY, width }
        active.current = { itemId, overlay: next }
        handlers.current.onStart(itemId)
        setOverlay(next)
      },
      // A long press that lifts without moving: the board never took the
      // gesture, so the card hears the end. The board, once it has taken
      // the gesture, ends the drag itself.
      onPressOut: () => {
        setTimeout(() => {
          if (active.current && !claimed.current) finish(true)
        })
      },
    }),
  }
}
