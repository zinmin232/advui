import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  IconDefaults,
  InfoIcon,
} from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  createStyledContext,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { Text } from '../typography/Text'

export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'error'

const AlertContext = createStyledContext<{ variant: AlertVariant }>({ variant: 'default' })

const accent = {
  default: '$foreground',
  info: '$infoSoftForeground',
  success: '$successSoftForeground',
  warning: '$warningSoftForeground',
  error: '$errorSoftForeground',
} as const satisfies Record<AlertVariant, `$${string}`>

const defaultIcons = {
  default: <InfoIcon />,
  info: <InfoIcon />,
  success: <CheckCircleIcon />,
  warning: <AlertTriangleIcon />,
  error: <AlertCircleIcon />,
} satisfies Record<AlertVariant, ReactNode>

const AlertFrame = styled(View, {
  name: 'Alert',
  context: AlertContext,
  flexDirection: 'row',
  gap: '$3',
  padding: '$4',
  borderRadius: '$lg',
  borderWidth: 1,

  variants: {
    variant: {
      default: { backgroundColor: '$card', borderColor: '$border' },
      info: { backgroundColor: '$infoSoft', borderColor: '$infoBorder' },
      success: { backgroundColor: '$successSoft', borderColor: '$successBorder' },
      warning: { backgroundColor: '$warningSoft', borderColor: '$warningBorder' },
      error: { backgroundColor: '$errorSoft', borderColor: '$errorBorder' },
    },
  } as const,

  defaultVariants: { variant: 'default' },
})

const AlertTitle = styled(Text, {
  name: 'AlertTitle',
  context: AlertContext,
  size: 'sm',
  weight: 'semibold',
  variants: {
    variant: Object.fromEntries(Object.entries(accent).map(([key, color]) => [key, { color }])) as {
      [K in AlertVariant]: { color: (typeof accent)[K] }
    },
  } as const,
})

const AlertDescription = styled(Text, {
  name: 'AlertDescription',
  context: AlertContext,
  size: 'sm',
  variants: {
    variant: {
      default: { color: '$mutedForeground' },
      info: { color: '$infoSoftForeground' },
      success: { color: '$successSoftForeground' },
      warning: { color: '$warningSoftForeground' },
      error: { color: '$errorSoftForeground' },
    },
  } as const,
})

export interface AlertProps extends Omit<GetProps<typeof AlertFrame>, 'variant'> {
  variant?: AlertVariant
  /** Custom icon, or `null` to hide it. */
  icon?: ReactNode | null
  children?: ReactNode
}

const AlertImpl = forwardRef<TamaguiElement, AlertProps>(function Alert(
  { variant = 'default', icon, children, ...props },
  ref,
) {
  const resolvedIcon = icon === undefined ? defaultIcons[variant] : icon
  // Errors and warnings interrupt screen readers; other variants are polite status updates.
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status'
  return (
    <AlertFrame
      ref={ref}
      variant={variant}
      role={role}
      // Native: group title + description into one announced element.
      {...(isWeb ? null : { accessible: true })}
      {...props}
    >
      {resolvedIcon ? (
        <View paddingTop="$0.5">
          <IconDefaults size={16} color={accent[variant]}>
            {resolvedIcon}
          </IconDefaults>
        </View>
      ) : null}
      <View flex={1} gap="$1">
        {children}
      </View>
    </AlertFrame>
  )
})

/** Inline, non-blocking message. Compose with `Alert.Title` and `Alert.Description`. */
export const Alert = withStaticProperties(AlertImpl, {
  Title: AlertTitle,
  Description: AlertDescription,
})
