import { ChevronLeftIcon, ChevronRightIcon } from '@advui/icons'
import { forwardRef } from 'react'
import { type GetProps, type TamaguiElement, View, XStack, styled } from 'tamagui/unstyled'
import { Button, IconButton, Text, ToggleGroup, useControllableState } from '@advui/core'
import { AgendaView } from './AgendaView'
import { addDays, addMonths, isSameDay, startOfDay, weekDays } from './dates'
import { type CalendarEvent, eventEnd } from './events'
import { MonthView } from './MonthView'
import {
  type EventCalendarLabels,
  type EventCalendarView,
  type ViewContext,
  defaultLabels,
  useFormats,
} from './parts'
import { TimeGrid } from './TimeGrid'

const EventCalendarFrame = styled(View, {
  displayName: 'EventCalendar',
  gap: '3',
})

const allViews: EventCalendarView[] = ['month', 'week', 'day', 'agenda']

export interface EventCalendarProps extends Omit<
  GetProps<typeof EventCalendarFrame>,
  'children' | 'defaultValue'
> {
  events: readonly CalendarEvent[]
  /** The view shown (controlled). */
  view?: EventCalendarView
  defaultView?: EventCalendarView
  onViewChange?: (view: EventCalendarView) => void
  /** The views to switch between, in order. Default: all four. */
  views?: EventCalendarView[]
  /** A day in the shown month, week or day (controlled). */
  date?: Date
  /** Default: today. */
  defaultDate?: Date
  onDateChange?: (date: Date) => void
  /** Makes events buttons. */
  onEventPress?: (event: CalendarEvent) => void
  /**
   * Called when a day is pressed: a month day's number, or a week day's
   * heading. With the day view among `views`, that day opens there too.
   */
  onDatePress?: (date: Date) => void
  /** 0 = Sunday, 1 = Monday… Default 0. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** BCP 47 locale for dates and times. Defaults to the device locale. */
  locale?: string
  /** Override "today" (tests, screenshots). */
  today?: Date
  /** Lines of events a month day shows before “+2 more”. Default 3. */
  maxEventsPerDay?: number
  /** Height of the scrolling hours in the week and day views. Default `128`. */
  timeGridHeight?: GetProps<typeof View>['height']
  /** The hour at the top when the week or day view opens. Default 8. */
  scrollToHour?: number
  labels?: Partial<EventCalendarLabels>
}

/**
 * Events on a month grid, a week or a day of hours, or an agenda list, with
 * Today, previous and next, and a view switcher.
 */
export const EventCalendar = forwardRef<TamaguiElement, EventCalendarProps>(function EventCalendar(
  {
    events,
    view: viewProp,
    defaultView = 'month',
    onViewChange,
    views = allViews,
    date: dateProp,
    defaultDate,
    onDateChange,
    onEventPress,
    onDatePress,
    weekStartsOn = 0,
    locale,
    today: todayProp,
    maxEventsPerDay = 3,
    timeGridHeight = '128',
    scrollToHour = 8,
    labels: labelsProp,
    ...props
  },
  ref,
) {
  const today = startOfDay(todayProp ?? new Date())
  const labels = { ...defaultLabels, ...labelsProp }
  const formats = useFormats(locale)
  const [view, setView] = useControllableState({
    value: viewProp,
    defaultValue: defaultView,
    onChange: onViewChange,
  })
  const [date, setDate] = useControllableState({
    value: dateProp,
    defaultValue: startOfDay(defaultDate ?? today),
    onChange: onDateChange,
  })

  const hasDayView = views.includes('day')
  const openDay =
    hasDayView || onDatePress
      ? (day: Date) => {
          onDatePress?.(day)
          if (!hasDayView) return
          setDate(day)
          setView('day')
        }
      : null

  const eventLabel = (event: CalendarEvent) => {
    const end = eventEnd(event)
    const startDay = formats.day.format(event.start)
    if (event.allDay) {
      const days = isSameDay(event.start, end)
        ? startDay
        : `${startDay} ${labels.to} ${formats.day.format(end)}`
      return `${event.title}, ${labels.allDay}, ${days}`
    }
    const from = formats.time.format(event.start)
    const until = formats.time.format(end)
    return isSameDay(event.start, end)
      ? `${event.title}, ${startDay}, ${from} ${labels.to} ${until}`
      : `${event.title}, ${startDay} ${from} ${labels.to} ${formats.day.format(end)} ${until}`
  }

  const context: ViewContext = {
    events,
    today,
    weekStartsOn,
    formats,
    labels,
    openDay,
    onEventPress: onEventPress ?? null,
    eventLabel,
  }

  const week = weekDays(date, weekStartsOn)
  const title =
    view === 'week'
      ? `${formats.monthDay.format(week[0]!)} – ${formats.monthDayYear.format(week[6]!)}`
      : view === 'day'
        ? formats.day.format(date)
        : formats.month.format(date)
  const step = (direction: 1 | -1) =>
    setDate(
      view === 'week'
        ? addDays(date, 7 * direction)
        : view === 'day'
          ? addDays(date, direction)
          : addMonths(date, direction),
    )
  const [previousLabel, nextLabel] =
    view === 'week'
      ? [labels.previousWeek, labels.nextWeek]
      : view === 'day'
        ? [labels.previousDay, labels.nextDay]
        : [labels.previousMonth, labels.nextMonth]

  return (
    <EventCalendarFrame ref={ref} {...props}>
      <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="2">
        <XStack alignItems="center" gap="1" flexShrink={1}>
          <Button size="sm" variant="outline" onPress={() => setDate(today)}>
            {labels.today}
          </Button>
          <IconButton
            size="sm"
            variant="ghost"
            icon={<ChevronLeftIcon />}
            aria-label={previousLabel}
            onPress={() => step(-1)}
          />
          <IconButton
            size="sm"
            variant="ghost"
            icon={<ChevronRightIcon />}
            aria-label={nextLabel}
            onPress={() => step(1)}
          />
          <Text size="lg" weight="semibold" marginLeft="1" flexShrink={1} aria-live="polite">
            {title}
          </Text>
        </XStack>
        {views.length > 1 ? (
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={view}
            // Pressing the shown view again keeps it.
            onValueChange={(next) => next && setView(next as EventCalendarView)}
            aria-label={labels.view}
          >
            {views.map((name) => (
              <ToggleGroup.Item key={name} value={name}>
                {labels[name]}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        ) : null}
      </XStack>
      {view === 'month' ? (
        <MonthView month={date} maxEventsPerDay={maxEventsPerDay} {...context} />
      ) : view === 'agenda' ? (
        <AgendaView month={date} {...context} />
      ) : (
        <TimeGrid
          // A new view opens at `scrollToHour`; moving by week or day keeps the place.
          key={view}
          days={view === 'week' ? week : [date]}
          height={timeGridHeight}
          scrollToHour={scrollToHour}
          {...context}
        />
      )}
    </EventCalendarFrame>
  )
})
