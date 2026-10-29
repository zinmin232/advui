import { View, XStack } from 'tamagui/unstyled'
import { Text, VStack } from '@advui/core'
import { dayKey, isSameDay, monthDays } from './dates'
import { eventEnd, eventsOnDay } from './events'
import { EventButton, type ViewContext, tones } from './parts'

/** The month's days that have events, as a list: it suits phones and screen readers. */
export function AgendaView({ month, ...context }: ViewContext & { month: Date }) {
  const { events, today, formats, labels, onEventPress, eventLabel } = context
  const days = monthDays(month)
    .map((day) => ({ day, events: eventsOnDay(events, day) }))
    .filter((entry) => entry.events.length)

  if (!days.length) {
    return (
      <View alignItems="center" padding="6" borderWidth={1} borderColor="border" borderRadius="lg">
        <Text size="sm" tone="muted">
          {labels.noEvents}
        </Text>
      </View>
    )
  }

  return (
    <VStack borderWidth={1} borderColor="border" borderRadius="lg" overflow="hidden">
      {days.map(({ day, events: dayEvents }, index) => {
        const isToday = isSameDay(day, today)
        return (
          <XStack
            key={dayKey(day)}
            gap="3"
            padding="2"
            {...(index > 0 && { borderTopWidth: 1, borderColor: 'border' })}
          >
            <View width="24" paddingTop="2" paddingLeft="1">
              <Text size="sm" weight="semibold" color={isToday ? 'primaryText' : 'foreground'}>
                {formats.agendaDay.format(day)}
              </Text>
            </View>
            <VStack flex={1} minWidth={0} gap="0-5">
              {dayEvents.map((event) => (
                <EventButton
                  key={event.id}
                  variant="row"
                  event={event}
                  label={eventLabel(event)}
                  onPress={onEventPress}
                >
                  <View
                    width="2"
                    height="2"
                    borderRadius="full"
                    backgroundColor={tones[event.tone ?? 'primary'].dot}
                  />
                  <VStack flex={1} minWidth={0} paddingVertical="1">
                    <Text size="sm" weight="medium" truncate>
                      {event.title}
                    </Text>
                    <Text size="xs" tone="muted">
                      {event.allDay
                        ? labels.allDay
                        : `${formats.time.format(event.start)} – ${formats.time.format(eventEnd(event))}`}
                    </Text>
                  </VStack>
                </EventButton>
              ))}
            </VStack>
          </XStack>
        )
      })}
    </VStack>
  )
}
