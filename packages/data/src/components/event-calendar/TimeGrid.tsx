import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { AccessibilityInfo } from 'react-native'
import {
  type GetProps,
  type TamaguiElement,
  type Token,
  View,
  XStack,
  getTokenValue,
  isWeb,
} from 'tamagui/unstyled'
import { ScrollArea, Sticky, Text, VisuallyHidden, shadows } from '@advui/core'
import { dayKey, isSameDay, minutesInto, minutesPerDay } from './dates'
import { type CalendarEventChange, changesTimes, moveTimes, resizeTimes } from './editing'
import { type CalendarEvent, eventEnd, eventsOnDay, placeEvents } from './events'
import { EventButton, type ViewContext, buttonProps, tones, webRole } from './parts'
import { useEventDrag } from './useEventDrag'

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

/** What the keys, screen reader actions and drags do to an event. */
type EditAction = 'earlier' | 'later' | 'previousDay' | 'nextDay' | 'endEarlier' | 'endLater'

type AccessibilityAction = { name: EditAction; label: string }

interface Editing {
  canEdit: (event: CalendarEvent) => boolean
  /** The event being dragged, drawn raised. */
  draggingId: string | null
  instructionsId: string
  actions: (day: number) => AccessibilityAction[]
  edit: (event: CalendarEvent, day: number, action: EditAction) => void
  register: (event: CalendarEvent, node: TamaguiElement | null) => void
  drag: ReturnType<typeof useEventDrag>
}

/**
 * The clock, on each minute, from after the first render: a server renders no
 * line, so the first render matches it. `fixed` holds it still.
 */
