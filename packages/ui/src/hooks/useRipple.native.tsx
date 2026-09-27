import { getUniversalSettings } from '@advui/theme'
import { type ComponentRef, forwardRef, useMemo, useRef } from 'react'
import { Platform, StyleSheet, View, codegenNativeCommands, processColor } from 'react-native'
import { type ColorTokens, getConfig, useTheme } from 'tamagui'
import type { Ripple, RippleOptions } from './useRipple'

type Host = ComponentRef<typeof View>

interface ViewCommands {
  hotspotUpdate: (view: Host, x: number, y: number) => void
  setPressed: (view: Host, pressed: boolean) => void
}

// The view commands Pressable sends for `android_ripple`, created on first use.
let commands: ViewCommands | undefined
const viewCommands = () =>
  (commands ??= codegenNativeCommands<ViewCommands>({
    supportedCommands: ['hotspotUpdate', 'setPressed'],
  }))

// Material's pressed state layer is 10%. Android paints ripples below their
// color's alpha, so Material Components and Compose pass double that; so do
// we, to match native Material apps.
const RIPPLE_ALPHA = 0.2

type TouchEvent = {
  nativeEvent?: { pageX?: number; pageY?: number; locationX?: number; locationY?: number }
}

// Where the ripple starts. `locationX/Y` are relative to the touched child
// (such as the label), so measure from the ripple view when the host can.
function hotspot(view: Host, event: unknown) {
  const touch = (event as TouchEvent | undefined)?.nativeEvent
  if (!touch) return null
  const rect = (view as { getBoundingClientRect?: () => DOMRect }).getBoundingClientRect?.()
  if (rect && touch.pageX !== undefined && touch.pageY !== undefined) {
    return { x: touch.pageX - rect.left, y: touch.pageY - rect.top }
  }
  return { x: touch.locationX ?? 0, y: touch.locationY ?? 0 }
}

const RippleHost = forwardRef<Host, { color: ColorTokens }>(function RippleHost({ color }, ref) {
  const theme = useTheme()
  const value = (theme[color.slice(1) as keyof typeof theme] as { val: string } | undefined)?.val
  const background = useMemo(
    () => ({
      type: 'RippleAndroid',
      color: processColor(value),
      borderless: false,
      // No rippleRadius key: Android reads it as a number when present.
      alpha: RIPPLE_ALPHA,
    }),
    [value],
  )
  return (
    <View
      ref={ref}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      collapsable={false}
      style={StyleSheet.absoluteFill}
      // Not in View's public types: it is the prop Pressable's `android_ripple` sets.
      {...{ nativeBackgroundAndroid: background }}
    />
  )
})

export function useRipple({ color, disabled, onPressIn, onPressOut }: RippleOptions): Ripple {
  // Read from the config rather than React context: sheets and toasts render
  // through native portals that do not carry context.
  const enabled =
    Platform.OS === 'android' && !disabled && getUniversalSettings(getConfig()).androidRipple
  const host = useRef<Host>(null)

  if (!enabled) {
    return {
      active: false,
      props: { ...(onPressIn && { onPressIn }), ...(onPressOut && { onPressOut }) },
      element: null,
    }
  }

  return {
    active: true,
    props: {
      // Clips the ripple to the element's rounded corners. Android clips
      // inside the border, so a transparent border leaves an unrippled ring.
      overflow: 'hidden',
      onPressIn: (event) => {
        onPressIn?.(event)
        const view = host.current
        if (!view) return
        const point = hotspot(view, event)
        if (point) viewCommands().hotspotUpdate(view, point.x, point.y)
        viewCommands().setPressed(view, true)
      },
      onPressOut: (event) => {
        onPressOut?.(event)
        if (host.current) viewCommands().setPressed(host.current, false)
      },
    },
    element: <RippleHost ref={host} color={color} />,
  }
}
