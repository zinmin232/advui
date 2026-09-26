import { IconDefaults } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  Text,
  View,
  createStyledContext,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { Spinner } from '../spinner'
import { isTextContent } from '../../utils/isTextContent'

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export const ButtonContext = createStyledContext<{ variant: ButtonVariant; size: ButtonSize }>({
  variant: 'default',
  size: 'md',
})

/** Label color per variant — shared by text, icons and the loading spinner. */
export const buttonForeground = {
  default: '$primaryForeground',
  secondary: '$secondaryForeground',
  outline: '$foreground',
  ghost: '$foreground',
  destructive: '$destructiveForeground',
  link: '$primaryText',
} as const satisfies Record<ButtonVariant, `${string}`>

const iconSizes: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18, icon: 16 }

export const ButtonFrame = styled(View, {
  name: 'Button',
  context: ButtonContext,
  role: 'button',
  render: 'button',
  tabIndex: 0,

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  gap: '$2',
  borderWidth: 1,
  borderColor: 'transparent',
  borderRadius: '$md',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'quick',
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 2,
  },

  variants: {
    variant: {
      default: {
        backgroundColor: '$primary',
        hoverStyle: { backgroundColor: '$primaryHover' },
        pressStyle: { backgroundColor: '$primaryPress' },
      },
      secondary: {
        backgroundColor: '$secondary',
        hoverStyle: { backgroundColor: '$secondaryHover' },
        pressStyle: { backgroundColor: '$secondaryPress' },
      },
      outline: {
        backgroundColor: '$background',
        borderColor: '$input',
        hoverStyle: { backgroundColor: '$accent', borderColor: '$borderStrong' },
        pressStyle: { backgroundColor: '$accentHover' },
      },
      ghost: {
        backgroundColor: 'transparent',
        hoverStyle: { backgroundColor: '$accent' },
        pressStyle: { backgroundColor: '$accentHover' },
      },
      destructive: {
        backgroundColor: '$destructive',
        hoverStyle: { backgroundColor: '$destructiveHover' },
        pressStyle: { backgroundColor: '$destructivePress' },
      },
      link: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        height: 'auto',
        hoverStyle: { opacity: 0.8 },
        pressStyle: { opacity: 0.7 },
      },
    },

    size: {
      sm: { height: '$8', paddingHorizontal: '$3', gap: '$1.5' },
      md: { height: '$10', paddingHorizontal: '$4' },
      lg: { height: '$12', paddingHorizontal: '$6', borderRadius: '$lg' },
      icon: { height: '$10', width: '$10', paddingHorizontal: 0 },
    },

    fullWidth: {
      true: { width: '100%', alignSelf: 'stretch' },
    },

    disabled: {
      true: { opacity: 0.5, pointerEvents: 'none', cursor: 'default' },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export const ButtonText = styled(Text, {
  name: 'ButtonText',
  context: ButtonContext,
  fontFamily: '$body',
  fontWeight: '500',
  userSelect: 'none',
  flexShrink: 1,
  numberOfLines: 1,

  variants: {
    variant: {
      default: { color: buttonForeground.default },
      secondary: { color: buttonForeground.secondary },
      outline: { color: buttonForeground.outline },
      ghost: { color: buttonForeground.ghost },
      destructive: { color: buttonForeground.destructive },
      link: { color: buttonForeground.link, textDecorationLine: 'underline' },
    },
    size: {
      sm: { fontSize: '$2', lineHeight: '$2' },
      md: { fontSize: '$2', lineHeight: '$2' },
      lg: { fontSize: '$3', lineHeight: '$3' },
      icon: { fontSize: '$2', lineHeight: '$2' },
    },
  } as const,
})

type FrameProps = GetProps<typeof ButtonFrame>

export interface ButtonProps extends Omit<FrameProps, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows a spinner, sets `aria-busy` and blocks presses while keeping the label for layout. */
  loading?: boolean
  /** Icon element rendered before the label. */
  icon?: ReactNode
  /** Icon element rendered after the label. */
  iconAfter?: ReactNode
  children?: ReactNode
}

// Touch targets: extend the pressable area to ≥44pt on native without changing layout.
const nativeHitSlop: Record<ButtonSize, number> = { sm: 6, md: 2, lg: 0, icon: 2 }

const ButtonImpl = forwardRef<TamaguiElement, ButtonProps>(function Button(
  {
    variant = 'default',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconAfter,
    children,
    ...props
  },
  ref,
) {
  const inactive = disabled || loading
  const foreground = buttonForeground[variant]
  const content = isTextContent(children) ? <ButtonText>{children}</ButtonText> : children

  return (
    <ButtonFrame
      ref={ref}
      variant={variant}
      size={size}
      disabled={inactive}
      aria-disabled={inactive || undefined}
      aria-busy={loading || undefined}
      hitSlop={isWeb ? undefined : nativeHitSlop[size]}
      {...(isWeb ? { type: 'button' } : null)}
      {...props}
    >
      <IconDefaults size={iconSizes[size]} color={foreground}>
        {loading ? <Spinner size="sm" color={foreground} label="Loading" /> : icon}
        {content}
        {iconAfter}
      </IconDefaults>
    </ButtonFrame>
  )
})

/**
 * Triggers an action. Renders a native `<button>` on web and a pressable
 * with the `button` role on iOS/Android.
 *
 * @example
 * <Button variant="outline" icon={<PlusIcon />}>New project</Button>
 */
export const Button = withStaticProperties(ButtonImpl, {
  Text: ButtonText,
  Frame: ButtonFrame,
})
