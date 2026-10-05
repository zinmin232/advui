import { IconDefaults } from '@advui/icons'
import { shadows } from '@advui/theme'
import { type ReactNode, forwardRef } from 'react'
import { type GetProps, type TamaguiElement, Text, View, isWeb, styled } from 'tamagui'
import { useRipple } from '../../hooks/useRipple'
import { ariaState } from '../../utils/ariaState'

export type FabVariant = 'soft' | 'primary' | 'secondary' | 'surface'
export type FabSize = 'sm' | 'md' | 'lg'
export type FabPlacement = 'bottom-end' | 'bottom-start' | 'bottom-center'

const foreground = {
  soft: '$primarySoftForeground',
  primary: '$primaryForeground',
  secondary: '$secondaryForeground',
  surface: '$primaryText',
} as const satisfies Record<FabVariant, `$${string}`>

// Resting fill per variant, kept while pressed when the Android ripple is on.
const background = {
  soft: '$primarySoft',
  primary: '$primary',
  secondary: '$secondary',
  surface: '$card',
} as const satisfies Record<FabVariant, `$${string}`>

const iconSizes: Record<FabSize, number> = { sm: 20, md: 24, lg: 36 }

const FabFrame = styled(View, {
  name: 'Fab',
  role: 'button',
  render: 'button',
  tabIndex: 0,

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$3',
  borderWidth: 0,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'quick',
  ...shadows.md,
  hoverStyle: { ...shadows.lg },
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 2,
  },

  variants: {
    variant: {
      soft: {
        backgroundColor: '$primarySoft',
        pressStyle: { backgroundColor: '$primarySoftHover' },
      },
      primary: {
        backgroundColor: '$primary',
        hoverStyle: { backgroundColor: '$primaryHover' },
        pressStyle: { backgroundColor: '$primaryPress' },
      },
      secondary: {
        backgroundColor: '$secondary',
        hoverStyle: { backgroundColor: '$secondaryHover' },
        pressStyle: { backgroundColor: '$secondaryPress' },
      },
      surface: {
        backgroundColor: '$card',
        hoverStyle: { backgroundColor: '$accent' },
        pressStyle: { backgroundColor: '$accentHover' },
      },
    },
    // Material sizes: 40, 56 and 96, with 12, 16 and 28px corners in the Material theme.
    size: {
      sm: { width: '$10', height: '$10', borderRadius: '$xl' },
      md: { width: '$14', height: '$14', borderRadius: '$2xl' },
      lg: { width: '$24', height: '$24', borderRadius: '$3xl' },
    },
    extended: {
      true: { width: 'auto', height: '$14', paddingHorizontal: '$4', borderRadius: '$2xl' },
    },
    placement: {
      'bottom-end': { position: 'absolute', bottom: '$4', right: '$4' },
      'bottom-start': { position: 'absolute', bottom: '$4', left: '$4' },
      'bottom-center': { position: 'absolute', bottom: '$4', alignSelf: 'center' },
    },
    disabled: {
      true: { opacity: 0.5, pointerEvents: 'none', cursor: 'default' },
    },
  } as const,

  defaultVariants: { variant: 'soft', size: 'md' },
})

type FrameProps = GetProps<typeof FabFrame>

export interface FabProps extends Omit<
  FrameProps,
  'variant' | 'size' | 'extended' | 'placement' | 'children'
> {
  /** The action's icon. */
  icon: ReactNode
  /**
   * Visible text, which makes it an extended FAB. Without it the FAB is
   * icon-only and needs an `aria-label`.
   */
  label?: string
  variant?: FabVariant
  /** Icon-only sizes. An extended FAB is always 56 high. */
  size?: FabSize
  /** Pin to a corner of the nearest positioned parent (e.g. the screen). */
  placement?: FabPlacement
  disabled?: boolean
}

/**
 * The primary action of a screen, such as Compose or New, floating above the
 * content. Use one per screen; add `label` when the icon alone is unclear.
 */
export const Fab = forwardRef<TamaguiElement, FabProps>(function Fab(
  {
    icon,
    label,
    variant = 'soft',
    size = 'md',
    placement,
    disabled = false,
    onPressIn,
    onPressOut,
    ...props
  },
  ref,
) {
  const color = foreground[variant]
  const extended = label !== undefined
  const ripple = useRipple({ color, disabled, onPressIn, onPressOut })
  return (
    <FabFrame
      ref={ref}
      variant={variant}
      size={size}
      extended={extended}
      placement={placement}
      disabled={disabled}
      aria-disabled={ariaState(disabled)}
      {...(isWeb ? { type: 'button' } : null)}
      {...(ripple.active && { pressStyle: { backgroundColor: background[variant] } })}
      {...props}
      {...ripple.props}
    >
      {ripple.element}
      <IconDefaults size={extended ? 24 : iconSizes[size]} color={color}>
        {icon}
        {extended ? (
          <Text
            fontFamily="$body"
            fontSize="$2"
            lineHeight="$2"
            fontWeight="500"
            color={color}
            userSelect="none"
          >
            {label}
          </Text>
        ) : null}
      </IconDefaults>
    </FabFrame>
  )
})
