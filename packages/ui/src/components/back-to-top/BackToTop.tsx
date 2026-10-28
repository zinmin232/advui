import { ChevronUpIcon } from '@advui/icons'
import {
  type ReactNode,
  type RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { type TamaguiElement, isWeb } from 'tamagui/unstyled'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Fab, type FabProps } from '../fab/Fab'

// A React Native scroll event, or a DOM one from a ScrollArea on web.
type ScrollEvent = { nativeEvent?: unknown; currentTarget?: unknown }
type NativeScroll = { contentOffset?: { y: number } }

type NativeScrollView = { scrollTo: (options: { y: number; animated: boolean }) => void }

export interface BackToTopScroll {
  /** Spread on the ScrollArea (or React Native ScrollView) to watch. */
  scrollProps: {
    ref: RefObject<TamaguiElement | null>
    onScroll: (event: ScrollEvent) => void
    scrollEventThrottle: number
  }
  /** Scrolled further than the threshold. */
  visible: boolean
  scrollToTop: () => void
}

/**
 * Watches a ScrollArea for Back to Top: spread `scrollProps` on it and pass
 * the result as `scroll`. iOS and Android need it, as the screen itself does
 * not scroll there.
 */
export function useBackToTop({ threshold = 400 }: { threshold?: number } = {}): BackToTopScroll {
  const ref = useRef<TamaguiElement>(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()
  const onScroll = useCallback(
    (event: ScrollEvent) => {
      const y =
        (event.nativeEvent as NativeScroll | undefined)?.contentOffset?.y ??
        (event.currentTarget as HTMLElement).scrollTop
      setVisible(y > threshold)
    },
    [threshold],
  )
  // Web: the area may be scrolled already, before the page hydrated or by
  // the browser restoring its place, with no scroll event to come.
  useEffect(() => {
    const node = ref.current as HTMLElement | null
    if (isWeb && node) setVisible(node.scrollTop > threshold)
  }, [threshold])
  const scrollToTop = useCallback(() => {
    const node = ref.current
    if (!node) return
    if (isWeb) {
      const element = node as HTMLElement
      element.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
      // The button hides at the top: keyboard users go on from the start of
      // the area (a ScrollArea takes focus), not from the end of the page.
      element.focus({ preventScroll: true })
    } else {
      ;(node as unknown as NativeScrollView).scrollTo({ y: 0, animated: !reducedMotion })
    }
  }, [reducedMotion])
  return { scrollProps: { ref, onScroll, scrollEventThrottle: 16 }, visible, scrollToTop }
}

// Web only: the page's own scroll, when no `scroll` is given.
function usePageScroll(threshold: number, enabled: boolean) {
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (!isWeb || !enabled) return
    const update = () => setVisible(window.scrollY > threshold)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [threshold, enabled])
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
    // Focus the page, so the next Tab goes to the first link rather than on
    // from where the button was. The body takes focus only with a tabindex.
    const body = document.body
    body.setAttribute('tabindex', '-1')
    body.focus({ preventScroll: true })
    body.addEventListener('blur', () => body.removeAttribute('tabindex'), { once: true })
  }, [reducedMotion])
  return { visible, scrollToTop }
}

export interface BackToTopProps extends Omit<FabProps, 'icon' | 'label' | 'onPress'> {
  /** A ScrollArea to watch, from `useBackToTop`. Without it, the page on web. */
  scroll?: BackToTopScroll
  /** Pixels scrolled before the button shows, when watching the page. */
  threshold?: number
  /** Accessible name. */
  label?: string
  icon?: ReactNode
}

/**
 * A floating button that appears once the page or a ScrollArea is scrolled
 * down, and scrolls it back to the top.
 */
export const BackToTop = forwardRef<TamaguiElement, BackToTopProps>(function BackToTop(
  {
    scroll,
    threshold = 400,
    label = 'Back to top',
    icon,
    variant = 'surface',
    size = 'sm',
    placement = 'bottom-end',
    ...props
  },
  ref,
) {
  const page = usePageScroll(threshold, !scroll)
  const { visible, scrollToTop } = scroll ?? page
  if (!visible) return null
  return (
    <Fab
      ref={ref}
      icon={icon ?? <ChevronUpIcon />}
      aria-label={label}
      variant={variant}
      size={size}
      placement={placement}
      // On the page, it stays in the corner of the window as it scrolls.
      {...(!scroll && { position: 'fixed', zIndex: 'sticky' })}
      onPress={scrollToTop}
      {...props}
    />
  )
})
