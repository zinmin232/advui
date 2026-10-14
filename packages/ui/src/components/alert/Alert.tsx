import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  IconDefaults,
  InfoIcon,
  XIcon,
} from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import {
  type ColorTokens,
  type GetProps,
  type TamaguiElement,
  View,
  createStyledContext,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { isTextContent } from '../../utils/isTextContent'
import { Text } from '../typography/Text'

export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'error' | 'destructive'
export type AlertSize = 'sm' | 'md' | 'lg'

type AlertColor = ColorTokens | undefined

// Title and description each get their own context so the alert can hand
// them a computed color. A `color` next to `variant` in one shared context
// would lose to the variant's color, since Tamagui applies props in order.
const AlertTitleContext = createStyledContext<{ size: AlertSize; color: AlertColor }>({
  size: 'md',
  color: undefined,
})
const AlertDescriptionContext = createStyledContext<{ size: AlertSize; color: AlertColor }>({
  size: 'md',
  color: undefined,
})

const accent = {
  default: '$foreground',
  info: '$infoSoftForeground',
  success: '$successSoftForeground',
  warning: '$warningSoftForeground',
  error: '$errorSoftForeground',
  destructive: '$destructiveForeground',
} as const satisfies Record<AlertVariant, `$${string}`>

const descriptionColor = {
  ...accent,
  default: '$mutedForeground',
} as const satisfies Record<AlertVariant, `$${string}`>

// The dismiss button sits on the alert's own surface, so it tints with the
// variant's border color rather than the neutral accent.
const dismissHover = {
  default: '$accent',
  info: '$infoBorder',
  success: '$successBorder',
  warning: '$warningBorder',
  error: '$errorBorder',
  destructive: '$destructiveHover',
} as const satisfies Record<AlertVariant, `$${string}`>

const dismissPress = {
  ...dismissHover,
  default: '$accentHover',
  destructive: '$destructivePress',
} as const satisfies Record<AlertVariant, `$${string}`>

const defaultIcons = {
  default: <InfoIcon />,
  info: <InfoIcon />,
  success: <CheckCircleIcon />,
  warning: <AlertTriangleIcon />,
  error: <AlertCircleIcon />,
  destructive: <AlertCircleIcon />,
} satisfies Record<AlertVariant, ReactNode>

// Offsets center the icon and the dismiss button on the title's first line.
const sizes = {
  sm: {
    icon: 14,
    iconOffset: '$1',
    textGap: '$0.5',
    sectionGap: '$2',
    dismiss: '$6',
    dismissOffset: '$-0.5',
  },
  md: {
    icon: 16,
    iconOffset: '$0.5',
    textGap: '$1',
    sectionGap: '$3',
    dismiss: '$6',
    dismissOffset: '$-0.5',
  },
  lg: {
    icon: 20,
    iconOffset: '$1',
    textGap: '$1.5',
    sectionGap: '$3',
    dismiss: '$7',
    dismissOffset: 0,
  },
} as const satisfies Record<AlertSize, object>

const AlertFrame = styled(View, {
  name: 'Alert',
  flexDirection: 'row',
  borderRadius: '$lg',
  borderWidth: 1,

  variants: {
    variant: {
      default: { backgroundColor: '$card', borderColor: '$border' },
      info: { backgroundColor: '$infoSoft', borderColor: '$infoBorder' },
      success: { backgroundColor: '$successSoft', borderColor: '$successBorder' },
      warning: { backgroundColor: '$warningSoft', borderColor: '$warningBorder' },
      error: { backgroundColor: '$errorSoft', borderColor: '$errorBorder' },
      destructive: { backgroundColor: '$destructive', borderColor: '$destructive' },
    },
    size: {
      sm: { padding: '$3', gap: '$2' },
      md: { padding: '$4', gap: '$3' },
      lg: { padding: '$5', gap: '$4' },
    },
  } as const,

  defaultVariants: { variant: 'default', size: 'md' },
})

// `size` follows the alert's; sm and lg match Text's own sm and lg.
const AlertTitle = styled(Text, {
  name: 'AlertTitle',
  context: AlertTitleContext,
  weight: 'semibold',
  variants: {
    size: {
      sm: { fontSize: '$2', lineHeight: '$2' },
      md: { fontSize: '$2', lineHeight: '$2' },
      lg: { fontSize: '$4', lineHeight: '$4' },
    },
  } as const,
})

const AlertDescription = styled(Text, {
  name: 'AlertDescription',
  context: AlertDescriptionContext,
  variants: {
    size: {
      sm: { fontSize: '$1', lineHeight: '$1' },
      md: { fontSize: '$2', lineHeight: '$2' },
      lg: { fontSize: '$3', lineHeight: '$3' },
    },
  } as const,
})

export interface AlertProps extends Omit<
  GetProps<typeof AlertFrame>,
  'variant' | 'size' | 'title' | 'color'
> {
  variant?: AlertVariant
  /** Padding, spacing, icon and text size. */
  size?: AlertSize
  /** Custom icon, or `null` to hide it. */
  icon?: ReactNode | null
  /** Shorthand for an `Alert.Title` before the children. */
  title?: ReactNode
  /** Shorthand for an `Alert.Description` before the children. */
  description?: ReactNode
  /** Buttons or links under the text. They wrap on narrow screens. */
  actions?: ReactNode
  /** Color of the title, description and icons, in place of the variant's. */
  color?: ColorTokens
  /** Show a button that hides the alert. */
  dismissible?: boolean
  /** Called once each time the dismiss button is pressed. */
  onDismiss?: () => void
  /** Accessible name of the dismiss button. */
  dismissLabel?: string
  /**
   * Whether a dismissible alert is shown. Omit it and the alert hides itself
   * when dismissed; pass it to decide in `onDismiss`.
   */
  open?: boolean
  children?: ReactNode
}

const AlertImpl = forwardRef<TamaguiElement, AlertProps>(function Alert(
  {
    variant = 'default',
    size = 'md',
    icon,
    title,
    description,
    actions,
    color,
    dismissible = false,
    onDismiss,
    dismissLabel = 'Dismiss',
    open: openProp,
    role: roleProp,
    children,
    ...props
  },
  ref,
) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: true,
    onChange: (next) => {
      if (!next) onDismiss?.()
    },
  })
  const accentColor = color ?? accent[variant]
  const dismissRipple = useRipple({ color: accentColor, disabled: !dismissible })
  if (!open) return null

  const resolvedIcon = icon === undefined ? defaultIcons[variant] : icon
  const metrics = sizes[size]
  // Warnings, errors and destructive alerts interrupt screen readers; the rest are polite.
  const role =
    roleProp ??
    (variant === 'error' || variant === 'warning' || variant === 'destructive' ? 'alert' : 'status')
  // Native: one announced element for the text. With buttons inside, the
  // frame cannot be that element, or the buttons could not be reached.
  const interactive = dismissible || actions != null
  const frameSemantics = isWeb ? { role } : interactive ? null : { role, accessible: true }
  const textSemantics = !isWeb && interactive ? { role, accessible: true } : null

  return (
    <AlertFrame ref={ref} variant={variant} size={size} {...frameSemantics} {...props}>
      {resolvedIcon ? (
        <View paddingTop={metrics.iconOffset}>
          <IconDefaults size={metrics.icon} color={accentColor}>
            {resolvedIcon}
          </IconDefaults>
        </View>
      ) : null}
      <View flex={1} minWidth={0} gap={metrics.sectionGap}>
        <AlertTitleContext.Provider size={size} color={accentColor}>
          <AlertDescriptionContext.Provider size={size} color={color ?? descriptionColor[variant]}>
            <View gap={metrics.textGap} {...textSemantics}>
              {title == null ? null : isTextContent(title) ? (
                <AlertTitle>{title}</AlertTitle>
              ) : (
                title
              )}
              {description == null ? null : isTextContent(description) ? (
                <AlertDescription>{description}</AlertDescription>
              ) : (
                description
              )}
              {children}
            </View>
          </AlertDescriptionContext.Provider>
        </AlertTitleContext.Provider>
        {actions == null ? null : (
          <View flexDirection="row" flexWrap="wrap" gap="$2">
            {actions}
          </View>
        )}
      </View>
      {dismissible ? (
        // A plain button, as in Toaster: IconButton's ghost hover is neutral,
        // which reads as a gray patch on a colored alert.
        <View
          render="button"
          role="button"
          aria-label={dismissLabel}
          width={metrics.dismiss}
          height={metrics.dismiss}
          marginTop={metrics.dismissOffset}
          alignItems="center"
          justifyContent="center"
          borderRadius="$sm"
          cursor="pointer"
          hoverStyle={{ backgroundColor: dismissHover[variant] }}
          pressStyle={dismissRipple.active ? undefined : { backgroundColor: dismissPress[variant] }}
          focusVisibleStyle={{ outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 2 }}
          {...(isWeb
            ? { type: 'button', padding: 0, borderWidth: 0, backgroundColor: 'transparent' }
            : { accessible: true, hitSlop: 10 })}
          onPress={(event) => {
            // Keep the press from reaching a pressable card or row around the alert.
            event.stopPropagation()
            setOpen(false)
          }}
          {...dismissRipple.props}
        >
          {dismissRipple.element}
          <XIcon size={size === 'lg' ? 16 : 14} color={accentColor} />
        </View>
      ) : null}
    </AlertFrame>
  )
})

/**
 * Inline, non-blocking message. Pass `title` and `description`, or compose
 * `Alert.Title` and `Alert.Description` as children.
 */
export const Alert = withStaticProperties(AlertImpl, {
  Title: AlertTitle,
  Description: AlertDescription,
})
