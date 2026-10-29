import { type ReactNode, useMemo } from 'react'
import { type ColorTokens, type GetProps, View, isWeb, styled } from 'tamagui/unstyled'
import { VisuallyHidden, useRipple } from '@advui/core'
import type { CalendarEvent, CalendarEventTone } from './events'

export type EventCalendarView = 'month' | 'week' | 'day' | 'agenda'

export interface EventCalendarLabels {
  today: string
  /** Read after today's date on iOS and Android, which have no `aria-current`. */
  todayMarker: string
  previousMonth: string
  nextMonth: string
  previousWeek: string
  nextWeek: string
  previousDay: string
  nextDay: string
  /** Names the view switcher. */
  view: string
  month: string
  week: string
  day: string
  agenda: string
  allDay: string
  /** Joins two times or days in event names: “9:00 AM to 10:00 AM”. */
  to: string
  /** A day's event count, in its name. */
  events: (count: number) => string
  /** Events a month day has no room for: “2 more”. */
  more: (count: number) => string
  /** The agenda of a month with no events. */
  noEvents: string
}

export const defaultLabels: EventCalendarLabels = {
  today: 'Today',
  todayMarker: 'today',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousWeek: 'Previous week',
  nextWeek: 'Next week',
  previousDay: 'Previous day',
  nextDay: 'Next day',
  view: 'View',
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'Agenda',
  allDay: 'All day',
  to: 'to',
  events: (count) => (count === 0 ? 'no events' : count === 1 ? '1 event' : `${count} events`),
  more: (count) => `${count} more`,
  noEvents: 'No events this month',
}

/** Soft fills with their text color, and a solid dot for small screens. */
export const tones: Record<
  CalendarEventTone,
  { background: ColorTokens; color: ColorTokens; dot: ColorTokens }
> = {
  primary: { background: 'primarySoft', color: 'primarySoftForeground', dot: 'primary' },
  success: { background: 'successSoft', color: 'successSoftForeground', dot: 'success' },
  warning: { background: 'warningSoft', color: 'warningSoftForeground', dot: 'warning' },
  error: { background: 'errorSoft', color: 'errorSoftForeground', dot: 'error' },
  info: { background: 'infoSoft', color: 'infoSoftForeground', dot: 'info' },
  neutral: { background: 'muted', color: 'foreground', dot: 'mutedForeground' },
}

export function useFormats(locale: string | undefined) {
  return useMemo(() => {
    const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options)
    return {
      month: format({ month: 'long', year: 'numeric' }),
      day: format({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      agendaDay: format({ weekday: 'short', month: 'short', day: 'numeric' }),
      monthDay: format({ month: 'short', day: 'numeric' }),
      monthDayYear: format({ month: 'short', day: 'numeric', year: 'numeric' }),
      weekdayShort: format({ weekday: 'short' }),
      weekdayLong: format({ weekday: 'long' }),
      time: format({ hour: 'numeric', minute: '2-digit' }),
      hour: format({ hour: 'numeric' }),
    }
  }, [locale])
}

export type Formats = ReturnType<typeof useFormats>

/** What every view needs from the root. */
export interface ViewContext {
  events: readonly CalendarEvent[]
  today: Date
  weekStartsOn: number
  formats: Formats
  labels: EventCalendarLabels
  /** Pressing a day opens it: the day view, `onDatePress`, or both. */
  openDay: ((day: Date) => void) | null
  onEventPress: ((event: CalendarEvent) => void) | null
  eventLabel: (event: CalendarEvent) => string
}

/** A web-only role: iOS and Android have no table or group roles. */
export const webRole = <T extends string>(role: T) => (isWeb ? role : undefined) as never

/**
 * Props that make a View a real button on web and an accessible one on
 * native. Set the padding yourself: a button has its own, and `padding`
 * here would replace a variant's.
 */
export const buttonProps = (label: string) =>
  ({
    render: 'button',
    role: 'button',
    'aria-label': label,
    cursor: 'pointer',
    ...(isWeb
      ? {
          type: 'button',
          borderWidth: 0,
          backgroundColor: 'transparent',
          // A button centers its text; events read from the start.
          style: { textAlign: 'left' as const },
        }
      : { accessible: true }),
  }) as const

const EventFrame = styled(View, {
  displayName: 'EventCalendarEvent',
  borderRadius: 'sm',
  outlineColor: 'focus-visible:ring',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:2px',
  outlineOffset: 'focus-visible:1px',
  variants: {
    variant: {
      // One line in a month day or the all-day row.
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: '5',
        paddingHorizontal: '1',
        paddingVertical: 0,
      },
      // Placed on the hours of the week and day views.
      block: {
        flex: 1,
        paddingHorizontal: '1',
        paddingVertical: '0-5',
        overflow: 'hidden',
      },
      // A line of the agenda.
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '2',
        minHeight: '9 touchable:11',
        paddingHorizontal: '2',
        paddingVertical: 0,
        borderRadius: 'md',
      },
    },
  } as const,
})

export interface EventButtonProps extends Omit<GetProps<typeof EventFrame>, 'onPress'> {
  event: CalendarEvent
  label: string
  onPress: ((event: CalendarEvent) => void) | null
  children: ReactNode
}

/**
 * An event: a button when `onEventPress` is set, else its name in hidden
 * text, with what it shows hidden from screen readers.
 */
export function EventButton({
  event,
  label,
  onPress,
  variant = 'chip',
  children,
  ...props
}: EventButtonProps) {
  const tone = tones[event.tone ?? 'primary']
  const ripple = useRipple({ color: tone.color, disabled: !onPress })
  const filled = variant !== 'row'
  const background = filled
    ? tone.background
    : onPress
      ? `transparent hover:accent${ripple.active ? '' : ' press:accentHover'}`
      : 'transparent'
  if (!onPress) {
    return (
      <EventFrame variant={variant} backgroundColor={background as ColorTokens} {...props}>
        <VisuallyHidden>{label}</VisuallyHidden>
        <View
          aria-hidden
          flexDirection={variant === 'block' ? 'column' : 'row'}
          {...rowLayout(variant)}
        >
          {children}
        </View>
      </EventFrame>
    )
  }
  return (
    <EventFrame
      variant={variant}
      {...buttonProps(label)}
      // After buttonProps, which clears a button's own background on web.
      backgroundColor={background as ColorTokens}
      {...(filled && { opacity: ripple.active ? 'press:1' : 'hover:0.85 press:0.75' })}
      onPress={() => onPress(event)}
      {...props}
      {...ripple.props}
    >
      {ripple.element}
      {children}
    </EventFrame>
  )
}

/** The hidden-label version wraps the content: it keeps the frame's layout. */
const rowLayout = (variant: EventButtonProps['variant']) =>
  variant === 'block'
    ? { flex: 1 }
    : {
        flex: 1,
        alignItems: 'center' as const,
        gap: variant === 'row' ? ('2' as const) : undefined,
      }
