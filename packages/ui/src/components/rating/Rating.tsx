import { type IconComponent, StarIcon } from '@advui/icons'
import { type KeyboardEvent, forwardRef, useContext, useState } from 'react'
import {
  type ColorTokens,
  type GetProps,
  type TamaguiElement,
  View,
  isWeb,
  styled,
} from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { FieldContext, type FieldControlProps, useFieldControl } from '../../hooks/useFieldControl'
import { ariaState } from '../../utils/ariaState'

export type RatingSize = 'sm' | 'md' | 'lg'

// Icon size per size (px).
const iconSizes: Record<RatingSize, number> = { sm: 16, md: 24, lg: 32 }

// Floating-point slack when snapping a value to the step (2.9999… is 3).
const EPSILON = 1e-9

const RatingFrame = styled(View, {
  displayName: 'Rating',
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  borderRadius: "sm",
  outlineColor: "focus-visible:ring",
  outlineStyle: "focus-visible:solid",
  outlineWidth: "focus-visible:2px",
  outlineOffset: "focus-visible:2px",
  variants: {
    size: {
      sm: {
        gap: "0-5"
      },
      md: {
        gap: "1"
      },
      lg: {
        gap: "1-5"
      },
    },
  } as const,
  defaultVariants: { size: 'md' }
})

type FrameProps = GetProps<typeof RatingFrame>

export interface RatingProps
  extends Omit<FrameProps, 'children' | 'defaultValue' | 'size' | 'id'>, FieldControlProps {
  /** The rating, from 0 (none) to `count`, when you control it. */
  value?: number
  /** Starting `value` when uncontrolled. */
  defaultValue?: number
  /** Called when the user picks a rating with a press or a key. */
  onValueChange?: (value: number) => void
  /** How many icons, and the highest rating. */
  count?: number
  /** Lets the user pick half ratings (3.5): each icon has a half for each value. */
  allowHalf?: boolean
  /**
   * Shows the rating without letting anyone change it. Any fraction shows as
   * a part-filled icon (4.3 fills 30% of the fifth).
   */
  readOnly?: boolean
  size?: RatingSize
  /** The icon to repeat. Pass any icon from `@advui/icons` or `createIcon`. */
  icon?: IconComponent
  /**
   * Fill and outline of the chosen icons. By default they are filled with
   * `warning` (amber) and outlined in `warningSoftForeground`, so they stand
   * out on light backgrounds too.
   */
  color?: ColorTokens
  /** Outline of the icons that are not chosen. */
  emptyColor?: ColorTokens
  /** The value read by screen readers. Default: "3 of 5". */
  getValueText?: (value: number) => string
  /** Web: the field name the rating submits under in a native form. */
  name?: string
}

const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value))

/**
 * A row of stars (or any icon) to give or show a score. Interactive ratings
 * are sliders: arrow keys step, Home clears, End picks the top score, and
 * screen readers adjust them with swipes. `readOnly` shows a score as an image.
 */