function useNow(fixed: Date | undefined) {
  const [clock, setClock] = useState<Date | null>(null)
  useEffect(() => {
    if (fixed) return
    const tick = () => setClock(new Date())
    tick()
    let interval: ReturnType<typeof setInterval> | undefined
    const timeout = setTimeout(
      () => {
        tick()
        interval = setInterval(tick, 60_000)
      },
      60_000 - (Date.now() % 60_000),
    )
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [fixed])
  return fixed ?? clock
}

export interface TimeGridProps extends ViewContext {
  days: Date[]
  height: GetProps<typeof View>['height']
  /** The hour shown at the top when it opens. */
  scrollToHour: number
}

/**
 * The week and day views: all-day events above, timed ones on the hours of
 * their day, and a line at the current time across today. The days and the
 * all-day row stay pinned while the hours scroll. With `onEventChange`, timed
 * events move by dragging, the arrow keys or screen reader actions, and their
 * bottom edge changes when they end.
 */
export function TimeGrid({ days, height, scrollToHour, ...context }: TimeGridProps) {
  const { events, formats, labels, onEventPress, eventLabel, onEventChange, snapMinutes } = context
  const scrollRef = useRef<TamaguiElement>(null)
  const scrolled = useRef(false)
  const hourPixels = getTokenValue(hourHeight as Token, 'size') as number
  // The pinned header sits over the top of the hours, so the hour's offset
  // puts it just below the header. A little less shows its label, which
  // sits half above the line.
  const offset = Math.max(
    0,
    scrollToHour * hourPixels - (getTokenValue('2' as Token, 'space') as number),
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

  const now = useNow(context.now)
  // Where a dragged event would land: drawn there until it is dropped.
  const [preview, setPreview] = useState<CalendarEventChange | null>(null)
  const shown = preview
    ? events.map((event) =>
        event.id === preview.event.id
          ? { ...event, start: preview.start, end: preview.end }
          : event,
      )
    : events

  const instructionsId = useId()
  const [message, setMessage] = useState({ text: '', key: 0 })
  const announce = (text: string) => {
    if (isWeb) setMessage((current) => ({ text, key: current.key + 1 }))
    else AccessibilityInfo.announceForAccessibility(text)
  }

  // An event that moved to another day mounts again there: give it focus back.
  const columns = useRef<(TamaguiElement | null)[]>([])
  const nodes = useRef(new Map<string, TamaguiElement>())
  const focusAfter = useRef<{ id: string; node: TamaguiElement | undefined } | null>(null)
  const focusTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useLayoutEffect(() => {
    if (!focusAfter.current) return
    const { id, node: before } = focusAfter.current
    focusAfter.current = null
    const node = nodes.current.get(id)
    if (!node || node === before) return
    if (isWeb) {
      ;(node as HTMLElement).focus({ preventScroll: true })
      return
    }
    // Native: once the old view has left the screen, or TalkBack loses focus again.
    clearTimeout(focusTimer.current)
    focusTimer.current = setTimeout(() => {
      AccessibilityInfo.sendAccessibilityEvent(node as never, 'focus')
    }, 250)
  })
  useEffect(() => () => clearTimeout(focusTimer.current), [])

  const commit = (change: CalendarEventChange) => {
    onEventChange?.(change)
    announce(eventLabel({ ...change.event, start: change.start, end: change.end }))
    focusAfter.current = { id: change.event.id, node: nodes.current.get(change.event.id) }
  }

  const canEdit = (event: CalendarEvent) => !!onEventChange && !event.allDay && !event.readOnly
  const drag = useEventDrag({
    minuteHeight: hourPixels / 60,
    step: snapMinutes,
    columns,
    scroller: scrollRef,
    canEdit,
    onPreview: setPreview,
    onCommit: commit,
  })

  const editing: Editing | null = onEventChange
    ? {
        canEdit,
        draggingId: preview?.event.id ?? null,
        instructionsId,
        actions: (day) => [
          { name: 'earlier', label: labels.moveEarlier(snapMinutes) },
          { name: 'later', label: labels.moveLater(snapMinutes) },
          ...(day > 0
            ? [
                {
                  name: 'previousDay' as const,
                  label: labels.moveToDay(formats.weekdayLong.format(days[day - 1]!)),
                },
              ]
            : []),
          ...(day < days.length - 1
            ? [
                {
                  name: 'nextDay' as const,
                  label: labels.moveToDay(formats.weekdayLong.format(days[day + 1]!)),
                },
              ]
            : []),
          { name: 'endEarlier', label: labels.endEarlier(snapMinutes) },
          { name: 'endLater', label: labels.endLater(snapMinutes) },
        ],
        edit: (event, day, action) => {
          const step = snapMinutes
          let times
          if (action === 'earlier' || action === 'later') {
            times = moveTimes(event, action === 'earlier' ? -step : step, 0, step)
          } else if (action === 'endEarlier' || action === 'endLater') {
            times = resizeTimes(event, action === 'endEarlier' ? -step : step, step)
          } else {
            // Only to a day that is shown, so the event stays in view.
            const to = day + (action === 'previousDay' ? -1 : 1)
            if (to < 0 || to >= days.length) return
            times = moveTimes(event, 0, to - day, step)
          }
          if (changesTimes(event, times)) commit({ event, ...times })
        },
        register: (event, node) => {
          if (node) nodes.current.set(event.id, node)
        },
        drag,
      }
    : null

  const allDay = days.map((day) => eventsOnDay(events, day).filter((event) => event.allDay))
  const single = days.length === 1

  return (
    <>
      <ScrollArea
        ref={scrollRef}
        height={height}
        borderWidth={1}
        borderColor="border"
        borderRadius="lg"
        {...(!isWeb && { onLayout })}
        // Native: the hours stay put while an event is dragged.
        {...(!isWeb && preview && { scrollEnabled: false })}
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
          <XStack {...drag.gridProps}>
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
            {days.map((day, index) => (
              <DayColumn
                key={dayKey(day)}
                day={day}
                index={index}
                columnRef={(node) => {
                  columns.current[index] = node
                }}
                nowMinutes={now && isSameDay(now, day) ? minutesInto(day, now) : null}
                editing={editing}
                {...context}
                events={shown}
              />
            ))}
          </XStack>
        </View>
      </ScrollArea>
      {isWeb && editing ? (
        <>
          <VisuallyHidden id={instructionsId}>
            {labels.editInstructions(snapMinutes, days.length > 1)}
          </VisuallyHidden>
          <VisuallyHidden role="status" aria-live="assertive">
            {message.text ? <Text key={message.key}>{message.text}</Text> : null}
          </VisuallyHidden>
        </>
      ) : null}
    </>
  )
}

function DayColumn({
  day,
  index,
  columnRef,
  nowMinutes,
  editing,
  events,
  formats,
  onEventPress,
  eventLabel,
}: ViewContext & {
  day: Date
  index: number
  columnRef: (node: TamaguiElement | null) => void
  /** Where the current-time line is, on today's column. */
  nowMinutes: number | null
  editing: Editing | null
}) {
  const placed = placeEvents(events, day, minMinutes)
  return (
    <View
      ref={columnRef}
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
        const editable = !!editing?.canEdit(event)
        const handle = editable ? editing!.drag.handleProps(event, index) : null
        return (
          <View
            key={event.id}
            position="absolute"
            top={percent(top)}
            height={percent(bottom - top)}
            left={`${(column / columns) * 100}%`}
            width={`${100 / columns}%`}
            padding="0-5"
            // The dragged event stays above the others it passes.
            {...(editing?.draggingId === event.id && { zIndex: 1 })}
          >
            <EventButton
              variant="block"
              event={event}
              label={eventLabel(event)}
              onPress={
                onEventPress &&
                ((pressed) => {
                  // The click that ends a drag is not a press.
                  if (!editing?.drag.consumePress()) onEventPress(pressed)
                })
              }
              focusable={editable}
              {...(editable && {
                ref: (node: TamaguiElement | null) => editing!.register(event, node),
                position: 'relative',
                ...(isWeb
                  ? {
                      'aria-describedby': editing!.instructionsId,
                      // So a drag never selects text.
                      userSelect: 'none',
                      onKeyDown: (key: {
                        key: string
                        shiftKey: boolean
                        preventDefault: () => void
                      }) => {
                        const action = keyAction(key)
                        if (!action) return
                        key.preventDefault()
                        editing!.edit(event, index, action)
                      },
                    }
                  : {
                      accessibilityActions: editing!.actions(index),
                      onAccessibilityAction: (action: { nativeEvent: { actionName: string } }) =>
                        editing!.edit(event, index, action.nativeEvent.actionName as EditAction),
                    }),
                ...(editing!.draggingId === event.id && shadows.md),
                ...editing!.drag.eventProps(event, index),
              })}
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
              {/* Web: the bottom edge changes when it ends. */}
              {handle ? (
                <View
                  position="absolute"
                  left={0}
                  right={0}
                  bottom={0}
                  height="2"
                  aria-hidden
                  {...handle}
                />
              ) : null}
            </EventButton>
          </View>
        )
      })}
      {nowMinutes != null ? (
        <View
          className="aui-event-calendar-now"
          position="absolute"
          left={0}
          right={0}
          top={percent(nowMinutes)}
          borderTopWidth={2}
          borderColor="primary"
          pointerEvents="none"
          aria-hidden
        />
      ) : null}
    </View>
  )
}

/** The edit an arrow key makes; Shift with Up and Down moves the end. */
function keyAction(key: { key: string; shiftKey: boolean }): EditAction | null {
  switch (key.key) {
    case 'ArrowUp':
      return key.shiftKey ? 'endEarlier' : 'earlier'
    case 'ArrowDown':
      return key.shiftKey ? 'endLater' : 'later'
    case 'ArrowLeft':
      return key.shiftKey ? null : 'previousDay'
    case 'ArrowRight':
      return key.shiftKey ? null : 'nextDay'
    default:
      return null
  }
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
