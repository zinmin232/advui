import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@advui/icons'
import {
  Children,
  type ReactNode,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { AccessibilityInfo } from 'react-native'
import {
  type GetProps,
  type SpaceTokens,
  type TamaguiElement,
  View,
  type ViewProps,
  XStack,
  isWeb,
  styled,
  useComposedRefs,
  withStaticProperties,
} from 'tamagui'
import { useBreakpointValue } from '../../hooks/useBreakpoint'
import { useControllableState } from '../../hooks/useControllableState'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRipple } from '../../hooks/useRipple'
import { ariaState } from '../../utils/ariaState'
import type { Responsive } from '../../utils/responsive'
import { IconButton } from '../icon-button/IconButton'
import { Text } from '../typography/Text'
import { CarouselTrack } from './CarouselTrack'
import {
  type CarouselTrackHandle,
  type CarouselTrackKey,
  SlideStyleContext,
  lastIndexFor,
} from './shared'

export interface CarouselLabels {
  /** What the carousel is, read after its name (web). Default: "carousel". */
  carousel: string
  /** What a slide is, read after its name (web). Default: "slide". */
  slide: string
  /** A slide's name (web). Default: "3 of 5". */
  slideName: (index: number, count: number) => string
  /** Announced when the slide changes, except by autoplay. Default: "Slide 3 of 5". */
  position: (index: number, count: number) => string
  previous: string
  next: string
  /** A dot's name. Default: "Go to slide 3". */
  goTo: (index: number) => string
  play: string
  pause: string
}

const defaultLabels: CarouselLabels = {
  carousel: 'carousel',
  slide: 'slide',
  slideName: (index, count) => `${index + 1} of ${count}`,
  position: (index, count) => `Slide ${index + 1} of ${count}`,
  previous: 'Previous slide',
  next: 'Next slide',
  goTo: (index) => `Go to slide ${index + 1}`,
  play: 'Play slide show',
  pause: 'Pause slide show',
}

/** Hidden on screen, still read by screen readers (web). */
const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  opacity: 0.00000001,
  pointerEvents: 'none',
} as const

const focusRing = {
  outlineColor: '$ring',
  outlineStyle: 'solid',
  outlineWidth: 2,
  outlineOffset: 2,
} as const

const CarouselFrame = styled(View, {
  name: 'Carousel',
  width: '100%',
  gap: '$3',
  // The controls come first in the tree, so keyboard and screen-reader users
  // meet the pause button before the slides move under them (WAI-ARIA APG),
  // and show under the slides.
  flexDirection: 'column-reverse',
})

export interface CarouselProps extends Omit<GetProps<typeof CarouselFrame>, 'children' | 'gap'> {
  /** The slides: `Carousel.Item` elements, or any elements, one per slide. */
  children: ReactNode
  /** Names the carousel, e.g. "Featured articles". Recommended. */
  'aria-label'?: string
  /** The slide first in view, when you control it. */
  index?: number
  /** Starting `index` when uncontrolled. Default: 0. */
  defaultIndex?: number
  /** Called with the new `index` after a button, dot, key, swipe or autoplay moves it. */
  onIndexChange?: (index: number) => void
  /** Slides in view at once, or a mobile-first map. Fractions show part of the next one. Default: 1. */
  slidesPerView?: Responsive<number>
  /** Space between slides (token). Default: `$4`. */
  gap?: SpaceTokens
  /** Next on the last slide goes back to the first, and Previous on the first to the last. */
  loop?: boolean
  /** Moves to the next slide on its own: `true` every 5 seconds, or a delay in milliseconds. */
  autoplay?: boolean | number
  /** Previous and next buttons. Default: true. */
  showArrows?: boolean
  /** A dot per slide that can come first. Default: true. */
  showDots?: boolean
  /** Button names, role descriptions and announcements, for translation. */
  labels?: Partial<CarouselLabels>
}

interface SlideInfo {
  roleDescription: string
  label: string
}

const SlideContext = createContext<SlideInfo | null>(null)

export type CarouselItemProps = ViewProps

/**
 * One slide. It is the slide itself, so style it (padding, background) like
 * a View; Carousel sets its width.
 */
