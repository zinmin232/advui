import { useEffect, useRef } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  type Token,
  View,
  XStack,
  getTokenValue,
  isWeb,
} from 'tamagui/unstyled'
import { ScrollArea, Sticky, Text, VisuallyHidden } from '@advui/core'
import { dayKey, isSameDay, minutesPerDay } from './dates'
import { eventEnd, eventsOnDay, placeEvents } from './events'
import { EventButton, type ViewContext, buttonProps, tones, webRole } from './parts'

const hours = Array.from({ length: 24 }, (_, hour) => hour)
// One hour row, and the time gutter beside the days.
const hourHeight = '12'
const gutterWidth = '14'
// A short event still gets room for one line: half an hour of height.
const minMinutes = 30
// Shorter than this, an event has one line: its title and start time.
const compactMinutes = 45

const percent = (minutes: number): `${number}%` => `${(minutes / minutesPerDay) * 100}%`

type NativeScrollView = { scrollTo: (options: { y: number; animated: boolean }) => void }

export interface TimeGridProps extends ViewContext {
  days: Date[]
  height: GetProps<typeof View>['height']
  /** The hour shown at the top when it opens. */
  scrollToHour: number
}

/**
 * The week and day views: all-day events above, timed ones on the hours of
 * their day. The days and the all-day row stay pinned while the hours scroll.
 */
