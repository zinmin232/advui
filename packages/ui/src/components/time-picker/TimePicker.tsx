import { forwardRef, useState } from 'react'
import { type GetProps, type TamaguiElement, Text, XStack, isWeb, styled } from 'tamagui/unstyled'
import { FieldContext, useFieldControl } from '../../hooks/useFieldControl'
import { Select } from '../select/Select'

const TimePickerFrame = styled(XStack, {
  displayName: 'TimePicker',
  role: 'group',
  alignItems: 'center',
  gap: '2',
})

type Parts = { hour: string | null; minute: string | null; period: 'AM' | 'PM' }

const pad = (n: number) => String(n).padStart(2, '0')

function toParts(value: string | null | undefined, twelveHour: boolean): Parts {
  const match = value ? /^(\d{1,2}):(\d{2})$/.exec(value) : null
  if (!match) return { hour: null, minute: null, period: 'AM' }
  const h = Number(match[1])
  return {
    hour: twelveHour ? String(h % 12 === 0 ? 12 : h % 12) : pad(h),
    minute: match[2]!,
    period: h >= 12 ? 'PM' : 'AM',
  }
}

/** The hour in 24-hour time that an hour option means. */
const to24 = (hour: string, period: Parts['period'], twelveHour: boolean) =>
  twelveHour ? (Number(hour) % 12) + (period === 'PM' ? 12 : 0) : Number(hour)

function toValue({ hour, minute, period }: Parts, twelveHour: boolean) {
  if (hour == null || minute == null) return null
  return `${pad(to24(hour, period, twelveHour))}:${minute}`
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours! * 60 + minutes!
}

const minuteOptions = (step: number) =>
  Array.from({ length: Math.ceil(60 / step) }, (_, i) => pad(i * step))

/** Whether a time is within `min` and `max` (`"HH:mm"`, both included). */
export function inTimeRange(time: string, min?: string | null, max?: string | null) {
  const t = toMinutes(time)
  return (!min || t >= toMinutes(min)) && (!max || t <= toMinutes(max))
}

/**
 * A time moved into `min` and `max`: the first option from `min` or the last
 * one up to `max`, on the minute steps. Null when no option is in the range.
 */
export function clampTime(
  time: string,
  { min, max, minuteStep = 5 }: { min?: string | null; max?: string | null; minuteStep?: number },
) {
  if (inTimeRange(time, min, max)) return time
  const options = Array.from({ length: 24 }, (_, h) =>
    minuteOptions(minuteStep).map((m) => `${pad(h)}:${m}`),
  )
    .flat()
    .filter((option) => inTimeRange(option, min, max))
  if (!options.length) return null
  return min && toMinutes(time) < toMinutes(min) ? options[0]! : options[options.length - 1]!
}

export interface TimePickerProps extends Omit<
  GetProps<typeof TimePickerFrame>,
  'children' | 'defaultValue'
> {
  /** 24-hour `"HH:mm"`, or null until an hour and a minute are picked. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** 12 shows AM/PM. Default 24. */
  hourCycle?: 12 | 24
  /** Minutes between options. Default 5. */
  minuteStep?: number
  /** The earliest time that can be picked, `"HH:mm"`. Earlier options are disabled. */
  min?: string | null
  /** The latest time that can be picked, `"HH:mm"`, from `min` on the same day. */
  max?: string | null
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  invalid?: boolean
  /** Put on the hour select, so a Field’s label targets it. */
  id?: string
  hourLabel?: string
  minuteLabel?: string
  periodLabel?: string
}

/**
 * Hour, minute and (for 12-hour time) AM/PM selects in a labelled group. Each
 * is a Select, so it is a listbox on web and a bottom sheet on phones.
 */
