import { shadows } from '@advui/theme'
import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { AccessibilityInfo, useWindowDimensions } from 'react-native'
import {
  type TamaguiElement,
  type Token,
  View,
  getTokenValue,
  isWeb,
  useIsomorphicLayoutEffect,
} from 'tamagui/unstyled'
import { useBackToClose } from '../../hooks/useBackToClose'
import { useControllableState } from '../../hooks/useControllableState'
import { isTextContent } from '../../utils/isTextContent'
import { Button } from '../button/Button'
import { Portal } from '../portal/Portal'
import { Text } from '../typography/Text'

export interface TourStep {
  /** The element the step points at. Without one, the card is centered. */
  target?: RefObject<TamaguiElement | null>
  title: string
  description?: ReactNode
}

export interface TourLabels {
  next: string
  back: string
  done: string
  skip: string
  /** "Step 2 of 4". */
  progress: (step: number, count: number) => string
}

const defaultLabels: TourLabels = {
  next: 'Next',
  back: 'Back',
  done: 'Done',
  skip: 'Skip tour',
  progress: (step, count) => `Step ${step} of ${count}`,
}

export interface TourProps {
  steps: TourStep[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Index of the current step, from 0. */
  step?: number
  defaultStep?: number
  onStepChange?: (step: number) => void
  /** Called when Done is pressed on the last step, before the tour closes. */
  onComplete?: () => void
  labels?: Partial<TourLabels>
}

type Rect = { x: number; y: number; width: number; height: number }
// A step's target box and the window it was measured in.
type Frame = {
  target: RefObject<TamaguiElement | null> | undefined
  rect: Rect | null
  width: number
  height: number
}
type NativeNode = {
  measure: (
    done: (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void,
  ) => void
}
type KeyEvent = {
  key: string
  shiftKey: boolean
  preventDefault: () => void
  stopPropagation: () => void
}

// The target's box where the portal draws: the viewport on web, the root view
// on native. Android's measureInWindow starts below the status bar, which an
// edge-to-edge app draws under, so the ring would sit a status bar too high.
function measure(node: TamaguiElement, done: (rect: Rect) => void) {
  if (isWeb) {
    const box = (node as HTMLElement).getBoundingClientRect()
    done({ x: box.left, y: box.top, width: box.width, height: box.height })
  } else {
    ;(node as unknown as NativeNode).measure((_x, _y, width, height, pageX, pageY) =>
      done({ x: pageX, y: pageY, width, height }),
    )
  }
}

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (!!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height)

const sameFrame = (a: Frame | null, b: Frame) =>
  !!a &&
  a.target === b.target &&
  a.width === b.width &&
  a.height === b.height &&
  sameRect(a.rect, b.rect)

const px = (token: string, group: 'space' | 'size') =>
  getTokenValue(token as Token, group) as number

const focusable = 'button:not([disabled]), [href], input, select, textarea, [tabindex="0"]'

/**
 * A guided walk through a screen: each step highlights an element and shows
 * a card beside it with Back, Next and Skip. Steps point at elements with refs.
 */
export function Tour({
  steps,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  onComplete,
  labels: labelsProp,
}: TourProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [stepState, setStep] = useControllableState({
    value: stepProp,
    defaultValue: defaultStep,
    onChange: onStepChange,
  })
  const index = Math.min(Math.max(stepState, 0), Math.max(steps.length - 1, 0))
  const current = steps[index]
  const last = index === steps.length - 1
  const close = () => {
    setOpen(false)
    // An uncontrolled tour starts again from the first step.
    if (stepProp === undefined) setStep(defaultStep)
  }
  // Android: back closes the tour; while open, screen readers skip the app.
  useBackToClose(open, close)

  // Native: the window's size. Web reads the browser's below, after render.
  const windowSize = useWindowDimensions()
  const target = current?.target
  const [frame, setFrame] = useState<Frame | null>(null)
  // Measured before paint, so the card never shows at the last step's place.
  useIsomorphicLayoutEffect(() => {
    if (!open) return
    const node = target?.current ?? null
    let active = true
    const update = () => {
      const width = isWeb ? window.innerWidth : windowSize.width
      const height = isWeb ? window.innerHeight : windowSize.height
      const done = (rect: Rect | null) => {
        const next = { target, rect, width, height }
        if (active) setFrame((prev) => (sameFrame(prev, next) ? prev : next))
      }
      if (node) measure(node, done)
      else done(null)
    }
    if (isWeb && node)
      (node as HTMLElement).scrollIntoView?.({ block: 'center', inline: 'nearest' })
    update()
    if (!isWeb)
      return () => {
        active = false
      }
    // Capture: scrolling inside a ScrollArea moves the target too.
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      active = false
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, target, windowSize.width, windowSize.height])

  const cardRef = useRef<TamaguiElement>(null)
  // Web: focus goes back to where it was when the tour closes.
  useEffect(() => {
    if (!open || !isWeb) return
    const before = document.activeElement as HTMLElement | null
    return () => {
      if (before?.isConnected) before.focus()
    }
  }, [open])
  // The card waits until its step is measured; a frame for another step is stale.
  const shown = open && !!current && !!frame && frame.target === target
  // Each step moves focus to the card on web. Native focuses the step's
  // heading as it mounts: the native portal mounts it after this effect.
  useEffect(() => {
    if (shown && isWeb) (cardRef.current as HTMLElement | null)?.focus({ preventScroll: true })
  }, [shown, index])
  const focusHeading = useCallback((node: TamaguiElement | null) => {
    if (node && !isWeb) AccessibilityInfo.sendAccessibilityEvent(node as never, 'focus')
  }, [])

  const titleId = useId()
  const progressId = useId()
  const descriptionId = useId()
  if (!shown || !current || !frame) return null
  const viewport = frame
  const rect = frame.rect

  const gap = px('3', 'space')
  const margin = px('4', 'space')
  const pad = px('1', 'space')
  const cardWidth = Math.min(px('80', 'size'), viewport.width - margin * 2)
  const hole = rect && {
    top: rect.y - pad,
    left: rect.x - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  }
  // Below the target in the top half of the screen, above it in the bottom half.
  const placement = hole && {
    left: Math.min(
      Math.max(hole.left + hole.width / 2 - cardWidth / 2, margin),
      viewport.width - cardWidth - margin,
    ),
    ...(hole.top + hole.height / 2 < viewport.height / 2
      ? { top: hole.top + hole.height + gap }
      : { bottom: viewport.height - hole.top + gap }),
  }
  const scrim = { position: 'absolute', backgroundColor: 'overlay' } as const
  const decorative = isWeb ? { 'aria-hidden': true } : { accessible: false }

  const onKeyDown = (event: KeyEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      close()
      return
    }
    // A modal card: Tab goes round its buttons, not out to the page.
    if (event.key !== 'Tab') return
    const card = cardRef.current as HTMLElement
    const items = [...card.querySelectorAll<HTMLElement>(focusable)]
    const active = document.activeElement
    if (event.shiftKey && (active === items[0] || active === card)) {
      event.preventDefault()
      items[items.length - 1]?.focus()
    } else if (!event.shiftKey && active === items[items.length - 1]) {
      event.preventDefault()
      items[0]?.focus()
    }
  }

  const card = (
    <View
      ref={cardRef}
      // Native: no role or name on a frame around buttons, or TalkBack makes
      // it one stop that catches their touches. Focus goes to its heading.
      {...(isWeb && {
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': titleId,
        'aria-describedby': current.description ? `${progressId} ${descriptionId}` : progressId,
        tabIndex: -1,
        onKeyDown,
      })}
      width={cardWidth}
      backgroundColor="popover"
      borderColor="border"
      borderWidth={1}
      borderRadius="dialog"
      padding="4"
      gap="3"
      outlineStyle="none"
      {...shadows.lg}
      {...(placement && { position: 'absolute', ...placement })}
    >
      <View gap="1">
        {/* Native reads the step and the title as one stop. */}
        <View
          // A new view for each step, so the ref focuses each one.
          key={index}
          ref={focusHeading}
          gap="1"
          {...(!isWeb && { accessible: true, role: 'heading' })}
        >
          <Text id={progressId} size="xs" tone="muted">
            {labels.progress(index + 1, steps.length)}
          </Text>
          <Text
            id={titleId}
            size="base"
            weight="semibold"
            {...(isWeb && { role: 'heading', 'aria-level': 2 })}
          >
            {current.title}
          </Text>
        </View>
        {current.description == null ? null : isTextContent(current.description) ? (
          <Text id={descriptionId} size="sm" tone="muted">
            {current.description}
          </Text>
        ) : (
          <View id={descriptionId}>{current.description}</View>
        )}
      </View>
      <View flexDirection="row" alignItems="center" gap="2">
        {last ? null : (
          <Button variant="ghost" size="sm" onPress={close}>
            {labels.skip}
          </Button>
        )}
        <View flexDirection="row" gap="2" marginLeft="auto">
          {index > 0 ? (
            <Button variant="outline" size="sm" onPress={() => setStep(index - 1)}>
              {labels.back}
            </Button>
          ) : null}
          <Button
            size="sm"
            onPress={() => {
              if (!last) return setStep(index + 1)
              onComplete?.()
              close()
            }}
          >
            {last ? labels.done : labels.next}
          </Button>
        </View>
      </View>
    </View>
  )

  return (
    <Portal zIndex="modal">
      {/* The scrim takes every touch outside the card, except on the target. */}
      {hole ? (
        <View position="absolute" inset={0} {...decorative}>
          <View {...scrim} top={0} left={0} right={0} height={Math.max(hole.top, 0)} />
          <View {...scrim} top={hole.top + hole.height} left={0} right={0} bottom={0} />
          <View
            {...scrim}
            top={hole.top}
            left={0}
            width={Math.max(hole.left, 0)}
            height={hole.height}
          />
          <View
            {...scrim}
            top={hole.top}
            left={hole.left + hole.width}
            right={0}
            height={hole.height}
          />
          <View
            position="absolute"
            top={hole.top}
            left={hole.left}
            width={hole.width}
            height={hole.height}
            borderRadius="md"
            borderWidth={2}
            borderColor="ring"
            pointerEvents="none"
          />
        </View>
      ) : (
        <View {...scrim} inset={0} {...decorative} />
      )}
      {placement ? (
        card
      ) : (
        <View
          position="absolute"
          inset={0}
          alignItems="center"
          justifyContent="center"
          pointerEvents="box-none"
        >
          {card}
        </View>
      )}
    </Portal>
  )
}