export const CarouselItem = forwardRef<TamaguiElement, CarouselItemProps>(function CarouselItem(
  { style, ...props },
  ref,
) {
  const slide = useContext(SlideContext)
  const { style: slideStyle, ...layout } = useContext(SlideStyleContext)
  return (
    <View
      ref={ref}
      {...layout}
      {...(isWeb &&
        slide && {
          role: 'group',
          'aria-roledescription': slide.roleDescription,
          'aria-label': slide.label,
        })}
      {...(slideStyle || style
        ? { style: { ...(slideStyle as object), ...(style as object) } }
        : null)}
      {...props}
    />
  )
})

function Dot({
  active,
  label,
  controls,
  onPress,
}: {
  active: boolean
  label: string
  controls: string
  onPress: () => void
}) {
  const ripple = useRipple({ color: '$foreground' })
  return (
    <View
      {...(isWeb
        ? {
            render: 'button',
            type: 'button',
            padding: 0,
            borderWidth: 0,
            'aria-current': active || undefined,
            'aria-controls': controls,
          }
        : { accessible: true, role: 'button', 'aria-selected': ariaState(active) })}
      aria-label={label}
      // A 24px target around an 8px dot (WCAG 2.5.8).
      width="$6"
      height="$6"
      alignItems="center"
      justifyContent="center"
      borderRadius="$full"
      backgroundColor="transparent"
      cursor="pointer"
      hoverStyle={{ backgroundColor: '$accent' }}
      focusVisibleStyle={focusRing}
      onPress={onPress}
      {...ripple.props}
    >
      {ripple.element}
      <View
        width={active ? '$5' : '$2'}
        height="$2"
        borderRadius="$full"
        backgroundColor={active ? '$primary' : '$mutedForeground'}
      />
    </View>
  )
}

/**
 * A row of slides shown one (or a few) at a time, with previous and next
 * buttons, dots, swipe on touch screens and optional autoplay.
 */
