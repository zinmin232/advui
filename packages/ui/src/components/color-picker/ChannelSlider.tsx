import type { KeyboardEvent, ReactNode } from 'react'
import { View, isWeb } from 'tamagui/unstyled'
import { ariaState } from '../../utils/ariaState'
import { Thumb } from './ColorArea'
import { type AccessibilityActionEvent, THUMB, clamp, focusRing } from './shared'
import { useColorDrag } from './useColorDrag'

export interface ChannelSliderProps {
  /** From 0 to `max`. */
  value: number
  max: number
  /** Shift + arrow, Page Up / Page Down, and one screen reader swipe. */
  bigStep: number
  label: string
  valueText: string
  /** Native: read after the label. */
  hint?: string
  disabled: boolean
  thumbColor: string
  /** The track's fill: the hue spectrum, or a color fading in over a grid. */
  track: ReactNode
  onChange: (value: number) => void
  onCommit: () => void
}

/** A horizontal slider for one channel of the color: hue or opacity. */
export function ChannelSlider({
  value,
  max,
  bigStep,
  label,
  valueText,
  hint,
  disabled,
  thumbColor,
  track,
  onChange,
  onCommit,
}: ChannelSliderProps) {
  const drag = useColorDrag({ disabled, onDrag: (x) => onChange(x * max), onEnd: onCommit })
  const now = Math.round(value)
  const set = (next: number) => {
    if (disabled) return
    onChange(clamp(next, 0, max))
    onCommit()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? bigStep : 1
    const actions: Record<string, () => void> = {
      ArrowRight: () => set(now + step),
      ArrowUp: () => set(now + step),
      ArrowLeft: () => set(now - step),
      ArrowDown: () => set(now - step),
      PageUp: () => set(now + bigStep),
      PageDown: () => set(now - bigStep),
      Home: () => set(0),
      End: () => set(max),
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
        'aria-valuemin': 0,
        'aria-valuemax': max,
        'aria-valuenow': now,
        'aria-valuetext': valueText,
        'aria-disabled': ariaState(disabled),
        onKeyDown: onKeyDown as never,
        style: { touchAction: 'none' },
      }
    : {
        accessible: true,
        role: 'slider' as const,
        'aria-label': label,
        accessibilityHint: hint,
        accessibilityValue: { min: 0, max, now, text: valueText },
        'aria-disabled': ariaState(disabled),
        accessibilityActions: [{ name: 'increment' }, { name: 'decrement' }],
        onAccessibilityAction: (event: AccessibilityActionEvent) => {
          if (event.nativeEvent.actionName === 'increment') set(now + bigStep)
          if (event.nativeEvent.actionName === 'decrement') set(now - bigStep)
        },
        // The strip is thinner than a 44pt touch target; reach it upwards and downwards.
        hitSlop: { top: (44 - THUMB) / 2, bottom: (44 - THUMB) / 2 },
      }

  const surface = (
    <View
      position="relative"
      height={THUMB}
      justifyContent="center"
      borderRadius="full"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      {...focusRing}
      {...semantics}
      {...drag.surface}
    >
      <View
        position="relative"
        height="3"
        borderRadius="full"
        overflow="hidden"
        pointerEvents="none"
      >
        {track}
      </View>
      <Thumb color={thumbColor} left={`${(value / max) * 100}%`} top="50%" />
    </View>
  )
  return drag.guard ? <View {...drag.guard}>{surface}</View> : surface
}
