import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView } from 'react-native'
import { type Token, getTokenValue } from 'tamagui'
import {
  type CarouselTrackHandle,
  type CarouselTrackProps,
  SlideStyleContext,
  indexAt,
} from './shared'

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>

/**
 * Native: a horizontal ScrollView that snaps to each slide. Percentages do
 * not size children of a horizontal ScrollView, so slide widths come from its
 * measured width.
 */
export const CarouselTrack = forwardRef<CarouselTrackHandle, CarouselTrackProps>(
  function CarouselTrack(
    { index, count, perView, lastIndex, gap, onSettle, onDragChange, children },
    ref,
  ) {
    const scrollRef = useRef<ScrollView>(null)
    const [width, setWidth] = useState(0)
    const gapPx = (getTokenValue(gap as Token, 'space') as number | undefined) ?? 0
    const slideWidth = width ? (width - (perView - 1) * gapPx) / perView : 0
    const step = slideWidth + gapPx
    const max = Math.max(0, count * slideWidth + (count - 1) * gapPx - width)
    const offsets = Array.from({ length: lastIndex + 1 }, (_, i) => Math.min(i * step, max))

    const geometry = useRef({ width, offsets })
    geometry.current = { width, offsets }
    const scrollTo = (target: number, animated: boolean) => {
      const { width: measured, offsets: stops } = geometry.current
      // Before the first layout there is nothing to scroll; the layout effect shows `index`.
      if (measured) scrollRef.current?.scrollTo({ x: stops[target] ?? 0, animated })
    }

    useImperativeHandle(ref, () => ({ scrollToIndex: scrollTo }))

    // After the first layout, and when the width changes (rotation), show the
    // current slide. Only a new layout runs it; index changes scroll from Carousel.
    const indexRef = useRef(index)
    indexRef.current = index
    const layoutKey = `${width}:${perView}:${gapPx}:${count}`
    useEffect(() => {
      scrollTo(indexRef.current, false)
    }, [layoutKey])

    // A pause in scroll events ends a swipe, a snap or a scrollTo alike, and
    // also the scroll a screen reader makes to reach a slide.
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    useEffect(() => () => clearTimeout(timer.current), [])
    const settle = (x: number) => {
      clearTimeout(timer.current)
      if (width) onSettle(indexAt(x, step, max, lastIndex))
    }
    const onScroll = (event: ScrollEvent) => {
      const x = event.nativeEvent.contentOffset.x
      clearTimeout(timer.current)
      timer.current = setTimeout(() => settle(x), 120)
    }

    return (
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToOffsets={width ? offsets : undefined}
        decelerationRate="fast"
        // One slide per swipe, as on web (`scroll-snap-stop`).
        disableIntervalMomentum
        // Android: inside a scrolling screen, sideways swipes still reach it.
        nestedScrollEnabled
        scrollEventThrottle={16}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onScroll={onScroll}
        onScrollBeginDrag={() => onDragChange(true)}
        onScrollEndDrag={() => onDragChange(false)}
        onMomentumScrollEnd={(event: ScrollEvent) => settle(event.nativeEvent.contentOffset.x)}
        contentContainerStyle={{ gap: gapPx }}
        // Hidden for the one frame before the slides have their widths.
        style={{ opacity: width ? 1 : 0 }}
      >
        <SlideStyleContext.Provider
          value={{ flexShrink: 0, ...(slideWidth ? { width: slideWidth } : null) }}
        >
          {children}
        </SlideStyleContext.Provider>
      </ScrollView>
    )
  },
)
