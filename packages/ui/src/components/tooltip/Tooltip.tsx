import { composeEventHandlers } from '@advui/utils'
import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  cloneElement,
  useId,
} from 'react'
import { Text, Tooltip as TamaguiTooltip, type TooltipProps as TamaguiTooltipProps } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export interface TooltipProps extends Omit<
  TamaguiTooltipProps,
  'children' | 'open' | 'onOpenChange'
> {
  /** Short supplementary text. Never put essential information only in a tooltip. */
  content: ReactNode
  /** A single focusable element (Button, IconButton, link…). */
  children: ReactElement<TriggerProps>
  /** Delay before showing on hover, in ms. Default 300. */
  delay?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

type TriggerProps = {
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  'aria-describedby'?: string
}

function isFocusVisible(target: EventTarget | null) {
  try {
    return (target as Element | null)?.matches?.(':focus-visible') ?? true
  } catch {
    return true
  }
}

/**
 * Hint shown on hover and on keyboard focus (web), dismissed with Escape.
 * Touch devices have no hover, so on iOS/Android only the trigger renders —
 * make sure it already has an accessible name (e.g. IconButton's `aria-label`).
 */
export function Tooltip({
  content,
  children,
  delay = 300,
  side = 'top',
  disabled,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: TooltipProps) {
  const reducedMotion = useReducedMotion()
  const id = useId()
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  if (disabled || content == null) return children

  // Tamagui's tooltip handles hover; keyboard focus + Escape are wired here so
  // keyboard users get the same hint (WCAG 1.4.13 / 2.1.1).
  const trigger = cloneElement(children, {
    'aria-describedby': open ? id : children.props['aria-describedby'],
    onFocus: composeEventHandlers(children.props.onFocus, (event: FocusEvent) => {
      if (isFocusVisible(event.target)) setOpen(true)
    }),
    onBlur: composeEventHandlers(children.props.onBlur, () => setOpen(false)),
    onKeyDown: composeEventHandlers(children.props.onKeyDown, (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }),
  })

  return (
    <TamaguiTooltip
      placement={side}
      delay={delay}
      restMs={delay}
      offset={6}
      open={open}
      onOpenChange={setOpen}
      {...props}
    >
      <TamaguiTooltip.Trigger asChild>{trigger}</TamaguiTooltip.Trigger>
      <TamaguiTooltip.Content
        id={id}
        zIndex="$tooltip"
        backgroundColor="$foreground"
        borderRadius="$md"
        paddingHorizontal="$2.5"
        paddingVertical="$1.5"
        maxWidth="$72"
        pointerEvents="none"
        enterStyle={{ opacity: 0, scale: 0.96, y: side === 'bottom' ? -4 : 4 }}
        exitStyle={{ opacity: 0, scale: 0.96 }}
        opacity={1}
        scale={1}
        y={0}
        transition={reducedMotion ? null : 'quicker'}
        animateOnly={['transform', 'opacity']}
      >
        {typeof content === 'string' ? (
          <Text fontSize="$1" lineHeight="$1" color="$background">
            {content}
          </Text>
        ) : (
          content
        )}
      </TamaguiTooltip.Content>
    </TamaguiTooltip>
  )
}
