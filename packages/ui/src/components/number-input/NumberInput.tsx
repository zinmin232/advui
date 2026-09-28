import { MinusIcon, PlusIcon } from '@advui/icons'
import { forwardRef, useState } from 'react'
import { type TamaguiElement, XStack, isWeb } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { IconButton } from '../icon-button/IconButton'
import { Input, type InputProps } from '../input/Input'

export interface NumberInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChangeText' | 'type' | 'inputMode' | 'keyboardType' | 'size'
> {
  size?: 'sm' | 'md' | 'lg'
  /** The number, or `null` when empty (controlled). */
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  /** Amount added or removed by the buttons and arrow keys. */
  step?: number
  decrementLabel?: string
  incrementLabel?: string
}

function decimals(n: number) {
  return (String(n).split('.')[1] ?? '').length
}

/**
 * A numeric field with − and + buttons. It is a `spinbutton`: arrow keys step
 * on web, and screen readers get increment / decrement actions on native.
 * Typed values are clamped to `min` / `max` when the field loses focus.
 */
export const NumberInput = forwardRef<TamaguiElement, NumberInputProps>(function NumberInput(
  {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    decrementLabel = 'Decrease',
    incrementLabel = 'Increase',
    size = 'md',
    disabled = false,
    onBlur,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState<number | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  // Text being typed; null shows the formatted value.
  const [draft, setDraft] = useState<string | null>(null)

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
  const stepBy = (direction: 1 | -1) => {
    const base = value ?? clamp(0)
    const next = value == null ? base : base + direction * step
    // Round away float noise (0.1 + 0.2) at the precision of the inputs.
    setValue(clamp(Number(next.toFixed(Math.max(decimals(step), decimals(base))))))
    setDraft(null)
  }
  const atMin = value != null && min != null && value <= min
  const atMax = value != null && max != null && value >= max

  return (
    <XStack gap="$2" alignItems="center">
      <IconButton
        variant="outline"
        size={size}
        icon={<MinusIcon />}
        aria-label={decrementLabel}
        disabled={disabled || atMin}
        // Arrow keys step from the field, so the buttons stay out of the Tab order.
        {...(isWeb && { tabIndex: -1 })}
        onPress={() => stepBy(-1)}
      />
      <Input
        ref={ref}
        flex={1}
        textAlign="center"
        role="spinbutton"
        inputMode="decimal"
        size={size}
        disabled={disabled}
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        value={draft ?? (value == null ? '' : String(value))}
        onChangeText={(text) => {
          setDraft(text)
          if (text.trim() === '') setValue(null)
          else if (Number.isFinite(Number(text))) setValue(Number(text))
        }}
        onBlur={(event) => {
          if (value != null && clamp(value) !== value) setValue(clamp(value))
          setDraft(null)
          onBlur?.(event)
        }}
        {...(isWeb
          ? {
              onKeyDown: (event: { key: string; preventDefault: () => void }) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                  event.preventDefault()
                  stepBy(event.key === 'ArrowUp' ? 1 : -1)
                } else if (event.key === 'Home' && min != null) {
                  event.preventDefault()
                  setValue(min)
                  setDraft(null)
                } else if (event.key === 'End' && max != null) {
                  event.preventDefault()
                  setValue(max)
                  setDraft(null)
                }
              },
            }
          : {
              accessibilityActions: [{ name: 'increment' }, { name: 'decrement' }],
              onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) =>
                stepBy(event.nativeEvent.actionName === 'increment' ? 1 : -1),
            })}
        {...props}
      />
      <IconButton
        variant="outline"
        size={size}
        icon={<PlusIcon />}
        aria-label={incrementLabel}
        disabled={disabled || atMax}
        {...(isWeb && { tabIndex: -1 })}
        onPress={() => stepBy(1)}
      />
    </XStack>
  )
})
