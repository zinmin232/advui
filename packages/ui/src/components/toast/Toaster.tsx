import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  IconDefaults,
  InfoIcon,
  XIcon,
} from '@advui/icons'
import { shadows, zIndex } from '@advui/theme'
import {
  Toast,
  type ToastT,
  type ToasterProps as TamaguiToasterProps,
  toast,
} from '@tamagui/toast/v2'
import type { ReactNode } from 'react'
import { View } from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Spinner } from '../spinner'
import { Text } from '../typography/Text'

type ToastType = NonNullable<ToastT['type']>

const typeIcon: Partial<Record<ToastType, ReactNode>> = {
  success: <CheckCircleIcon />,
  error: <AlertCircleIcon />,
  warning: <AlertTriangleIcon />,
  info: <InfoIcon />,
  loading: <Spinner size="sm" />,
}

const typeColor: Record<ToastType, `$${string}`> = {
  default: '$foreground',
  success: '$success',
  error: '$error',
  warning: '$warningSoftForeground',
  info: '$info',
  loading: '$mutedForeground',
}

export type ToasterProps = Pick<
  TamaguiToasterProps,
  'position' | 'duration' | 'visibleToasts' | 'expand' | 'closeButton' | 'swipeDirection' | 'offset'
>

function ToastContent({ item, onClose }: { item: ToastT; onClose: () => void }) {
  const type = item.type ?? 'default'
  const title = typeof item.title === 'function' ? item.title() : item.title
  const description = typeof item.description === 'function' ? item.description() : item.description
  const icon = item.icon ?? typeIcon[type]

  return (
    <View flexDirection="row" alignItems="flex-start" gap="$3">
      {icon ? (
        <View paddingTop="$0.5">
          <IconDefaults size={18} color={typeColor[type]}>
            {icon}
          </IconDefaults>
        </View>
      ) : null}
      <View flex={1} gap="$1">
        {title ? (
          <Text size="sm" weight="semibold">
            {title}
          </Text>
        ) : null}
        {description ? (
          <Text size="sm" tone="muted">
            {description}
          </Text>
        ) : null}
        {item.action ? (
          <View flexDirection="row" marginTop="$2">
            <Toast.Action
              backgroundColor="$primary"
              borderRadius="$md"
              paddingHorizontal="$3"
              height="$8"
              justifyContent="center"
              cursor="pointer"
              hoverStyle={{ backgroundColor: '$primaryHover' }}
              onPress={(event) => {
                item.action?.onClick?.(event as never)
                onClose()
              }}
            >
              <Text size="sm" weight="medium" color="$primaryForeground">
                {item.action.label}
              </Text>
            </Toast.Action>
          </View>
        ) : null}
      </View>
      {item.dismissible === false ? null : (
        <Toast.Close
          aria-label="Dismiss notification"
          width="$6"
          height="$6"
          borderWidth={0}
          backgroundColor="transparent"
          borderRadius="$sm"
          cursor="pointer"
          hoverStyle={{ backgroundColor: '$accent' }}
        >
          <XIcon size={14} color="$mutedForeground" />
        </Toast.Close>
      )}
    </View>
  )
}

/**
 * Renders toasts created with `toast()`. `UniversalProvider` mounts one for
 * you; render your own only to customise placement.
 */
export function Toaster({ position = 'bottom-right', duration = 4000, ...props }: ToasterProps) {
  const reducedMotion = useReducedMotion()
  return (
    <Toast position={position} duration={duration} reducedMotion={reducedMotion} {...props}>
      {/* Tamagui defaults the portal to Number.MAX_SAFE_INTEGER, which overflows
          Android's 32-bit zIndex and draws the toasts beneath the screen. */}
      <Toast.Viewport label="Notifications" portalZIndex={zIndex.toast}>
        <Toast.List
          renderItem={({ toast: item, index, handleClose }) => (
            <Toast.Item
              toast={item}
              index={index}
              backgroundColor="$popover"
              borderColor="$border"
              borderWidth={1}
              borderRadius="$lg"
              padding="$4"
              width="100%"
              maxWidth="$96"
              {...shadows.md}
            >
              <ToastContent item={item} onClose={handleClose} />
            </Toast.Item>
          )}
        />
      </Toast.Viewport>
    </Toast>
  )
}

export { toast }
export type { ToastT }
