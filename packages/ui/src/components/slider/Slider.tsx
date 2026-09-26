import { shadows } from '@advui/theme'
import { forwardRef, useCallback } from 'react'
import {
  type GetProps,
  Slider as TamaguiSlider,
  type TamaguiElement,
  View,
  isWeb,
  useDidFinishSSR,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'

export type SliderValue = number | number[]
export type SliderSize = 'sm' | 'md' | 'lg'

// Thumb diameter and track thickness per size (px, matching the $4 / $5 / $6 size tokens).
const metrics = {
  sm: { thumb: 16, track: 4 },
  md: { thumb: 20, track: 6 },
  lg: { thumb: 24, track: 8 },
} as const

export interface SliderProps extends Omit<
  GetProps<typeof TamaguiSlider>,
  'value' | 'defaultValue' | 'onValueChange' | 'size' | 'children'
> {
  /** A number for one thumb, or an array for a range (one thumb per value). */
  value?: SliderValue
  defaultValue?: SliderValue
  /** Called with the same shape you passed: a number or an array. */
  onValueChange?: (value: SliderValue) => void
  /** Called when the user stops dragging or releases a key. */
  onValueCommit?: (value: SliderValue) => void
  min?: number
  max?: number
  step?: number
  size?: SliderSize
  disabled?: boolean
  /** Accessible name (or use `aria-labelledby`). */
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Readable value for assistive technology, e.g. `(v) => \`${v}%\``. */
  getValueText?: (value: number) => string
  /** Names for range thumbs. Default: "Minimum" / "Maximum" after the label. */
  thumbLabels?: string[]
}

const asArray = (value: SliderValue) => (Array.isArray(value) ? value : [value])

/**
 * Pick a number, or a range, by dragging along a track. Arrow keys step,
 * Page Up / Page Down take bigger steps, Home / End jump to the ends.
 */
export const Slider = forwardRef<TamaguiElement, SliderProps>(function Slider(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    size = 'md',
    disabled,
    orientation = 'horizontal',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    getValueText,
    thumbLabels,
    ...props
  },
  ref,
) {
  const range = Array.isArray(valueProp ?? defaultValue)
  const toShape = useCallback(
    (values: number[]): SliderValue => (range ? values : (values[0] ?? min)),
    [range, min],
  )
  const [values, setValues] = useControllableState<number[]>({
    value: valueProp === undefined ? undefined : asArray(valueProp),
    defaultValue: asArray(defaultValue ?? min),
    onChange: (next) => onValueChange?.(toShape(next)),
  })
  const { thumb, track } = metrics[size]
  const vertical = orientation === 'vertical'
  const hydrated = useDidFinishSSR()
  // Centre the track in the thumb-high frame explicitly: on native Tamagui's
  // slider frame ignores flex alignment and the track would sit at the top.
  const trackPosition = vertical
    ? ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        width: track,
        marginLeft: -track / 2,
      } as const)
    : ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        height: track,
        marginTop: -track / 2,
      } as const)

  const stepThumb = (index: number, direction: 1 | -1) => {
    const next = [...values]
    const current = next[index] ?? min
    next[index] = Math.min(max, Math.max(min, current + step * direction))
    setValues(next)
    onValueCommit?.(toShape(next))
  }

  const thumbLabel = (index: number) => {
    if (values.length === 1) return ariaLabel
    const own = thumbLabels?.[index] ?? (index === 0 ? 'Minimum' : 'Maximum')
    return ariaLabel ? `${ariaLabel}, ${own}` : own
  }

  // Tamagui positions thumbs differently on the server and after hydration, so
  // server-render a static copy with the same geometry (like Select's trigger).
  if (!hydrated) {
    const pct = (value: number) => ((value - min) / (max - min)) * 100
    const low = values.length > 1 ? pct(Math.min(...values)) : 0
    const high = pct(Math.max(...values))
    // Thumbs stay inside the track: slide their start edge from 0 to (100% - thumb).
    const at = (value: number) => `calc(${pct(value)}% - ${(pct(value) / 100) * thumb}px)`
    return (
      <View
        ref={ref as never}
        position="relative"
        {...(vertical
          ? { width: thumb, height: '$40', alignItems: 'center', justifyContent: 'center' }
          : { height: thumb, width: '100%', alignItems: 'center', justifyContent: 'center' })}
        opacity={disabled ? 0.5 : 1}
        {...(props as GetProps<typeof View>)}
      >
        <View overflow="hidden" borderRadius="$full" backgroundColor="$border" {...trackPosition}>
          <View
            position="absolute"
            backgroundColor="$primary"
            borderRadius="$full"
            {...(vertical
              ? { left: 0, right: 0, bottom: `${low}%`, top: `${100 - high}%` }
              : { top: 0, bottom: 0, left: `${low}%`, right: `${100 - high}%` })}
          />
        </View>
        {values.map((value, index) => (
          <View
            key={index}
            role="slider"
            aria-label={thumbLabel(index)}
            aria-labelledby={values.length === 1 ? ariaLabelledBy : undefined}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={getValueText?.(value)}
            aria-orientation={orientation}
            position="absolute"
            width={thumb}
            height={thumb}
            borderRadius="$full"
            backgroundColor="$background"
            borderWidth={2}
            borderColor="$primary"
            {...shadows.sm}
            // calc() positions are valid CSS but outside Tamagui's position types.
            {...((vertical ? { bottom: at(value) } : { left: at(value) }) as object)}
          />
        ))}
      </View>
    )
  }

  return (
    <TamaguiSlider
      ref={ref as never}
      value={values}
      onValueChange={setValues}
      onSlideEnd={() => onValueCommit?.(toShape(values))}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      orientation={orientation}
      // The frame is as thick as the thumb so the whole strip is draggable.
      {...(vertical
        ? { width: thumb, height: '$40', alignItems: 'center', justifyContent: 'center' }
        : { height: thumb, width: '100%', alignItems: 'center', justifyContent: 'center' })}
      opacity={disabled ? 0.5 : 1}
      {...props}
    >
      <TamaguiSlider.Track
        unstyled
        overflow="hidden"
        borderRadius="$full"
        backgroundColor="$border"
        {...trackPosition}
      >
        <TamaguiSlider.TrackActive unstyled backgroundColor="$primary" borderRadius="$full" />
      </TamaguiSlider.Track>
      {values.map((value, index) => (
        <TamaguiSlider.Thumb
          // Thumbs keep their identity while dragging past each other.
          key={index}
          index={index}
          unstyled
          position="absolute"
          size={thumb}
          width={thumb}
          height={thumb}
          circular
          backgroundColor="$background"
          borderWidth={2}
          borderColor="$primary"
          cursor={disabled ? 'not-allowed' : 'grab'}
          pressStyle={{ scale: 1.1 }}
          focusVisibleStyle={{
            outlineColor: '$ring',
            outlineStyle: 'solid',
            outlineWidth: 2,
            outlineOffset: 2,
          }}
          {...shadows.sm}
          aria-label={thumbLabel(index)}
          aria-labelledby={values.length === 1 ? ariaLabelledBy : undefined}
          aria-valuetext={getValueText?.(value)}
          aria-disabled={disabled || undefined}
          {...(!isWeb && {
            // Screen readers adjust sliders with swipe gestures (increment / decrement).
            accessible: true,
            accessibilityActions: [{ name: 'increment' }, { name: 'decrement' }],
            onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
              if (disabled) return
              if (event.nativeEvent.actionName === 'increment') stepThumb(index, 1)
              if (event.nativeEvent.actionName === 'decrement') stepThumb(index, -1)
            },
            // Thumbs are smaller than a 44pt touch target.
            hitSlop: Math.max(0, (44 - thumb) / 2),
          })}
        />
      ))}
    </TamaguiSlider>
  )
})
