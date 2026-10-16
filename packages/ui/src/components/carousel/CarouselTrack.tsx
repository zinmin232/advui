import { type KeyboardEvent, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { type Token, View, type ViewProps, getTokenValue } from 'tamagui'
import { responsiveStyle } from '../../utils/responsive'
import {
  type CarouselTrackHandle,
  type CarouselTrackKey,
  type CarouselTrackProps,
  SlideStyleContext,
  indexAt,
} from './shared'

/** Slide width for `perView` slides with `gap` pixels between them. */
function slideWidth(perView: number, gap: number) {
  const count = Math.max(1, perView)
  return count === 1 ? '100%' : `calc((100% - ${(count - 1) * gap}px) / ${count})`
}

const keys: Record<string, [CarouselTrackKey, CarouselTrackKey] | undefined> = {
  // [left to right, right to left]
  ArrowLeft: ['previous', 'next'],
  ArrowRight: ['next', 'previous'],
  Home: ['first', 'first'],
  End: ['last', 'last'],
}

/**
 * Web: a row that scrolls sideways and snaps each slide to its start (CSS
 * scroll snap), so touch, trackpads and the scroll wheel move it natively.
 * Slide widths are CSS, with a media query per breakpoint, so the server
 * renders them right.
 */
export const CarouselTrack = forwardRef<CarouselTrackHandle, CarouselTrackProps>(
  function CarouselTrack({ id, slidesPerView, lastIndex, gap, onSettle, onKey, children }, ref) {
    const trackRef = useRef<HTMLElement | null>(null)
    const gapPx = (getTokenValue(gap as Token, 'space') as number | undefined) ?? 0

    // Read from the page each time: widths follow the breakpoint and the font.
    const measure = () => {
      const el = trackRef.current
      if (!el) return null
      const [first, second] = Array.from(el.children) as HTMLElement[]
      const step = first && second ? Math.abs(second.offsetLeft - first.offsetLeft) : el.clientWidth
      const rtl = getComputedStyle(el).direction === 'rtl'
      return { el, step, max: el.scrollWidth - el.clientWidth, rtl }
    }

    useImperativeHandle(ref, () => ({
      scrollToIndex(index, animated) {
        const track = measure()
        if (!track) return
        const left = Math.min(index * track.step, Math.max(0, track.max))
        // Right to left, scrollLeft runs from 0 down to negative numbers.
        track.el.scrollTo({
          left: track.rtl ? -left : left,
          behavior: animated ? 'smooth' : 'instant',
        })
      },
    }))

    const settleRef = useRef(() => {})
    settleRef.current = () => {
      const track = measure()
      if (track) onSettle(indexAt(Math.abs(track.el.scrollLeft), track.step, track.max, lastIndex))
    }
    useEffect(() => {
      const el = trackRef.current
      if (!el) return
      let timer: ReturnType<typeof setTimeout> | undefined
      const settle = () => {
        clearTimeout(timer)
        settleRef.current()
      }
      // `scrollend` where the browser has it; elsewhere a pause in scroll events.
      const onScroll = () => {
        clearTimeout(timer)
        timer = setTimeout(settle, 120)
      }
      el.addEventListener('scroll', onScroll, { passive: true })
      el.addEventListener('scrollend', settle)
      return () => {
        clearTimeout(timer)
        el.removeEventListener('scroll', onScroll)
        el.removeEventListener('scrollend', settle)
      }
    }, [])

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      // Keys inside a slide (a text field, a link) are left alone.
      if (event.target !== event.currentTarget) return
      const pair = keys[event.key]
      if (!pair) return
      event.preventDefault()
      onKey(pair[getComputedStyle(event.currentTarget).direction === 'rtl' ? 1 : 0])
    }

    const slideStyle = {
      flexShrink: 0,
      ...responsiveStyle('width', slidesPerView, (perView: number) => slideWidth(perView, gapPx)),
      style: { scrollSnapAlign: 'start', scrollSnapStop: 'always' },
    } as ViewProps

    return (
      <View
        ref={trackRef as never}
        id={id}
        // Hides the scrollbar (GlobalStyles); the buttons, dots and swipes move it.
        className="aui-carousel-track"
        // Keyboard users reach slides without links this way, and page with the arrow keys.
        tabIndex={0}
        flexDirection="row"
        gap={gap}
        overflowX="auto"
        overflowY="hidden"
        style={{ scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain' }}
        focusVisibleStyle={{
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 2,
        }}
        onKeyDown={onKeyDown as never}
      >
        <SlideStyleContext.Provider value={slideStyle}>{children}</SlideStyleContext.Provider>
      </View>
    )
  },
)
