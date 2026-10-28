import { forwardRef, useContext, useId, useState } from 'react'
import { type GetProps, type TamaguiElement, View, isWeb, styled } from 'tamagui/unstyled'
import { FieldContext, useFieldControl } from '../../hooks/useFieldControl'
import { startOfDay } from '../calendar/dates'
import { DatePicker, type DatePickerProps } from '../date-picker/DatePicker'
import { TimePicker, type TimePickerProps } from '../time-picker/TimePicker'

const DateTimePickerFrame = styled(View, {
  displayName: 'DateTimePicker',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '2',
})

type Parts = { date: Date | null; time: string | null }

const pad = (n: number) => String(n).padStart(2, '0')

function toParts(value: Date | null | undefined): Parts {
  if (!value) return { date: null, time: null }
  return {
    date: startOfDay(value),
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}`,
  }
}

function toValue({ date, time }: Parts) {
  if (!date || !time) return null
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes)
}

const sameInstant = (a: Date | null | undefined, b: Date | null | undefined) =>
  (a?.getTime() ?? null) === (b?.getTime() ?? null)

type DateOptions = Pick<
  DatePickerProps,
  | 'min'
  | 'max'
  | 'isDateDisabled'
  | 'weekStartsOn'
  | 'locale'
  | 'today'
  | 'placeholder'
  | 'formatOptions'
  | 'title'
>

type TimeOptions = Pick<
  TimePickerProps,
  'hourCycle' | 'minuteStep' | 'hourLabel' | 'minuteLabel' | 'periodLabel'
>

export interface DateTimePickerProps
  extends
    Omit<GetProps<typeof DateTimePickerFrame>, 'children' | 'defaultValue' | 'disabled'>,
    DateOptions,
    TimeOptions {
  /** The picked day and time, or null until both are picked. */
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (value: Date | null) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  invalid?: boolean
  /** Put on the date field, so a Field's label targets it. */
  id?: string
  /** Accessible name of the date field. Default "Date". */
  dateLabel?: string
  /** Accessible name of the time selects' group. Default "Time". */
  timeLabel?: string
  'aria-describedby'?: string
  'aria-required'?: boolean | 'true' | 'false'
}

/**
 * A Date Picker and a Time Picker side by side that make one `Date`. Each
 * part opens its own panel, so no overlay opens inside another.
 */
export const DateTimePicker = forwardRef<TamaguiElement, DateTimePickerProps>(
  function DateTimePicker(pickerProps, ref) {
    const field = useContext(FieldContext)
    const {
      value,
      defaultValue = null,
      onValueChange,
      size = 'md',
      disabled = false,
      invalid = false,
      id,
      dateLabel = 'Date',
      timeLabel = 'Time',
      min,
      max,
      isDateDisabled,
      weekStartsOn,
      locale,
      today,
      placeholder,
      formatOptions,
      title,
      hourCycle,
      minuteStep,
      hourLabel,
      minuteLabel,
      periodLabel,
      'aria-label': label,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
      // aria-required is not allowed on a group or a button. The Field's
      // label still shows the marker; say what is required in its help text.
      'aria-required': _ariaRequired,
      accessibilityHint,
      ...props
    } = useFieldControl(pickerProps)
    const ownId = useId()
    const dateId = id ?? ownId
    // Parts are kept apart from the value: a day alone is not a time yet.
    const [parts, setParts] = useState(() => toParts(value ?? defaultValue))
    // When the controlled value changes from outside, take its parts (during
    // render, as Time Picker does).
    const [seenValue, setSeenValue] = useState(value)
    if (value !== seenValue) {
      setSeenValue(value)
      if (value !== undefined && !sameInstant(value, toValue(parts))) {
        setParts(toParts(value))
      }
    }

    const update = (patch: Partial<Parts>) => {
      const next = { ...parts, ...patch }
      setParts(next)
      const nextValue = toValue(next)
      if (!sameInstant(nextValue, toValue(parts))) onValueChange?.(nextValue)
    }

    const shared = { size, disabled, invalid }
    // Native reads no group names (only focusable views), so each part
    // carries the field's name, as in "Starts, Date" and "Starts, Hour".
    const nativeName = (part: string) => (label ? `${label}, ${part}` : part)

    return (
      <DateTimePickerFrame
        ref={ref}
        {...(isWeb && {
          role: 'group',
          'aria-label': label,
          // A <label for> cannot name a group, so a Field's label is linked by id.
          'aria-labelledby': labelledBy ?? (label === undefined ? field?.labelId : undefined),
        })}
        {...props}
      >
        {/* The field's id and texts are passed to the parts below already. */}
        <FieldContext.Provider value={null}>
          <DatePicker
            {...shared}
            id={dateId}
            {...(isWeb
              ? {
                  'aria-label': dateLabel,
                  // Points at itself, so its own name stays when a Field's
                  // Label puts its id in front: "Starts Date".
                  'aria-labelledby': dateId,
                  'aria-describedby': describedBy,
                }
              : { 'aria-label': nativeName(dateLabel), accessibilityHint })}
            flexGrow={1}
            minWidth="40"
            value={parts.date}
            onValueChange={(date) => update({ date })}
            {...{ min, max, isDateDisabled, locale, today, placeholder, formatOptions, title }}
            {...(weekStartsOn !== undefined && { weekStartsOn })}
          />
          <TimePicker
            {...shared}
            aria-label={isWeb ? timeLabel : label}
            aria-describedby={describedBy}
            accessibilityHint={accessibilityHint}
            value={parts.time}
            onValueChange={(time) => update({ time })}
            {...{ hourCycle, minuteStep, hourLabel, minuteLabel, periodLabel }}
          />
        </FieldContext.Provider>
      </DateTimePickerFrame>
    )
  },
)
