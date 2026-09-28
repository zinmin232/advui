import { ChevronLeftIcon, ChevronRightIcon } from '@advui/icons'
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import { type GetProps, type TamaguiElement, View, XStack, isWeb, styled } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { IconButton } from '../icon-button/IconButton'
import { Text } from '../typography/Text'
import {
  type DateRange,
  addDays,
  addMonths,
  clampDay,
  compareDays,
  isSameDay,
  isSameMonth,
  monthGrid,
  startOfDay,
  toISODate,
} from './dates'

const CalendarFrame = styled(View, {
  name: 'Calendar',
  gap: '$3',
  alignSelf: 'flex-start',
})

const DayCell = styled(View, {
  name: 'CalendarDay',
  width: '$9',
  height: '$9',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$md',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$muted' },
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 1,
  },

  variants: {
    selection: {
      none: {},
      // Ends of a range and the single selected day.
      end: {
        backgroundColor: '$primary',
        hoverStyle: { backgroundColor: '$primary' },
      },
      middle: {
        backgroundColor: '$accent',
        borderRadius: 0,
        hoverStyle: { backgroundColor: '$accent' },
      },
    },
    disabled: {
      true: { opacity: 0.4, cursor: 'not-allowed', hoverStyle: { backgroundColor: 'transparent' } },
    },
  } as const,

  defaultVariants: { selection: 'none' },
})

type SingleProps = {
  mode?: 'single'
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (value: Date | null) => void
}

type RangeProps = {
  mode: 'range'
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (value: DateRange) => void
}

type FrameProps = Omit<GetProps<typeof CalendarFrame>, 'children' | 'defaultValue'>

export type CalendarProps = FrameProps &
  (SingleProps | RangeProps) & {
    /** First day of the visible month (controlled). */
    month?: Date
    defaultMonth?: Date
    onMonthChange?: (month: Date) => void
    /** Earliest selectable day. */
    min?: Date
    /** Latest selectable day. */
    max?: Date
    /** Return true to make a day unselectable (weekends, booked days…). */
    isDateDisabled?: (date: Date) => boolean
    /** 0 = Sunday, 1 = Monday… Default 0. */
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    /** BCP 47 locale for month and day names. Defaults to the device locale. */
    locale?: string
    /** Override "today" (tests, screenshots). */
    today?: Date
    /** Accessible names of the month buttons. */
    previousMonthLabel?: string
    nextMonthLabel?: string
  }

const emptyRange: DateRange = { start: null, end: null }

/**
 * A month grid for picking a day or a range. On web it follows the WAI-ARIA
 * grid pattern: one Tab stop, arrow keys between days, Page Up / Page Down
 * between months. On native every day is a labelled button.
 */
