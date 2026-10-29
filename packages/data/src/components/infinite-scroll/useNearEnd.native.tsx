import { useRef } from 'react'
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import type { TamaguiElement } from 'tamagui/unstyled'
import type { NearEndOptions } from './useNearEnd'

/**
 * Native: the ScrollView's own scroll, content size and layout. A check
 * after a render (a page loaded, or the area was laid out) asks only once
 * per length, as on web; a scroll by the user may always ask.
 */
export function useNearEnd({ enabled, threshold, count, onNearEnd }: NearEndOptions) {
  const frameRef = useRef<TamaguiElement | null>(null)
  const metrics = useRef({ offset: 0, content: 0, visible: 0 })
  const latest = useRef({ enabled, threshold, count, onNearEnd })
  latest.current = { enabled, threshold, count, onNearEnd }
  const calledFor = useRef(-1)

  const check = (byUser: boolean) => {
    const { offset, content, visible } = metrics.current
    const now = latest.current
    if (!now.enabled || visible === 0 || content === 0) return
    if (content - offset - visible > now.threshold * visible) return
    if (!byUser && calledFor.current === now.count) return
    calledFor.current = now.count
    now.onNearEnd()
  }

  // No check when `count` changes: the content size is still the old one
  // then, so it would load again. onContentSizeChange follows with the new.
  return {
    frameRef,
    frameProps: {
      onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
        metrics.current = {
          offset: contentOffset.y,
          content: contentSize.height,
          visible: layoutMeasurement.height,
        }
        check(true)
      },
      scrollEventThrottle: 16,
      // Content shorter than the area never scrolls: these fill it.
      onContentSizeChange: (_width: number, height: number) => {
        metrics.current.content = height
        check(false)
      },
      onLayout: (event: LayoutChangeEvent) => {
        metrics.current.visible = event.nativeEvent.layout.height
        check(false)
      },
    },
    sentinel: null,
  }
}