export const TimePicker = forwardRef<TamaguiElement, TimePickerProps>(
  function TimePicker(pickerProps, ref) {
    const {
      value,
      defaultValue = null,
      onValueChange,
      hourCycle = 24,
      minuteStep = 5,
      min,
      max,
      size = 'md',
      disabled = false,
      invalid = false,
      id,
      hourLabel = 'Hour',
      minuteLabel = 'Minute',
      periodLabel = 'AM or PM',
      'aria-label': ariaLabel,
      accessibilityHint,
      ...props
    } = useFieldControl(pickerProps)
    // Native: a group's name is never read (only focusable views are), so each
    // select carries it, as in "Start time, Hour". The hour select takes the
    // field's help text too.
    const partLabel = (part: string) => (isWeb || !ariaLabel ? part : `${ariaLabel}, ${part}`)
    const twelveHour = hourCycle === 12
    // Parts are kept apart from the value: an hour alone is not a time yet.
    const [parts, setParts] = useState(() => toParts(value ?? defaultValue, twelveHour))
    // When the controlled value changes from outside, take its parts (React's
    // "adjust state when a prop changes" pattern: during render, not in an effect).
    const [seenValue, setSeenValue] = useState(value)
    if (value !== seenValue) {
      setSeenValue(value)
      if (value !== undefined && value !== toValue(parts, twelveHour)) {
        setParts(toParts(value, twelveHour))
      }
    }

    const update = (patch: Partial<Parts>) => {
      let next = { ...parts, ...patch }
      const picked = toValue(next, twelveHour)
      // A new hour or period can leave the minute outside min and max: move
      // to the nearest time that can be picked, as a clock's wheels do.
      const clamped = picked && clampTime(picked, { min, max, minuteStep })
      if (picked && clamped && clamped !== picked) next = toParts(clamped, twelveHour)
      setParts(next)
      const nextValue = toValue(next, twelveHour)
      if (nextValue !== toValue(parts, twelveHour)) onValueChange?.(nextValue)
    }

    const hours = twelveHour
      ? Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i))
      : Array.from({ length: 24 }, (_, i) => pad(i))
    const minutes = minuteOptions(minuteStep)
    const limited = !!(min || max)
    const allowed = (hour24: number, minute: string) =>
      inTimeRange(`${pad(hour24)}:${minute}`, min, max)
    const hourAllowed = (hour24: number) => minutes.some((m) => allowed(hour24, m))
    const shared = { size, disabled, invalid, width: 'auto' as const }

    return (
      <TimePickerFrame ref={ref} aria-label={ariaLabel} {...props}>
        {/* The field's id and texts are on the hour select and this group already. */}
        <FieldContext.Provider value={null}>
          <Select
            {...shared}
            id={id}
            aria-label={partLabel(hourLabel)}
            accessibilityHint={accessibilityHint}
            placeholder="--"
            value={parts.hour ?? ''}
            onValueChange={(hour) => update({ hour })}
          >
            {hours.map((h) => (
              <Select.Item
                key={h}
                value={h}
                disabled={limited && !hourAllowed(to24(h, parts.period, twelveHour))}
              >
                {h}
              </Select.Item>
            ))}
          </Select>
          <Text aria-hidden color="mutedForeground" fontWeight="600">
            :
          </Text>
          <Select
            {...shared}
            aria-label={partLabel(minuteLabel)}
            placeholder="--"
            value={parts.minute ?? ''}
            onValueChange={(minute) => update({ minute })}
          >
            {minutes.map((m) => (
              <Select.Item
                key={m}
                value={m}
                // Until an hour is picked, any minute may still fit.
                disabled={
                  limited &&
                  parts.hour != null &&
                  !allowed(to24(parts.hour, parts.period, twelveHour), m)
                }
              >
                {m}
              </Select.Item>
            ))}
          </Select>
          {twelveHour ? (
            <Select
              {...shared}
              aria-label={partLabel(periodLabel)}
              value={parts.period}
              onValueChange={(period) => update({ period: period as Parts['period'] })}
            >
              {(['AM', 'PM'] as const).map((period) => (
                <Select.Item
                  key={period}
                  value={period}
                  disabled={
                    limited &&
                    !Array.from({ length: 12 }, (_, i) => i + (period === 'PM' ? 12 : 0)).some(
                      hourAllowed,
                    )
                  }
                >
                  {period}
                </Select.Item>
              ))}
            </Select>
          ) : null}
        </FieldContext.Provider>
      </TimePickerFrame>
    )
  },
)