export function TimeGrid({ days, height, scrollToHour, ...context }: TimeGridProps) {
  const { events, formats, labels, onEventPress, eventLabel } = context
  const scrollRef = useRef<TamaguiElement>(null)
  const scrolled = useRef(false)
  // The pinned header sits over the top of the hours, so the hour's offset
  // puts it just below the header. A little less shows its label, which
  // sits half above the line.
  const offset = Math.max(
    0,
    scrollToHour * (getTokenValue(hourHeight as Token, 'size') as number) -
      (getTokenValue('2' as Token, 'space') as number),
  )

  useEffect(() => {
    const node = scrollRef.current as HTMLElement | null
    if (isWeb && node) node.scrollTop = offset
  }, [offset])
  // Native: a ScrollView scrolls only once it is laid out.
  const onLayout = () => {
    if (scrolled.current) return
    scrolled.current = true
    ;(scrollRef.current as unknown as NativeScrollView | null)?.scrollTo({
      y: offset,
      animated: false,
    })
  }

  const allDay = days.map((day) => eventsOnDay(events, day).filter((event) => event.allDay))
  const single = days.length === 1

  return (
    <ScrollArea
      ref={scrollRef}
      height={height}
      borderWidth={1}
      borderColor="border"
      borderRadius="lg"
      {...(!isWeb && { onLayout })}
    >
      <View>
        <Sticky backgroundColor="background">
          <XStack borderBottomWidth={1} borderColor="border">
            <View width={gutterWidth} />
            {days.map((day) => (
              <DayHeader key={dayKey(day)} day={day} pressable={!single} {...context} />
            ))}
          </XStack>
          {allDay.some((list) => list.length) ? (
            <XStack borderBottomWidth={1} borderColor="border">
              <View width={gutterWidth} justifyContent="center" paddingHorizontal="1">
                <Text size="xs" tone="muted" textAlign="center" aria-hidden>
                  {labels.allDay}
                </Text>
              </View>
              {days.map((day, index) => (
                <View
                  key={dayKey(day)}
                  flex={1}
                  flexBasis={0}
                  minWidth={0}
                  gap="0-5"
                  padding="0-5"
                  borderLeftWidth={1}
                  borderColor="border"
                >
                  {allDay[index]!.map((event) => (
                    <EventButton
                      key={event.id}
                      event={event}
                      label={eventLabel(event)}
                      onPress={onEventPress}
                    >
                      <Text
                        size="xs"
                        color={tones[event.tone ?? 'primary'].color}
                        truncate
                        flex={1}
                      >
                        {event.title}
                      </Text>
                    </EventButton>
                  ))}
                </View>
              ))}
            </XStack>
          ) : null}
        </Sticky>
        <XStack>
          <View width={gutterWidth} aria-hidden>
            {hours.map((hour) => (
              <View key={hour} height={hourHeight} alignItems="flex-end" paddingRight="2">
                {/* Each label is centered on its hour's line; midnight has none. */}
                {hour > 0 ? (
                  <Text size="xs" tone="muted" marginTop="-2">
                    {formats.hour.format(new Date(2000, 0, 1, hour))}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
          {days.map((day) => (
            <DayColumn key={dayKey(day)} day={day} {...context} />
          ))}
        </XStack>
      </View>
    </ScrollArea>
  )
}

function DayColumn({
  day,
  events,
  formats,
  onEventPress,
  eventLabel,
}: ViewContext & { day: Date }) {
  const placed = placeEvents(events, day, minMinutes)
  return (
    <View
      flex={1}
      flexBasis={0}
      minWidth={0}
      position="relative"
      borderLeftWidth={1}
      borderColor="border"
      role={webRole('group')}
      {...(isWeb && { 'aria-label': formats.day.format(day) })}
    >
      {hours.map((hour) => (
        <View
          key={hour}
          height={hourHeight}
          {...(hour > 0 && { borderTopWidth: 1, borderColor: 'border' })}
        />
      ))}
      {placed.map(({ event, top, bottom, column, columns }) => {
        const tone = tones[event.tone ?? 'primary']
        return (
          <View
            key={event.id}
            position="absolute"
            top={percent(top)}
            height={percent(bottom - top)}
            left={`${(column / columns) * 100}%`}
            width={`${100 / columns}%`}
            padding="0-5"
          >
            <EventButton
              variant="block"
              event={event}
              label={eventLabel(event)}
              onPress={onEventPress}
            >
              {bottom - top < compactMinutes ? (
                // Too short for two lines: the title and start time on one.
                <Text size="xs" color={tone.color} numberOfLines={1} flexShrink={0}>
                  <Text size="xs" weight="semibold" color={tone.color}>
                    {event.title}
                  </Text>
                  {`, ${formats.time.format(event.start)}`}
                </Text>
              ) : (
                <>
                  <Text
                    size="xs"
                    weight="semibold"
                    color={tone.color}
                    // Side by side, a column is too narrow to wrap words into.
                    numberOfLines={columns > 1 ? 1 : 2}
                    flexShrink={0}
                  >
                    {event.title}
                  </Text>
                  <Text size="xs" color={tone.color} numberOfLines={1} flexShrink={0}>
                    {formats.time.format(event.start)} – {formats.time.format(eventEnd(event))}
                  </Text>
                </>
              )}
            </EventButton>
          </View>
        )
      })}
    </View>
  )
}

function DayHeader({
  day,
  pressable,
  today,
  formats,
  labels,
  openDay,
}: ViewContext & { day: Date; pressable: boolean }) {
  const isToday = isSameDay(day, today)
  const name = `${formats.day.format(day)}${isToday && !isWeb ? `, ${labels.todayMarker}` : ''}`
  const content = (
    <>
      <Text size="xs" tone={isToday ? 'primary' : 'muted'} aria-hidden>
        {formats.weekdayShort.format(day)}
      </Text>
      <Text size="lg" weight="semibold" color={isToday ? 'primaryText' : 'foreground'} aria-hidden>
        {day.getDate()}
      </Text>
    </>
  )
  const frame = {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: '1-5',
    borderLeftWidth: 1,
    borderColor: 'border',
  } as const
  if (pressable && openDay) {
    return (
      <View
        {...buttonProps(name)}
        aria-current={isToday ? 'date' : undefined}
        onPress={() => openDay(day)}
        {...frame}
        paddingHorizontal={0}
        // After buttonProps, which clears the border and background on web.
        borderLeftWidth={1}
        backgroundColor="transparent hover:accent press:accentHover"
        outlineColor="focus-visible:ring"
        outlineStyle="focus-visible:solid"
        outlineWidth="focus-visible:2px"
        outlineOffset="focus-visible:-2px"
      >
        {content}
      </View>
    )
  }
  return (
    <View {...frame}>
      {content}
      <VisuallyHidden>{name}</VisuallyHidden>
    </View>
  )
}