export const Calendar = forwardRef<TamaguiElement, CalendarProps>(function Calendar(props, ref) {
  const {
    mode = 'single',
    value: valueProp,
    defaultValue,
    onValueChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    min,
    max,
    isDateDisabled,
    weekStartsOn = 0,
    locale,
    today: todayProp,
    previousMonthLabel = 'Previous month',
    nextMonthLabel = 'Next month',
    ...frameProps
  } = props
  const today = startOfDay(todayProp ?? new Date())

  // Both modes share one state; single mode stores its day as the range start.
  const toRange = (v: Date | DateRange | null | undefined): DateRange | undefined =>
    v === undefined ? undefined : v instanceof Date || v === null ? { start: v, end: null } : v
  const [range, setRange] = useControllableState<DateRange>({
    value: toRange(valueProp),
    defaultValue: toRange(defaultValue) ?? emptyRange,
    onChange: (next) =>
      mode === 'range'
        ? (onValueChange as RangeProps['onValueChange'])?.(next)
        : (onValueChange as SingleProps['onValueChange'])?.(next.start),
  })

  const initialDay = range.start ?? clampDay(today, min, max)
  const [month, setMonth] = useControllableState({
    value: monthProp,
    defaultValue: new Date(
      (defaultMonth ?? initialDay).getFullYear(),
      (defaultMonth ?? initialDay).getMonth(),
      1,
    ),
    onChange: onMonthChange,
  })
  const [focusedDay, setFocusedDay] = useState(initialDay)
  const pendingFocus = useRef(false)
  const dayRefs = useRef(new Map<string, HTMLElement>())
  const captionId = useId()

  const formats = useMemo(
    () => ({
      caption: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      day: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
    }),
    [locale],
  )

  const weeks = monthGrid(month, weekStartsOn)
  const isDisabled = (day: Date) =>
    (min != null && compareDays(day, min) < 0) ||
    (max != null && compareDays(day, max) > 0) ||
    !!isDateDisabled?.(day)
  // The one day that takes Tab focus: the focused day if it is in view.
  const tabDay = isSameMonth(focusedDay, month) ? focusedDay : month

  useEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    dayRefs.current.get(toISODate(focusedDay))?.focus()
  }, [focusedDay, month])

  const showMonth = (next: Date) => setMonth(new Date(next.getFullYear(), next.getMonth(), 1))
  const canGoBack = !min || compareDays(addDays(month, -1), min) >= 0
  const canGoForward = !max || compareDays(addMonths(month, 1), max) <= 0

  const select = (day: Date) => {
    if (isDisabled(day)) return
    setFocusedDay(day)
    if (mode === 'single') return setRange({ start: day, end: null })
    const { start, end } = range
    if (!start || end || compareDays(day, start) < 0) setRange({ start: day, end: null })
    else setRange({ start, end: day })
  }

  const moveFocus = (day: Date) => {
    const next = clampDay(day, min, max)
    pendingFocus.current = true
    setFocusedDay(next)
    if (!isSameMonth(next, month)) showMonth(next)
  }

  type DayKeyEvent = { key: string; shiftKey: boolean; preventDefault: () => void }
  const onDayKeyDown = (day: Date, event: DayKeyEvent) => {
    const offset = (day.getDay() - weekStartsOn + 7) % 7
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(day, -1),
      ArrowRight: () => addDays(day, 1),
      ArrowUp: () => addDays(day, -7),
      ArrowDown: () => addDays(day, 7),
      Home: () => addDays(day, -offset),
      End: () => addDays(day, 6 - offset),
      PageUp: () => addMonths(day, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(day, event.shiftKey ? 12 : 1),
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(day)
    } else if (moves[event.key]) {
      event.preventDefault()
      moveFocus(moves[event.key]!())
    }
  }

  const selectionOf = (day: Date) => {
    const { start, end } = range
    if (isSameDay(day, start) || isSameDay(day, end)) return 'end' as const
    if (start && end && compareDays(day, start) > 0 && compareDays(day, end) < 0)
      return 'middle' as const
    return 'none' as const
  }

  return (
    <CalendarFrame ref={ref} {...frameProps}>
      <XStack alignItems="center" justifyContent="space-between">
        <IconButton
          size="sm"
          variant="ghost"
          icon={<ChevronLeftIcon />}
          aria-label={previousMonthLabel}
          disabled={!canGoBack}
          onPress={() => showMonth(addMonths(month, -1))}
        />
        <Text id={captionId} size="sm" weight="semibold" aria-live="polite">
          {formats.caption.format(month)}
        </Text>
        <IconButton
          size="sm"
          variant="ghost"
          icon={<ChevronRightIcon />}
          aria-label={nextMonthLabel}
          disabled={!canGoForward}
          onPress={() => showMonth(addMonths(month, 1))}
        />
      </XStack>

      <View role={isWeb ? 'grid' : undefined} aria-labelledby={captionId} gap="$1">
        <XStack role={isWeb ? 'row' : undefined}>
          {weeks[0]!.map((day) => (
            <View
              key={day.getDay()}
              role={isWeb ? 'columnheader' : undefined}
              aria-label={formats.weekdayLong.format(day)}
              width="$9"
              alignItems="center"
            >
              <Text size="xs" tone="muted" aria-hidden>
                {formats.weekdayShort.format(day)}
              </Text>
            </View>
          ))}
        </XStack>
        {weeks.map((week) => (
          <XStack key={toISODate(week[0]!)} role={isWeb ? 'row' : undefined}>
            {week.map((day) => {
              const iso = toISODate(day)
              if (!isSameMonth(day, month)) {
                return (
                  <View
                    key={iso}
                    role={(isWeb ? 'gridcell' : undefined) as never}
                    width="$9"
                    height="$9"
                  />
                )
              }
              const selection = selectionOf(day)
              const selected = selection !== 'none'
              const disabled = isDisabled(day)
              const isToday = isSameDay(day, today)
              return (
                <DayCell
                  key={iso}
                  ref={(node: TamaguiElement | null) => {
                    if (node) dayRefs.current.set(iso, node as unknown as HTMLElement)
                    else dayRefs.current.delete(iso)
                  }}
                  selection={selection}
                  disabled={disabled}
                  role={(isWeb ? 'gridcell' : 'button') as never}
                  // Native views with a role need `accessible` to be announced.
                  {...(!isWeb && { accessible: true })}
                  aria-label={formats.day.format(day)}
                  aria-selected={selected}
                  aria-disabled={disabled || undefined}
                  aria-current={isToday ? 'date' : undefined}
                  {...(isWeb && {
                    tabIndex: isSameDay(day, tabDay) ? 0 : -1,
                    onKeyDown: (event: DayKeyEvent) => onDayKeyDown(day, event),
                    onFocus: () => setFocusedDay(day),
                  })}
                  onPress={() => select(day)}
                >
                  <Text
                    size="sm"
                    {...(isToday && { weight: 'semibold' as const })}
                    color={
                      selection === 'end'
                        ? '$primaryForeground'
                        : selection === 'middle'
                          ? '$accentForeground'
                          : isToday
                            ? '$primaryText'
                            : '$foreground'
                    }
                  >
                    {day.getDate()}
                  </Text>
                </DayCell>
              )
            })}
          </XStack>
        ))}
      </View>
    </CalendarFrame>
  )
})
