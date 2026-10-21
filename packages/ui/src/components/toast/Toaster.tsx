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
  type ToastRootProps as TamaguiToasterProps,
  toast,
} from '@tamagui/toast'
import type { ReactNode } from 'react'
import { View, isWeb, useWindowDimensions } from 'tamagui/unstyled'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRipple } from '../../hooks/useRipple'
import { Spinner } from '../spinner'
import { Text } from '../typography/Text'
import { flatValue } from '../../utils/responsive'

type ToastType = NonNullable<ToastT['type']>

const typeIcon: Partial<Record<ToastType, ReactNode>> = {
  success: <CheckCircleIcon />,
  error: <AlertCircleIcon />,
  warning: <AlertTriangleIcon />,
  info: <InfoIcon />,
  loading: <Spinner size="sm" />,
}

const typeColor: Record<ToastType, string> = {
  default: 'foreground',
  success: 'success',
  error: 'error',
  warning: 'warningSoftForeground',
  info: 'info',
  loading: 'mutedForeground',
}

export type ToasterProps = Pick<
  TamaguiToasterProps,
  'position' | 'duration' | 'visibleToasts' | 'expand' | 'closeButton' | 'swipeDirection'
>

function ToastContent({ item, onClose }: { item: ToastT; onClose: () => void }) {
  const type = item.type ?? 'default'
  const title = typeof item.title === 'function' ? item.title() : item.title
  const description = typeof item.description === 'function' ? item.description() : item.description
  const icon = item.icon ?? typeIcon[type]
  const actionRipple = useRipple({ color: 'primaryForeground', disabled: !item.action })
  const closeRipple = useRipple({
    color: 'mutedForeground',
    disabled: item.dismissible === false,
  })

  return (
    <View flexDirection="row" alignItems="flex-start" gap="3">
      {icon ? (
        <View paddingTop="0-5">
          <IconDefaults size={18} color={typeColor[type]}>
            {icon}
          </IconDefaults>
        </View>
      ) : null}
      <View flex={1} gap="1">
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
          <View flexDirection="row" marginTop="2">
            <Toast.Action
              backgroundColor={`primary hover:primaryHover press:${actionRipple.active ? 'primary' : 'primaryPress'}`}
              borderRadius="md"
              paddingHorizontal="3"
              height="8"
              justifyContent="center"
              cursor="pointer"
              {...actionRipple.props}
              onPress={(event) => {
                item.action?.onClick?.(event as never)
                onClose()
              }}
            >
              {actionRipple.element}
              <Text size="sm" color="primaryForeground" weight="medium">
                {item.action.label}
              </Text>
            </Toast.Action>
          </View>
        ) : null}
      </View>
      {item.dismissible === false ? null : (
        // A plain button rather than Toast.Close, which does not pass press
        // handlers through (the Android ripple needs them).
        <View
          render="button"
          role="button"
          aria-label="Dismiss notification"
          width="6"
          height="6"
          alignItems="center"
          justifyContent="center"
          borderRadius="sm"
          cursor="pointer"
          backgroundColor={flatValue(
            isWeb && 'transparent',
            'hover:accent',
            !closeRipple.active && 'press:accentHover',
          )}
          outlineColor="focus-visible:ring"
          outlineStyle="focus-visible:solid"
          outlineWidth="focus-visible:2px"
          {...(isWeb
            ? { type: 'button', padding: 0, borderWidth: 0 }
            : { accessible: true, hitSlop: 10 })}
          {...closeRipple.props}
          onPress={onClose}
        >
          {closeRipple.element}
          <XIcon size={14} color="mutedForeground" />
        </View>
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
  const { height } = useWindowDimensions()
  return (
    <Toast position={position} duration={duration} reducedMotion={reducedMotion} {...props}>
      {/* Tamagui defaults the portal to Number.MAX_SAFE_INTEGER, which overflows
          Android's 32-bit zIndex and draws the toasts beneath the screen. */}
      <Toast.Viewport
        label="Notifications"
        portalZIndex={zIndex.toast}
        // Native: no keyboard shortcut to add to the label, and room for the
        // toasts. They are placed absolutely inside the viewport, and Android
        // reports a view outside its parent's bounds as off-screen, so TalkBack
        // skipped them and their buttons. The viewport lets touches through.
        {...(!isWeb && { hotkey: [], minHeight: height / 2 })}
      >
        <Toast.List
          renderItem={({ toast: item, index, handleClose }) => (
            <Toast.Item
              toast={item}
              index={index}
              backgroundColor="popover"
              borderColor="border"
              borderWidth={1}
              borderRadius="lg"
              padding="4"
              width="100%"
              maxWidth="96"
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
