import { useMemo, useRef } from 'react'
import { type LayoutChangeEvent, PanResponder } from 'react-native'
import { isWeb } from 'tamagui/unstyled'

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export interface ColorDragOptions {
  disabled: boolean
  /** The pointer's place in the surface, from 0 to 1 on each axis. */
  onDrag: (x: number, y: number) => void
  /** The press or drag ended. */
  onEnd: () => void
}

type Pointer = {
  button: number
  clientX: number
  clientY: number
  pointerId: number
  currentTarget: HTMLElement
  preventDefault: () => void
}

/**
 * Press-and-drag on a color surface. Web uses pointer events with capture, so
 * the drag continues outside the surface; native uses a PanResponder that
 * keeps the gesture from a sheet or scroll view around it. Children of the
 * surface must not take touches (`pointerEvents="none"`): native positions are
 * relative to the view that was touched.
 */
export function useColorDrag(options: ColorDragOptions) {
  const handlers = useRef(options)
  handlers.current = options
  const dragging = useRef(false)
  // Native: the surface size from onLayout and where the touch started.
  const size = useRef({ width: 0, height: 0 })
  const origin = useRef({ x: 0, y: 0 })

  const native = useMemo(() => {
    if (isWeb) return null
    const report = (x: number, y: number) => {
      const { width, height } = size.current
      if (width > 0 && height > 0) handlers.current.onDrag(clamp01(x / width), clamp01(y / height))
    }
    const end = () => {
      if (!dragging.current) return
      dragging.current = false
      handlers.current.onEnd()
    }
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !handlers.current.disabled,
      onMoveShouldSetPanResponder: () => !handlers.current.disabled,
      // Keep the drag when a sheet or scroll view around the surface asks for it.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        dragging.current = true
        origin.current = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY }
        report(origin.current.x, origin.current.y)
      },
      onPanResponderMove: (_, gesture) =>
        report(origin.current.x + gesture.dx, origin.current.y + gesture.dy),
      onPanResponderRelease: end,
      onPanResponderTerminate: end,
    })
  }, [])

  if (native) {
    return {
      surface: {
        ...native.panHandlers,
        onLayout: (event: LayoutChangeEvent) => {
          size.current = event.nativeEvent.layout
        },
      },
      // For a view around the surface. During a drag it claims each move
      // first, so a sheet further up is never asked: Tamagui's Sheet marks
      // itself as dragging when asked about a vertical move, even though the
      // surface keeps the gesture, and then stays open when told to close.
      guard: { onMoveShouldSetResponder: () => dragging.current },
    }
  }

  const report = (event: Pointer) => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      handlers.current.onDrag(
        clamp01((event.clientX - rect.left) / rect.width),
        clamp01((event.clientY - rect.top) / rect.height),
      )
    }
  }
  const end = (event: Pointer) => {
    if (!dragging.current) return
    dragging.current = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    handlers.current.onEnd()
  }
  return {
    surface: {
      onPointerDown: (event: Pointer) => {
        if (handlers.current.disabled || event.button !== 0) return
        // No text selection while dragging. That also skips the focus a press
        // would give, so focus the surface for the arrow keys.
        event.preventDefault()
        event.currentTarget.focus()
        event.currentTarget.setPointerCapture?.(event.pointerId)
        dragging.current = true
        report(event)
      },
      onPointerMove: (event: Pointer) => {
        if (dragging.current) report(event)
      },
      onPointerUp: end,
      onPointerCancel: end,
    },
    guard: null,
  }
}
