import { forwardRef, useState } from 'react'
import { type GetProps, type TamaguiElement, Text, XStack, styled } from 'tamagui'
import { Select } from '../select/Select'

const TimePickerFrame = styled(XStack, {
  name: 'TimePicker',
  role: 'group',
  alignItems: 'center',
  gap: '$2',
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

function toValue({ hour, minute, period }: Parts, twelveHour: boolean) {
  if (hour == null || minute == null) return null
  const h = twelveHour ? (Number(hour) % 12) + (period === 'PM' ? 12 : 0) : Number(hour)
  return `${pad(h)}:${minute}`
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
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  invalid?: boolean
  /** Put on the hour select, so a Form Field label targets it. */
  id?: string
  hourLabel?: string
  minuteLabel?: string
  periodLabel?: string
}

/**
 * Hour, minute and (for 12-hour time) AM/PM selects in a labelled group. Each
 * is a Select, so it is a listbox on web and a bottom sheet on phones.
 */
export const TimePicker = forwardRef<TamaguiElement, TimePickerProps>(function TimePicker(
  {
    value,
    defaultValue = null,
    onValueChange,
    hourCycle = 24,
    minuteStep = 5,
    size = 'md',
    disabled = false,
    invalid = false,
    id,
    hourLabel = 'Hour',
    minuteLabel = 'Minute',
    periodLabel = 'AM or PM',
    ...props
  },
  ref,
) {
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
    const next = { ...parts, ...patch }
    setParts(next)
    const nextValue = toValue(next, twelveHour)
    if (nextValue !== toValue(parts, twelveHour)) onValueChange?.(nextValue)
  }

  const hours = twelveHour
    ? Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i))
    : Array.from({ length: 24 }, (_, i) => pad(i))
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => pad(i * minuteStep))
  const shared = { size, disabled, invalid, width: 'auto' as const }

  return (
    <TimePickerFrame ref={ref} {...props}>
      <Select
        {...shared}
        id={id}
        aria-label={hourLabel}
        placeholder="--"
        value={parts.hour ?? ''}
        onValueChange={(hour) => update({ hour })}
      >
        {hours.map((h) => (
          <Select.Item key={h} value={h}>
            {h}
          </Select.Item>
        ))}
      </Select>
      <Text aria-hidden color="$mutedForeground" fontWeight="600">
        :
      </Text>
      <Select
        {...shared}
        aria-label={minuteLabel}
        placeholder="--"
        value={parts.minute ?? ''}
        onValueChange={(minute) => update({ minute })}
      >
        {minutes.map((m) => (
          <Select.Item key={m} value={m}>
            {m}
          </Select.Item>
        ))}
      </Select>
      {twelveHour ? (
        <Select
          {...shared}
          aria-label={periodLabel}
          value={parts.period}
          onValueChange={(period) => update({ period: period as Parts['period'] })}
        >
          <Select.Item value="AM">AM</Select.Item>
          <Select.Item value="PM">PM</Select.Item>
        </Select>
      ) : null}
    </TimePickerFrame>
  )
})
