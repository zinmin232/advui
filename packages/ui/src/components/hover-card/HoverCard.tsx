import { shadows, zIndex } from '@advui/theme'
import { composeEventHandlers } from '@advui/utils'
import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactElement,
  cloneElement,
  createContext,
  forwardRef,
  useContext,
} from 'react'
import {
  type GetProps,
  type TamaguiElement,
  Tooltip as TamaguiTooltip,
  type TooltipProps as TamaguiTooltipProps,
  withStaticProperties,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { HoverCardProps, HoverCardTriggerProps } from './types'

// Web: built on Tamagui's tooltip rather than its popover, because the trigger
// is a link — a popover would announce it as a button that expands a dialog.
// The card opens on hover (after `openDelay`) and on keyboard focus, stays open
// while the pointer moves into it, never takes focus, and closes with Escape.
// iOS / Android: see HoverCard.native.tsx (no hover on touch).

const OpenContext = createContext<(open: boolean) => void>(() => {})

function HoverCardRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
  side = 'bottom',
  align = 'center',
}: HoverCardProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const placement = (
    align === 'center' ? side : `${side}-${align}`
  ) as TamaguiTooltipProps['placement']
  return (
    <OpenContext.Provider value={setOpen}>
      <TamaguiTooltip
        open={open}
        onOpenChange={(next) => setOpen(next)}
        delay={{ open: openDelay, close: closeDelay }}
        placement={placement}
        offset={8}
        zIndex={zIndex.popover}
      >
        {children}
      </TamaguiTooltip>
    </OpenContext.Provider>
  )
}

type TriggerChildProps = {
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
}

function isFocusVisible(target: EventTarget | null) {
  try {
    return (target as Element | null)?.matches?.(':focus-visible') ?? true
  } catch {
    return true
  }
}

function HoverCardTrigger({ children }: HoverCardTriggerProps) {
  const setOpen = useContext(OpenContext)
  const child = children as ReactElement<TriggerChildProps>
  // Keyboard users get the card on focus too (WCAG 2.1.1 / 1.4.13).
  const trigger = cloneElement(child, {
    onFocus: composeEventHandlers(child.props.onFocus, (event: FocusEvent) => {
      if (isFocusVisible(event.target)) setOpen(true)
    }),
    onBlur: composeEventHandlers(child.props.onBlur, () => setOpen(false)),
    onKeyDown: composeEventHandlers(child.props.onKeyDown, (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }),
  })
  return (
    // The trigger stays a plain link: no expanded state to announce.
    <TamaguiTooltip.Trigger asChild aria-expanded={undefined}>
      {trigger}
    </TamaguiTooltip.Trigger>
  )
}

export type HoverCardContentProps = GetProps<typeof TamaguiTooltip.Content>

const HoverCardContent = forwardRef<TamaguiElement, HoverCardContentProps>(
  function HoverCardContent({ children, ...props }, ref) {
    const reducedMotion = useReducedMotion()
    return (
      <TamaguiTooltip.Content
        ref={ref as never}
        // Unstyled also keeps pointer events on, so the pointer can move into
        // the card to select text or follow a link inside it.
        unstyled
        backgroundColor="$popover"
        borderWidth={1}
        borderColor="$border"
        borderRadius="$lg"
        padding="$4"
        gap="$3"
        width="$72"
        maxWidth="100%"
        {...shadows.md}
        enterStyle={{ opacity: 0, scale: 0.96, y: -4 }}
        exitStyle={{ opacity: 0, scale: 0.96, y: -4 }}
        opacity={1}
        scale={1}
        y={0}
        transition={reducedMotion ? null : 'quick'}
        animateOnly={['transform', 'opacity']}
        {...props}
      >
        {children}
      </TamaguiTooltip.Content>
    )
  },
)

/**
 * A preview card that appears when a pointer rests on a link — a profile, a
 * page summary. The content is extra: everything in it must also be reachable
 * by following the link, since touch screens have no hover.
 */
export const HoverCard = withStaticProperties(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
})

export type { HoverCardProps, HoverCardTriggerProps } from './types'
