import { type ReactNode, forwardRef } from 'react'
import { type GetProps, type TamaguiElement, Text, View, isWeb, styled } from 'tamagui/unstyled'
import { VisuallyHidden } from '../visually-hidden/VisuallyHidden'

export type IndicatorTone = 'primary' | 'success' | 'warning' | 'error'
export type IndicatorPlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'

// Spans on web, so it fits inside buttons and links.
const IndicatorFrame = styled(View, {
  displayName: 'Indicator',
  render: 'span',
})

// Shrinks to the child, so the corners are the child's. The frame around it
// takes the parent's alignment, as the child would without an indicator.
const IndicatorBox = styled(View, {
  displayName: 'IndicatorBox',
  render: 'span',
  position: 'relative',
  alignSelf: 'flex-start',
})

// A point at the corner. The mark inside is absolute with no insets, so web
// and Yoga both center it on that point at its own size: plain layout, with
// no transform, and no width for the count to wrap in.
const IndicatorAnchor = styled(View, {
  displayName: 'IndicatorAnchor',
  render: 'span',
  position: 'absolute',
  width: 0,
  height: 0,
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
})

const IndicatorMark = styled(View, {
  displayName: 'IndicatorMark',
  render: 'span',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'full',
  // Cuts the mark out of an avatar or icon behind it.
  borderWidth: 2,
  borderColor: 'background',
  variants: {
    tone: {
      primary: { backgroundColor: 'primary' },
      success: { backgroundColor: 'success' },
      warning: { backgroundColor: 'warning' },
      error: { backgroundColor: 'error' },
    },
  } as const,
  defaultVariants: { tone: 'primary' },
})

const IndicatorCount = styled(Text, {
  displayName: 'IndicatorCount',
  fontFamily: 'body',
  fontSize: '1',
  lineHeight: '1',
  fontWeight: '600',
  ...(isWeb && { whiteSpace: 'nowrap' }),
  variants: {
    tone: {
      primary: { color: 'primaryForeground' },
      success: { color: 'successForeground' },
      warning: { color: 'warningForeground' },
      error: { color: 'errorForeground' },
    },
  } as const,
  defaultVariants: { tone: 'primary' },
})

// Outer sizes, ring included: dots show 8 or 10px of color, counts 16 or 20px.
const dotSizes = { sm: '3', md: '3-5' } as const
const countSizes = { sm: '5', md: '6' } as const
const countPadding = { sm: '1', md: '1-5' } as const

// A circle leaves its box's corners empty. Pin to where the circle crosses
// the box's diagonal instead, (1 - 1/√2) / 2 of the way in from each side.
const circleInset = `${((1 - Math.SQRT1_2) / 2) * 100}%` as const

export interface IndicatorProps extends Omit<GetProps<typeof IndicatorFrame>, 'children'> {
  /** What the indicator is pinned to: an avatar, an icon or a button. */
  children: ReactNode
  /** A number to show. Without it the indicator is a dot. */
  count?: number
  /** Counts above it show as `max+`. */
  max?: number
  /** Show a count of 0. By default a count of 0 hides the indicator. */
  showZero?: boolean
  /**
   * What screen readers read, such as "3 unread messages" or "Online". The
   * mark itself is hidden from them. Leave it out when the name of what it is
   * pinned to already says it, as on a button named "Notifications, 3 unread".
   */
  label?: string
  /** Shows the indicator. False hides it and keeps the children in place. */
  visible?: boolean
  tone?: IndicatorTone
  size?: 'sm' | 'md'
  /** The corner it is centered on. `end` is the right side, as on Fab. */
  placement?: IndicatorPlacement
  /** The shape of what it is pinned to. `circle` moves it in to the circle's edge. */
  overlap?: 'circle' | 'square'
}

/**
 * A dot or count pinned to the corner of an avatar, icon or button: unread
 * messages, someone's status, something new.
 *
 * @example
 * <Indicator tone="success" placement="bottom-end" overlap="circle" label="Online">
 *   <Avatar src={user.photoUrl} alt={user.name} />
 * </Indicator>
 */
export const Indicator = forwardRef<TamaguiElement, IndicatorProps>(function Indicator(
  {
    children,
    count,
    max = 99,
    showZero = false,
    label,
    visible = true,
    tone = 'primary',
    size = 'md',
    placement = 'top-end',
    overlap = 'square',
    ...props
  },
  ref,
) {
  const shown = visible && (count === undefined || count > 0 || showZero)
  const [vertical, horizontal] = placement.split('-') as ['top' | 'bottom', 'start' | 'end']
  const inset = overlap === 'circle' ? circleInset : 0
  return (
    <IndicatorFrame ref={ref} {...props}>
      <IndicatorBox>
        {children}
        {shown && label ? <VisuallyHidden>{label}</VisuallyHidden> : null}
        {shown ? (
          <IndicatorAnchor
            aria-hidden
            {...{ [vertical]: inset, [horizontal === 'end' ? 'right' : 'left']: inset }}
          >
            {count === undefined ? (
              <IndicatorMark tone={tone} width={dotSizes[size]} height={dotSizes[size]} />
            ) : (
              <IndicatorMark
                tone={tone}
                height={countSizes[size]}
                minWidth={countSizes[size]}
                paddingHorizontal={countPadding[size]}
              >
                <IndicatorCount tone={tone}>{count > max ? `${max}+` : count}</IndicatorCount>
              </IndicatorMark>
            )}
          </IndicatorAnchor>
        ) : null}
      </IndicatorBox>
    </IndicatorFrame>
  )
})