export const Rating = forwardRef<TamaguiElement, RatingProps>(function Rating(ratingProps, ref) {
  const field = useContext(FieldContext)
  const {
    value: valueProp,
    defaultValue = 0,
    onValueChange,
    count = 5,
    allowHalf = false,
    readOnly = false,
    size = 'md',
    icon: Icon = StarIcon,
    color,
    emptyColor = 'mutedForeground',
    getValueText,
    name,
    disabled = false,
    invalid = false,
    'aria-label': ariaLabel,
    // aria-required is not allowed on a slider. The Field's label still shows
    // the marker; say what is required in the help or error text.
    'aria-required': _ariaRequired,
    'aria-describedby': describedBy,
    accessibilityHint,
    id,
    ...props
  } = useFieldControl(ratingProps)
  const [rawValue, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const value = clamp(rawValue, count)
  // The value under the pointer while it hovers the icons (web).
  const [hovered, setHovered] = useState<number | null>(null)
  const step = allowHalf ? 0.5 : 1
  const interactive = !readOnly && !disabled
  const shown = interactive && hovered !== null ? hovered : value
  const valueText = getValueText ? getValueText(value) : `${value} of ${count}`
  const iconSize = iconSizes[size]

  const fill = color ?? 'warning'
  const outline = color ?? 'warningSoftForeground'
  const emptyOutline = invalid ? 'error' : emptyColor

  const pick = (next: number) => {
    if (!interactive) return
    setValue(clamp(next, count))
  }

  // From a fraction (a read-only 3.7, a controlled value), the first step goes
  // to the next whole step: 3.7 goes up to 4 and down to 3.
  const stepUp = () => pick(Math.floor(value / step + EPSILON) * step + step)
  const stepDown = () => pick(Math.ceil(value / step - EPSILON) * step - step)

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!interactive) return
    // Left and right swap in right-to-left text, as on a native range input.
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const actions: Record<string, () => void> = {
      ArrowRight: rtl ? stepDown : stepUp,
      ArrowLeft: rtl ? stepUp : stepDown,
      ArrowUp: stepUp,
      ArrowDown: stepDown,
      Home: () => pick(0),
      End: () => pick(count),
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  const semantics = readOnly
    ? isWeb
      ? {
          role: 'img' as const,
          id,
          'aria-label': ariaLabel ? `${ariaLabel}: ${valueText}` : valueText,
        }
      : {
          accessible: true,
          role: 'img' as const,
          'aria-label': ariaLabel ? `${ariaLabel}: ${valueText}` : valueText,
          accessibilityHint,
        }
    : isWeb
      ? {
          role: 'slider' as const,
          id,
          tabIndex: disabled ? undefined : 0,
          'aria-label': ariaLabel,
          // A <label for> cannot name a div, so a Field's label is linked by id.
          ...(field?.labelId &&
            ariaLabel === undefined &&
            props['aria-labelledby'] === undefined && { 'aria-labelledby': field.labelId }),
          'aria-describedby': describedBy,
          'aria-valuemin': 0,
          'aria-valuemax': count,
          'aria-valuenow': value,
          'aria-valuetext': valueText,
          'aria-disabled': ariaState(disabled),
          'aria-invalid': invalid || undefined,
          onKeyDown: onKeyDown as never,
        }
      : {
          accessible: true,
          role: 'slider' as const,
          'aria-label': ariaLabel,
          accessibilityHint,
          accessibilityValue: { min: 0, max: count, now: value, text: valueText },
          'aria-disabled': ariaState(disabled),
          accessibilityActions: [{ name: 'increment' }, { name: 'decrement' }],
          onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
            if (event.nativeEvent.actionName === 'increment') stepUp()
            if (event.nativeEvent.actionName === 'decrement') stepDown()
          },
        }

  // Each icon is one value, or two halves, that a press picks.
  const target = (next: number) =>
    interactive
      ? {
          onPress: () => pick(next),
          cursor: 'pointer' as const,
          ...(isWeb
            ? { onMouseEnter: () => setHovered(next) }
            : // Icons are smaller than a 44pt touch target; reach it upwards and downwards.
              { hitSlop: { top: (44 - iconSize) / 2, bottom: (44 - iconSize) / 2 } }),
        }
      : {}

  return (
    <RatingFrame
      ref={ref}
      size={size}
      opacity={disabled ? 0.5 : 1}
      cursor={disabled ? 'not-allowed' : undefined}
      {...(isWeb && interactive && { onMouseLeave: () => setHovered(null) })}
      {...semantics}
      {...props}
    >
      {Array.from({ length: count }, (_, index) => {
        const fraction = clamp(shown - index, 1)
        return (
          <View
            key={index}
            position="relative"
            flexDirection="row"
            {...(!allowHalf && target(index + 1))}
          >
            <Icon size={iconSize} color={emptyOutline} />
            {fraction > 0 ? (
              // A row, so the filled part starts on the left, or the right in RTL.
              <View
                position="absolute"
                top={0}
                bottom={0}
                left={0}
                right={0}
                flexDirection="row"
                pointerEvents="none"
              >
                <View width={iconSize * fraction} overflow="hidden" flexDirection="row">
                  <Icon size={iconSize} color={outline} fill={fill} />
                </View>
              </View>
            ) : null}
            {allowHalf && interactive ? (
              <View position="absolute" top={0} bottom={0} left={0} right={0} flexDirection="row">
                <View flex={1} {...target(index + 0.5)} />
                <View flex={1} {...target(index + 1)} />
              </View>
            ) : null}
          </View>
        )
      })}
      {isWeb && name && !readOnly ? <input type="hidden" name={name} value={value} disabled={disabled} /> : null}
    </RatingFrame>
  )
})
