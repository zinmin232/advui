import { View, XStack, isWeb } from 'tamagui/unstyled'
import { Hide, Show, Text, VisuallyHidden } from '@advui/core'
import { dayKey, isSameDay, isSameMonth, monthWeeks } from './dates'
import { eventsOnDay } from './events'
import { EventButton, type ViewContext, buttonProps, tones, webRole } from './parts'

export interface MonthViewProps extends ViewContext {
  month: Date
  maxEventsPerDay: number
}

/**
 * Four to six weeks of days, each with its first events. Phones show a dot
 * per event instead: the day's number opens it, or the agenda lists them.
 */
export function MonthView({ month, maxEventsPerDay, ...context }: MonthViewProps) {
  const { formats, weekStartsOn } = context
  const weeks = monthWeeks(month, weekStartsOn)
  return (
    <View
      role={webRole('table')}
      aria-label={formats.month.format(month)}
      borderWidth={1}
      borderColor="border"
      borderRadius="lg"
      overflow="hidden"
    >
      <XStack
        role={webRole('row')}
        backgroundColor="muted"
        borderBottomWidth={1}
        borderColor="border"
      >
        {weeks[0]!.map((day) => (
          <View
            key={day.getDay()}
            role={webRole('columnheader')}
            aria-label={formats.weekdayLong.format(day)}
            flex={1}
            flexBasis={0}
            alignItems="center"
            paddingVertical="1-5"
          >
            <Text size="xs" weight="medium" tone="muted" aria-hidden>
              {formats.weekdayShort.format(day)}
            </Text>
          </View>
        ))}
      </XStack>
      {weeks.map((week, row) => (
        <XStack
          key={dayKey(week[0]!)}
          role={webRole('row')}
          {...(row < weeks.length - 1 && { borderBottomWidth: 1, borderColor: 'border' })}
        >
          {week.map((day, column) => (
            <MonthDay
              key={dayKey(day)}
              day={day}
              inMonth={isSameMonth(day, month)}
              last={column === 6}
              maxEvents={maxEventsPerDay}
              {...context}
            />
          ))}
        </XStack>
      ))}
    </View>
  )
}

function MonthDay({
  day,
  inMonth,
  last,
  maxEvents,
  events,
  today,
  formats,
  labels,
  openDay,
  onEventPress,
  eventLabel,
}: ViewContext & { day: Date; inMonth: boolean; last: boolean; maxEvents: number }) {
  const dayEvents = eventsOnDay(events, day)
  const isToday = isSameDay(day, today)
  // One line fewer when a "more" line is needed, so a day never grows past
  // its first `maxEvents` lines.
  const shown = dayEvents.length > maxEvents ? dayEvents.slice(0, maxEvents - 1) : dayEvents
  const hidden = dayEvents.length - shown.length
  const name = `${formats.day.format(day)}${isToday && !isWeb ? `, ${labels.todayMarker}` : ''}, ${labels.events(dayEvents.length)}`
  const number = (
    <Text
      size="xs"
      weight={isToday ? 'semibold' : 'medium'}
      color={isToday ? 'primaryForeground' : inMonth ? 'foreground' : 'mutedForeground'}
      aria-hidden
    >
      {day.getDate()}
    </Text>
  )
  return (
    <View
      role={webRole('cell')}
      flex={1}
      flexBasis={0}
      minWidth={0}
      minHeight="16 sm:24"
      padding="1"
      gap="0-5"
      {...(!last && { borderRightWidth: 1, borderColor: 'border' })}
    >
      {openDay ? (
        <View
          {...buttonProps(name)}
          aria-current={isToday ? 'date' : undefined}
          onPress={() => openDay(day)}
          width="7"
          height="7"
          padding={0}
          alignSelf="flex-start"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          // After buttonProps, which clears a button's own background on web.
          backgroundColor={isToday ? 'primary' : 'transparent hover:accent press:accentHover'}
          outlineColor="focus-visible:ring"
          outlineStyle="focus-visible:solid"
          outlineWidth="focus-visible:2px"
          {...(!isWeb && { hitSlop: 8 })}
        >
          {number}
        </View>
      ) : (
        <View
          width="7"
          height="7"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          {...(isToday && { backgroundColor: 'primary' })}
        >
          {number}
          <VisuallyHidden>{name}</VisuallyHidden>
        </View>
      )}
      <Hide below="sm">
        {shown.map((event) => {
          const tone = tones[event.tone ?? 'primary']
          return (
            <EventButton
              key={event.id}
              event={event}
              label={eventLabel(event)}
              onPress={onEventPress}
            >
              <Text size="xs" color={tone.color} truncate flex={1}>
                {event.title}
              </Text>
            </EventButton>
          )
        })}
        {hidden > 0 ? (
          openDay ? (
            <View
              {...buttonProps(`${labels.more(hidden)}, ${formats.day.format(day)}`)}
              onPress={() => openDay(day)}
              alignSelf="flex-start"
              paddingHorizontal="1"
              paddingVertical={0}
              borderRadius="sm"
              backgroundColor="transparent hover:accent press:accentHover"
              outlineColor="focus-visible:ring"
              outlineStyle="focus-visible:solid"
              outlineWidth="focus-visible:2px"
            >
              <Text size="xs" weight="medium" tone="muted" aria-hidden>
                +{labels.more(hidden)}
              </Text>
            </View>
          ) : (
            <Text size="xs" tone="muted" paddingHorizontal="1">
              +{labels.more(hidden)}
            </Text>
          )
        ) : null}
      </Hide>
      <Show below="sm">
        {dayEvents.length ? (
          // The day's name counts them; the dots only show they are there.
          <XStack gap="0-5" flexWrap="wrap" paddingHorizontal="1" aria-hidden>
            {dayEvents.slice(0, 4).map((event) => (
              <View
                key={event.id}
                width="1-5"
                height="1-5"
                borderRadius="full"
                backgroundColor={tones[event.tone ?? 'primary'].dot}
              />
            ))}
          </XStack>
        ) : null}
      </Show>
    </View>
  )
}