const CarouselRoot = forwardRef<TamaguiElement, CarouselProps>(function Carousel(
  {
    children,
    'aria-label': label,
    index: indexProp,
    defaultIndex = 0,
    onIndexChange,
    slidesPerView = 1,
    gap = '$4',
    loop = false,
    autoplay = false,
    showArrows = true,
    showDots = true,
    labels: labelsProp,
    ...props
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelsProp }
  const slides = Children.toArray(children)
  const count = slides.length
  const perView = Math.max(1, useBreakpointValue(slidesPerView) ?? 1)
  const lastIndex = lastIndexFor(count, perView)
  const [rawIndex, setIndex] = useControllableState({
    value: indexProp,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  })
  const index = Math.min(Math.max(0, Math.round(rawIndex) || 0), lastIndex)
  const trackId = useId()
  const reducedMotion = useReducedMotion()

  // Scroll the track when the index changes anywhere but in the track itself.
  const trackRef = useRef<CarouselTrackHandle>(null)
  const shownRef = useRef<number | null>(null)
  useEffect(() => {
    if (shownRef.current === index) return
    // The first scroll, to `defaultIndex`, jumps.
    const animated = shownRef.current !== null && !reducedMotion
    shownRef.current = index
    trackRef.current?.scrollToIndex(index, animated)
  }, [index, reducedMotion])

  const onSettle = (settled: number) => {
    shownRef.current = settled
    setIndex(settled)
  }
  const goTo = (next: number) => setIndex(Math.min(Math.max(0, next), lastIndex))
  const move = (by: 1 | -1) => {
    const next = index + by
    if (next >= 0 && next <= lastIndex) goTo(next)
    else if (loop) goTo(next < 0 ? lastIndex : 0)
  }
  const onKey = (key: CarouselTrackKey) => {
    if (key === 'first') goTo(0)
    else if (key === 'last') goTo(lastIndex)
    else move(key === 'next' ? 1 : -1)
  }

  // Autoplay waits while the pointer is over the carousel, focus is in it or
  // a finger is on it. Users who ask for less motion get it paused; the play
  // button still starts it.
  const delay = autoplay === true ? 5000 : typeof autoplay === 'number' ? Math.max(0, autoplay) : 0
  const [playing, setPlaying] = useState(true)
  const choseRef = useRef(false)
  useEffect(() => {
    if (reducedMotion && !choseRef.current) setPlaying(false)
  }, [reducedMotion])
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const rotating = delay > 0 && lastIndex > 0 && playing && !hovered && !focused && !dragging

  const autoRef = useRef(false)
  const advanceRef = useRef(() => {})
  advanceRef.current = () => {
    autoRef.current = true
    setIndex(index >= lastIndex ? 0 : index + 1)
  }
  useEffect(() => {
    if (!rotating) return
    const timer = setTimeout(() => advanceRef.current(), delay)
    return () => clearTimeout(timer)
  }, [rotating, index, delay])

  const frameRef = useRef<HTMLElement | null>(null)
  const composedRef = useComposedRefs(ref, frameRef as never)
  useEffect(() => {
    const el = frameRef.current
    if (!isWeb || !el || delay <= 0) return
    const enter = () => setHovered(true)
    const leave = () => setHovered(false)
    const focusIn = () => setFocused(true)
    const focusOut = (event: FocusEvent) => {
      if (!el.contains(event.relatedTarget as Node | null)) setFocused(false)
    }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('focusin', focusIn)
    el.addEventListener('focusout', focusOut)
    return () => {
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('focusin', focusIn)
      el.removeEventListener('focusout', focusOut)
    }
  }, [delay])

  // Say where the user is after they move. Not when autoplay moves: the APG
  // turns the live region off while a carousel turns by itself.
  const [message, setMessage] = useState({ text: '', count: 0 })
  const announcedRef = useRef(index)
  const position = labels.position(index, count)
  useEffect(() => {
    if (announcedRef.current === index) return
    announcedRef.current = index
    const auto = autoRef.current
    autoRef.current = false
    if (auto) return
    if (isWeb) setMessage((current) => ({ text: position, count: current.count + 1 }))
    else AccessibilityInfo.announceForAccessibility(position)
  }, [index, position])

  const controlled = isWeb ? { 'aria-controls': trackId } : null
  const controls =
    lastIndex > 0 && (delay > 0 || showArrows || showDots) ? (
      <XStack alignItems="center" justifyContent="center" gap="$2" flexWrap="wrap">
        {delay > 0 ? (
          <IconButton
            size="sm"
            circular
            aria-label={playing ? labels.pause : labels.play}
            icon={playing ? <PauseIcon /> : <PlayIcon />}
            onPress={() => {
              choseRef.current = true
              setPlaying(!playing)
            }}
            {...controlled}
          />
        ) : null}
        {showArrows ? (
          <IconButton
            size="sm"
            circular
            variant="outline"
            aria-label={labels.previous}
            icon={<ChevronLeftIcon />}
            disabled={!loop && index === 0}
            onPress={() => move(-1)}
            {...controlled}
          />
        ) : null}
        {showDots ? (
          <XStack alignItems="center">
            {Array.from({ length: lastIndex + 1 }, (_, i) => (
              <Dot
                key={i}
                active={i === index}
                label={labels.goTo(i)}
                controls={trackId}
                onPress={() => goTo(i)}
              />
            ))}
          </XStack>
        ) : null}
        {showArrows ? (
          <IconButton
            size="sm"
            circular
            variant="outline"
            aria-label={labels.next}
            icon={<ChevronRightIcon />}
            disabled={!loop && index === lastIndex}
            onPress={() => move(1)}
            {...controlled}
          />
        ) : null}
      </XStack>
    ) : null

  return (
    <CarouselFrame
      ref={composedRef}
      {...(isWeb && { role: 'region', 'aria-roledescription': labels.carousel })}
      aria-label={label}
      {...props}
    >
      {controls}
      <CarouselTrack
        ref={trackRef}
        id={trackId}
        index={index}
        count={count}
        slidesPerView={slidesPerView}
        perView={perView}
        lastIndex={lastIndex}
        gap={gap}
        onSettle={onSettle}
        onDragChange={setDragging}
        onKey={onKey}
      >
        {slides.map((child, i) => (
          <SlideContext.Provider
            key={isValidElement(child) && child.key != null ? child.key : i}
            value={{ roleDescription: labels.slide, label: labels.slideName(i, count) }}
          >
            {isValidElement(child) && child.type === CarouselItem ? (
              child
            ) : (
              <CarouselItem>{child}</CarouselItem>
            )}
          </SlideContext.Provider>
        ))}
      </CarouselTrack>
      {isWeb ? (
        <View role="status" aria-live="polite" {...visuallyHidden}>
          {message.text ? <Text key={message.count}>{message.text}</Text> : null}
        </View>
      ) : null}
    </CarouselFrame>
  )
})

export const Carousel = withStaticProperties(CarouselRoot, { Item: CarouselItem })
