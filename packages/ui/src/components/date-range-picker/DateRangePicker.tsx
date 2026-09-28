import { forwardRef } from 'react'
import type { TamaguiElement } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { Calendar } from '../calendar/Calendar'
import type { DateRange } from '../calendar/dates'
import type { DatePickerProps } from '../date-picker/DatePicker'
import { PickerTrigger } from '../date-picker/PickerTrigger'
import { Popover } from '../popover/Popover'

export interface DateRangePickerProps extends Omit<
  DatePickerProps,
  'value' | 'defaultValue' | 'onValueChange'
> {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (value: DateRange) => void
}

const emptyRange: DateRange = { start: null, end: null }

/**
 * A field that opens a range Calendar: the first press picks the start, the
 * second the end, and then the panel closes.
 */
export const DateRangePicker = forwardRef<TamaguiElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      defaultValue = emptyRange,
      onValueChange,
      open,
      defaultOpen = false,
      onOpenChange,
      placeholder = 'Pick dates',
      formatOptions = { dateStyle: 'medium' },
      title = 'Choose dates',
      min,
      max,
      isDateDisabled,
      weekStartsOn,
      locale,
      today,
      ...triggerProps
    },
    ref,
  ) {
    const [range, setRange] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange,
    })
    const [isOpen, setOpen] = useControllableState({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    })
    const format = new Intl.DateTimeFormat(locale, formatOptions)
    const text = range.start
      ? range.end
        ? // Hermes may lack formatRange.
          typeof format.formatRange === 'function'
          ? format.formatRange(range.start, range.end)
          : `${format.format(range.start)} – ${format.format(range.end)}`
        : `${format.format(range.start)} –`
      : null

    return (
      <Popover open={isOpen} onOpenChange={setOpen} align="start">
        <Popover.Trigger asChild>
          <PickerTrigger ref={ref} valueText={text} placeholder={placeholder} {...triggerProps} />
        </Popover.Trigger>
        <Popover.Content width="auto">
          <Popover.Title>{title}</Popover.Title>
          <Calendar
            alignSelf="center"
            mode="range"
            value={range}
            onValueChange={(next) => {
              setRange(next)
              if (next.start && next.end) setOpen(false)
            }}
            {...{ min, max, isDateDisabled, locale, today }}
            {...(weekStartsOn !== undefined && { weekStartsOn })}
          />
        </Popover.Content>
      </Popover>
    )
  },
)
