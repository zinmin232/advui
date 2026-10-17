import { type HSVA, fromHsv } from '@advui/utils'
import type { KeyboardEvent } from 'react'
import { View, isWeb } from 'tamagui'
import { ariaState } from '../../utils/ariaState'
import {
  type AccessibilityActionEvent,
  BLACK,
  CLEAR_BLACK,
  CLEAR_WHITE,
  THUMB,
  THUMB_RING,
  WHITE,
  clamp,
  focusRing,
  rawColor,
} from './shared'
import { useColorDrag } from './useColorDrag'

/** A ring around the picked color, outlined so it shows on white and on black. */
export function Thumb({
  color,
  left,
  top,
}: {
  color: string
  left: `${number}%`
  top: `${number}%`
}) {
  return (
    <View
      position="absolute"
      left={left}
      top={top}
      width={THUMB}
      height={THUMB}
      marginLeft={-THUMB / 2}
      marginTop={-THUMB / 2}
      borderRadius="$full"
      borderWidth={1}
      borderColor={rawColor(THUMB_RING)}
      pointerEvents="none"
    >
      <View
        flex={1}
        borderRadius="$full"
        borderWidth={2}
        borderColor="$white"
        backgroundColor={rawColor(color)}
      />
    </View>
  )
}

export interface ColorAreaProps {
  hsv: HSVA
  disabled: boolean
  label: string
  roleDescription: string
  valueText: string
  saturateLabel: string
  desaturateLabel: string
  /** Native: read after the label. */
  hint?: string
  /** Saturation and brightness, from 0 to 1. */
  onChange: (saturation: number, brightness: number) => void
  onCommit: () => void
}

/**
 * Saturation from left to right and brightness from bottom to top, for the
 * current hue. One focusable element: the arrow keys move along both axes.
 */
export function ColorArea({
  hsv,
  disabled,
  label,
  roleDescription,
  valueText,
  saturateLabel,
  desaturateLabel,
  hint,
  onChange,
  onCommit,
}: ColorAreaProps) {
  const drag = useColorDrag({
    disabled,
    onDrag: (x, y) => onChange(x, 1 - y),
    onEnd: onCommit,
  })
  const saturation = Math.round(hsv.s * 100)
  const brightness = Math.round(hsv.v * 100)
  const set = (s: number, v: number) => {
    if (disabled) return
    onChange(clamp(s, 0, 100) / 100, clamp(v, 0, 100) / 100)
    onCommit()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? 10 : 1
    const actions: Record<string, () => void> = {
      ArrowRight: () => set(saturation + step, brightness),
      ArrowLeft: () => set(saturation - step, brightness),
      ArrowUp: () => set(saturation, brightness + step),
      ArrowDown: () => set(saturation, brightness - step),
      PageUp: () => set(saturation, brightness + 10),
      PageDown: () => set(saturation, brightness - 10),
      Home: () => set(0, brightness),
      End: () => set(100, brightness),
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  const semantics = isWeb
    ? {
        role: 'slider' as const,
        tabIndex: disabled ? undefined : 0,
        'aria-label': label,
        'aria-roledescription': roleDescription,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': saturation,
        'aria-valuetext': valueText,
        'aria-disabled': ariaState(disabled),
        onKeyDown: onKeyDown as never,
        // Dragging on a touch screen moves the thumb, not the page.
        style: { touchAction: 'none' },
      }
    : {
        // An adjustable element: swipes change the brightness, and the actions
        // menu holds the saturation.
        accessible: true,
        role: 'slider' as const,
        'aria-label': label,
        accessibilityHint: hint,
        accessibilityValue: { min: 0, max: 100, now: brightness, text: valueText },
        'aria-disabled': ariaState(disabled),
        accessibilityActions: [
          { name: 'increment' },
          { name: 'decrement' },
          { name: 'saturate', label: saturateLabel },
          { name: 'desaturate', label: desaturateLabel },
        ],
        onAccessibilityAction: (event: AccessibilityActionEvent) => {
          const actions: Record<string, () => void> = {
            increment: () => set(saturation, brightness + 10),
            decrement: () => set(saturation, brightness - 10),
            saturate: () => set(saturation + 10, brightness),
            desaturate: () => set(saturation - 10, brightness),
          }
          actions[event.nativeEvent.actionName]?.()
        },
      }

  const surface = (
    <View
      position="relative"
      height="$40"
      borderRadius="$md"
      cursor={disabled ? 'not-allowed' : 'crosshair'}
      focusVisibleStyle={focusRing}
      {...semantics}
      {...drag.surface}
    >
      <View
        position="absolute"
        inset={0}
        borderRadius="$md"
        overflow="hidden"
        pointerEvents="none"
        backgroundColor={rawColor(fromHsv({ h: hsv.h, s: 1, v: 1 }))}
      >
        <View
          position="absolute"
          inset={0}
          backgroundImage={`linear-gradient(to right, ${WHITE}, ${CLEAR_WHITE})`}
        />
        <View
          position="absolute"
          inset={0}
          backgroundImage={`linear-gradient(to bottom, ${CLEAR_BLACK}, ${BLACK})`}
        />
      </View>
      <Thumb
        color={fromHsv({ ...hsv, a: 1 })}
        left={`${hsv.s * 100}%`}
        top={`${(1 - hsv.v) * 100}%`}
      />
    </View>
  )
  return drag.guard ? <View {...drag.guard}>{surface}</View> : surface
}
