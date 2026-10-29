import { useEffect, useRef, useState } from 'react'
import { type TamaguiElement, View } from 'tamagui/unstyled'

export interface NearEndOptions {
  /** Whether a load may start now: more to load, none loading, no error. */
  enabled: boolean
  /** How near the end counts, in visible heights. */
  threshold: number
  /** The number of loaded items, so a check after a render asks only once per length. */
  count: number
  onNearEnd: () => void
}

/**
 * Web: watches a sentinel at the end of the content with an
 * IntersectionObserver, which sees clipping by every scrolling box around
 * it, so the same code works in a ScrollArea of its own height or on the
 * page. The sentinel reaches up `threshold` visible heights from the end.
 */
export function useNearEnd({ enabled, threshold, count, onNearEnd }: NearEndOptions) {
  const frameRef = useRef<TamaguiElement | null>(null)
  const sentinelRef = useRef<TamaguiElement>(null)
  const [reach, setReach] = useState(0)
  const callback = useRef(onNearEnd)
  callback.current = onNearEnd
  const calledFor = useRef(-1)

  // The visible height: the area's own, or the window's when the page scrolls.
  useEffect(() => {
    const frame = frameRef.current as HTMLElement | null
    if (!frame) return
    const measure = () =>
      setReach(Math.round(threshold * Math.min(frame.clientHeight, window.innerHeight)))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [threshold])

  useEffect(() => {
    const sentinel = sentinelRef.current as HTMLElement | null
    if (!enabled || !sentinel || typeof IntersectionObserver === 'undefined') return
    let first = true
    const observer = new IntersectionObserver((entries) => {
      // The first report says where the end is now, after a render: load
      // only if the items changed since the last load, so a page that came
      // back empty does not load again and again.
      const initial = first
      first = false
      if (!entries.some((entry) => entry.isIntersecting)) return
      if (initial && calledFor.current === count) return
      calledFor.current = count
      callback.current()
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, count, reach])

  return {
    frameRef,
    frameProps: {},
    sentinel: (
      <View
        ref={sentinelRef}
        aria-hidden
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        // At least a pixel, or there is nothing to intersect.
        height={Math.max(1, reach)}
        pointerEvents="none"
      />
    ),
  }
}
