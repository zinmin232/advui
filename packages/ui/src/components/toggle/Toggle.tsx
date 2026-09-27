import { IconDefaults } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import { type GetProps, type TamaguiElement, Text, View, isWeb, styled } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { type RippleOptions, useRipple } from '../../hooks/useRipple'
import { isTextContent } from '../../utils/isTextContent'

export type ToggleVariant = 'default' | 'outline'
export type ToggleSize = 'sm' | 'md' | 'lg'

// Shared with ToggleGroup items so both look and size the same.
export const ToggleFrame = styled(View, {
  name: 'Toggle',
  render: 'button',

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  gap: '$2',
  borderWidth: 1,
  borderColor: 'transparent',
  borderRadius: '$button',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'quick',
  hoverStyle: { backgroundColor: '$accent' },
  pressStyle: { backgroundColor: '$accentHover' },
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 2,
  },

  variants: {
    variant: {
      default: {},
      outline: { borderColor: '$input' },
    },
    size: {
      sm: { height: '$8', minWidth: '$8', paddingHorizontal: '$2', gap: '$1.5' },
      md: { height: '$10', minWidth: '$10', paddingHorizontal: '$2.5' },
      lg: { height: '$12', minWidth: '$12', paddingHorizontal: '$3' },
    },
    // A variant rather than activeStyle: Tamagui does not apply activeStyle on native.
    on: {
      true: {
        backgroundColor: '$primarySoft',
        hoverStyle: { backgroundColor: '$primarySoftHover' },
        pressStyle: { backgroundColor: '$primarySoftHover' },
      },
    },
    disabled: {
      true: { opacity: 0.5, pointerEvents: 'none', cursor: 'default' },
    },
  } as const,

  defaultVariants: { variant: 'default', size: 'md' },
})

export const ToggleText = styled(Text, {
  name: 'ToggleText',
  fontFamily: '$body',
  fontWeight: '500',
  userSelect: 'none',
  numberOfLines: 1,
  variants: {
    size: {
      sm: { fontSize: '$2', lineHeight: '$2' },
      md: { fontSize: '$2', lineHeight: '$2' },
      lg: { fontSize: '$3', lineHeight: '$3' },
    },
  } as const,
})

const iconSizes: Record<ToggleSize, number> = { sm: 14, md: 16, lg: 18 }
// Touch targets: extend the pressable area to ≥44pt on native without changing layout.
export const toggleHitSlop: Record<ToggleSize, number> = { sm: 6, md: 2, lg: 0 }

/** Label and icon inside a toggle, colored for its state. */
export function ToggleLabel({
  on,
  size,
  icon,
  children,
}: {
  on: boolean
  size: ToggleSize
  icon?: ReactNode
  children?: ReactNode
}) {
  const color = on ? '$primarySoftForeground' : '$foreground'
  return (
    <IconDefaults size={iconSizes[size]} color={color}>
      {icon}
      {isTextContent(children) ? (
        <ToggleText size={size} color={color}>
          {children}
        </ToggleText>
      ) : (
        children
      )}
    </IconDefaults>
  )
}

/** The Android ripple for toggles; the fill stays as it is while pressed. */
export function useToggleRipple(
  on: boolean,
  variant: ToggleVariant,
  options: Omit<RippleOptions, 'color'>,
) {
  const ripple = useRipple({ color: on ? '$primarySoftForeground' : '$foreground', ...options })
  const style = {
    pressStyle: { backgroundColor: on ? '$primarySoft' : 'transparent' },
    // The ripple is clipped inside the border, so drop the transparent one.
    ...(variant === 'default' && { borderWidth: 0 }),
  } as const
  return { ...ripple, style: ripple.active ? style : null }
}

type FrameProps = GetProps<typeof ToggleFrame>

export interface ToggleProps extends Omit<FrameProps, 'variant' | 'size' | 'on' | 'children'> {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: ToggleVariant
  size?: ToggleSize
  disabled?: boolean
  /** Icon before the label. Icon-only toggles need an `aria-label`. */
  icon?: ReactNode
  children?: ReactNode
}

/**
 * A button that stays on or off, such as Bold in a text toolbar or Mute.
 * Screen readers announce it as a toggle button with its pressed state.
 */
export const Toggle = forwardRef<TamaguiElement, ToggleProps>(function Toggle(
  {
    pressed: pressedProp,
    defaultPressed = false,
    onPressedChange,
    variant = 'default',
    size = 'md',
    disabled = false,
    icon,
    children,
    onPress,
    onPressIn,
    onPressOut,
    ...props
  },
  ref,
) {
  const [pressed, setPressed] = useControllableState({
    value: pressedProp,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  })
  const ripple = useToggleRipple(pressed, variant, { disabled, onPressIn, onPressOut })

  return (
    <ToggleFrame
      ref={ref}
      variant={variant}
      size={size}
      on={pressed}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...(isWeb
        ? { type: 'button', 'aria-pressed': pressed }
        : {
            // React Native has no aria-pressed; a toggle button reports "checked".
            accessible: true,
            accessibilityRole: 'togglebutton',
            accessibilityState: { checked: pressed, disabled },
            hitSlop: toggleHitSlop[size],
          })}
      onPress={(event) => {
        onPress?.(event)
        if (!disabled) setPressed(!pressed)
      }}
      {...ripple.style}
      {...props}
      {...ripple.props}
    >
      {ripple.element}
      <ToggleLabel on={pressed} size={size} icon={icon}>
        {children}
      </ToggleLabel>
    </ToggleFrame>
  )
})
