import { XIcon } from '@advui/icons'
import { shadows, zIndex } from '@advui/theme'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Platform } from 'react-native'
import { Portal, Text, View, isWeb } from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export interface SnackbarAction {
  label: string
  onPress: () => void
}

export interface SnackbarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The message: one or two short lines. */
  children: ReactNode
  /** One optional action, such as Undo. Pressing it also closes the snackbar. */
  action?: SnackbarAction
  /**
   * Milliseconds before it closes by itself; `null` keeps it open until
   * dismissed. The timer pauses while the pointer or focus is on it.
   * Default: 4000, or 8000 with an action (time to reach it).
   */
  duration?: number | null
  /** Show a close button. Default: when it does not close by itself. */
  showClose?: boolean
}

/**
 * A brief message at the bottom of the screen about something the app did,
 * such as "Message archived", with an optional action like Undo. For several
 * notifications at once use `toast()` instead.
 */
export function Snackbar({
  open,
  onOpenChange,
  children,
  action,
  duration,
  showClose,
}: SnackbarProps) {
  const reducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const timeout = duration === undefined ? (action ? 8000 : 4000) : duration
  const closable = showClose ?? timeout === null
  const close = useRef(onOpenChange)
  close.current = onOpenChange

  useEffect(() => {
    if (!open || paused || timeout === null) return
    const timer = setTimeout(() => close.current(false), timeout)
    return () => clearTimeout(timer)
  }, [open, paused, timeout])

  // iOS has no live regions, so announce the message; web and Android use the
  // polite live region below.
  useEffect(() => {
    if (open && Platform.OS === 'ios' && typeof children === 'string') {
      AccessibilityInfo.announceForAccessibility(children)
    }
  }, [open, children])

  return (
    <Portal zIndex={zIndex.toast}>
      {/* The live region stays mounted so screen readers notice when a message appears. */}
      <View
        role="status"
        aria-live="polite"
        accessibilityLiveRegion="polite"
        position="absolute"
        bottom="$4"
        left="$4"
        right="$4"
        alignItems="center"
        pointerEvents="box-none"
        $md={{ bottom: '$6' }}
      >
        {open ? (
          <View
            flexDirection="row"
            alignItems="center"
            gap="$2"
            width="100%"
            maxWidth="$144"
            minHeight="$12"
            paddingLeft="$4"
            paddingRight={action || closable ? '$2' : '$4'}
            paddingVertical="$2"
            borderRadius="$sm"
            backgroundColor="$foreground"
            pointerEvents="auto"
            {...shadows.lg}
            opacity={1}
            y={0}
            enterStyle={{ opacity: 0, y: 12 }}
            transition={reducedMotion ? undefined : 'quick'}
            {...(isWeb && {
              onMouseEnter: () => setPaused(true),
              onMouseLeave: () => setPaused(false),
              onFocus: () => setPaused(true),
              onBlur: () => setPaused(false),
            })}
          >
            <Text
              flex={1}
              fontFamily="$body"
              fontSize="$2"
              lineHeight="$2"
              color="$background"
              numberOfLines={2}
            >
              {children}
            </Text>
            {action ? (
              <View
                render="button"
                role="button"
                paddingHorizontal="$3"
                height="$9"
                justifyContent="center"
                borderRadius="$button"
                cursor="pointer"
                hoverStyle={{ opacity: 0.85 }}
                pressStyle={{ opacity: 0.7 }}
                focusVisibleStyle={{
                  outlineColor: '$inversePrimary',
                  outlineStyle: 'solid',
                  outlineWidth: 2,
                }}
                {...(isWeb
                  ? { type: 'button', borderWidth: 0, backgroundColor: 'transparent' }
                  : { accessible: true, hitSlop: 6 })}
                onPress={() => {
                  action.onPress()
                  onOpenChange(false)
                }}
              >
                <Text
                  fontFamily="$body"
                  fontSize="$2"
                  lineHeight="$2"
                  fontWeight="600"
                  color="$inversePrimary"
                >
                  {action.label}
                </Text>
              </View>
            ) : null}
            {closable ? (
              <View
                render="button"
                role="button"
                aria-label="Close"
                width="$9"
                height="$9"
                alignItems="center"
                justifyContent="center"
                borderRadius="$full"
                cursor="pointer"
                hoverStyle={{ opacity: 0.85 }}
                focusVisibleStyle={{
                  outlineColor: '$inversePrimary',
                  outlineStyle: 'solid',
                  outlineWidth: 2,
                }}
                {...(isWeb
                  ? { type: 'button', borderWidth: 0, backgroundColor: 'transparent' }
                  : { accessible: true, hitSlop: 6 })}
                onPress={() => onOpenChange(false)}
              >
                <XIcon size={18} color="$background" />
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Portal>
  )
}
