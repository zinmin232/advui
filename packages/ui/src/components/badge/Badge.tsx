import { IconDefaults } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  Text,
  View,
  createStyledContext,
  styled,
  withStaticProperties,
} from 'tamagui'
import { isTextContent } from '../../utils/isTextContent'

export type BadgeVariant =
  'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info'

const BadgeContext = createStyledContext<{ variant: BadgeVariant; size: 'sm' | 'md' }>({
  variant: 'default',
  size: 'md',
})

const foreground = {
  default: '$primaryForeground',
  secondary: '$secondaryForeground',
  outline: '$foreground',
  destructive: '$destructiveForeground',
  success: '$successSoftForeground',
  warning: '$warningSoftForeground',
  info: '$infoSoftForeground',
} as const satisfies Record<BadgeVariant, `$${string}`>

export const BadgeFrame = styled(View, {
  name: 'Badge',
  context: BadgeContext,
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: '$1',
  borderWidth: 1,
  borderColor: 'transparent',
  borderRadius: '$full',

  variants: {
    variant: {
      default: { backgroundColor: '$primary' },
      secondary: { backgroundColor: '$secondary' },
      outline: { backgroundColor: 'transparent', borderColor: '$border' },
      destructive: { backgroundColor: '$destructive' },
      success: { backgroundColor: '$successSoft', borderColor: '$successBorder' },
      warning: { backgroundColor: '$warningSoft', borderColor: '$warningBorder' },
      info: { backgroundColor: '$infoSoft', borderColor: '$infoBorder' },
    },
    size: {
      sm: { paddingHorizontal: '$1.5', paddingVertical: 0 },
      md: { paddingHorizontal: '$2.5', paddingVertical: '$0.5' },
    },
  } as const,

  defaultVariants: { variant: 'default', size: 'md' },
})

export const BadgeText = styled(Text, {
  name: 'BadgeText',
  context: BadgeContext,
  fontFamily: '$body',
  fontWeight: '500',
  numberOfLines: 1,

  variants: {
    variant: Object.fromEntries(
      Object.entries(foreground).map(([key, color]) => [key, { color }]),
    ) as { [K in BadgeVariant]: { color: (typeof foreground)[K] } },
    size: {
      sm: { fontSize: '$1', lineHeight: '$1' },
      md: { fontSize: '$1', lineHeight: '$1' },
    },
  } as const,
})

export interface BadgeProps extends Omit<GetProps<typeof BadgeFrame>, 'variant' | 'size'> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  /** Leading icon element. */
  icon?: ReactNode
  children?: ReactNode
}

const BadgeImpl = forwardRef<TamaguiElement, BadgeProps>(function Badge(
  { variant = 'default', size = 'md', icon, children, ...props },
  ref,
) {
  return (
    <BadgeFrame ref={ref} variant={variant} size={size} {...props}>
      <IconDefaults size={12} color={foreground[variant]}>
        {icon}
        {isTextContent(children) ? <BadgeText>{children}</BadgeText> : children}
      </IconDefaults>
    </BadgeFrame>
  )
})

/** Small status label. Purely presentational — it has no interactive role. */
export const Badge = withStaticProperties(BadgeImpl, { Text: BadgeText })
