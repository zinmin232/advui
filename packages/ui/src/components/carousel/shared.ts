import { type ReactNode, createContext } from 'react'
import type { SpaceTokens, ViewProps } from 'tamagui/unstyled'
import type { Responsive } from '../../utils/responsive'

/** What Carousel asks of the platform's track. */
export interface CarouselTrackHandle {
  /** Scrolls until slide `index` is first in view, or the track's end is. */
  scrollToIndex: (index: number, animated: boolean) => void
}

export type CarouselTrackKey = 'previous' | 'next' | 'first' | 'last'

export interface CarouselTrackProps {
  id: string
  /** The slide first in view. Native returns to it when the track's width changes. */
  index: number
  count: number
  slidesPerView: Responsive<number>
  /** `slidesPerView` at the current breakpoint. */
  perView: number
  lastIndex: number
  gap: SpaceTokens
  /** Called with the slide first in view once scrolling stops. */
  onSettle: (index: number) => void
  /** Native: a finger is on the track, so autoplay waits. */
  onDragChange: (dragging: boolean) => void
  /** Web: an arrow key, Home or End on the focused track. */
  onKey: (key: CarouselTrackKey) => void
  children: ReactNode
}

/** Width and snap style of every slide, set by the track. */
export const SlideStyleContext = createContext<ViewProps>({})

/**
 * The last slide that can be first in view. With 2.5 slides per view and 5
 * slides that is slide 3 (index 3): the track ends half-way through it.
 */
export function lastIndexFor(count: number, perView: number) {
  // The small margin keeps 5 - 3.0000001 from counting as one more stop.
  return Math.max(0, Math.ceil(count - perView - 0.001))
}

/**
 * The slide first in view at scroll offset `x`, for slides `step` apart on a
 * track that ends at `max`. Stops past `max` are clamped to it, so the end of
 * the track is the last stop.
 */
export function indexAt(x: number, step: number, max: number, lastIndex: number) {
  if (step <= 0) return 0
  if (max > 0 && x >= max - 1) return lastIndex
  return Math.min(lastIndex, Math.max(0, Math.round(x / step)))
}
