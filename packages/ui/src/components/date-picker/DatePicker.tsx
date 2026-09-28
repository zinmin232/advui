import { forwardRef } from 'react'
import type { TamaguiElement } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { Calendar, type CalendarProps } from '../calendar/Calendar'
import { Popover } from '../popover/Popover'
import { PickerTrigger, type PickerTriggerProps } from './PickerTrigger'

type CalendarOptions = Pick<
  CalendarProps,
  'min' | 'max' | 'isDateDisabled' | 'weekStartsOn' | 'locale' | 'today'
>

export interface DatePickerProps
  extends Omit<PickerTriggerProps, 'valueText' | 'placeholder' | 'defaultValue'>, CalendarOptions {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (value: Date | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  /** How the picked day is written in the field. Default `{ dateStyle: 'medium' }`. */
  formatOptions?: Intl.DateTimeFormatOptions
  /** Title of the calendar panel, which names it for screen readers. */
  title?: string
}

/**
 * A field that opens a Calendar in a popover (a bottom sheet on phones) and
 * closes once a day is picked.
 */
export const DatePicker = forwardRef<TamaguiElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue = null,
    onValueChange,
    open,
    defaultOpen = false,
    onOpenChange,
    placeholder = 'Pick a date',
    formatOptions = { dateStyle: 'medium' },
    title = 'Choose a date',
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
  const [date, setDate] = useControllableState({
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

  return (
    <Popover open={isOpen} onOpenChange={setOpen} align="start">
      <Popover.Trigger asChild>
        <PickerTrigger
          ref={ref}
          valueText={date ? format.format(date) : null}
          placeholder={placeholder}
          {...triggerProps}
        />
      </Popover.Trigger>
      <Popover.Content width="auto">
        <Popover.Title>{title}</Popover.Title>
        <Calendar
          alignSelf="center"
          value={date}
          onValueChange={(next) => {
            setDate(next)
            setOpen(false)
          }}
          {...{ min, max, isDateDisabled, locale, today }}
          {...(weekStartsOn !== undefined && { weekStartsOn })}
        />
      </Popover.Content>
    </Popover>
  )
})
