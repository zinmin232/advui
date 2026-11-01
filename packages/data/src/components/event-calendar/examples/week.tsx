import { Text, VStack } from '@advui/core'
import { type CalendarEvent, EventCalendar } from '@advui/data'
import { useState } from 'react'

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute)

const initialEvents: CalendarEvent[] = [
  { id: 'holiday', title: 'Office closed', start: at(26, 0), allDay: true, tone: 'neutral' },
  { id: 'standup-27', title: 'Standup', start: at(27, 9), end: at(27, 9, 15) },
  { id: 'standup-28', title: 'Standup', start: at(28, 9), end: at(28, 9, 15) },
  { id: 'standup-29', title: 'Standup', start: at(29, 9), end: at(29, 9, 15) },
  // Three that overlap: they share the day's width.
  { id: 'design', title: 'Dashboard design', start: at(28, 10), end: at(28, 12), tone: 'info' },
  { id: 'hiring', title: 'Interview', start: at(28, 10, 30), end: at(28, 11, 30), tone: 'warning' },
  {
    id: 'lunch',
    title: 'Lunch with partners',
    start: at(28, 11),
    end: at(28, 13),
    tone: 'success',
  },
  { id: 'planning', title: 'Sprint planning', start: at(30, 13), end: at(30, 15) },
  // Fixed in place: not moved or resized.
  {
    id: 'deploy',
    title: 'Release',
    start: at(29, 16),
    end: at(29, 17),
    tone: 'error',
    readOnly: true,
  },
]

export default function EventCalendarWeek() {
  const [events, setEvents] = useState(initialEvents)
  const [status, setStatus] = useState('Press an event to open it, or drag it to move it.')
  return (
    <VStack gap="3" width="100%" maxWidth="224">
      <EventCalendar
        events={events}
        defaultView="week"
        views={['week', 'day']}
        weekStartsOn={1}
        defaultDate={new Date(2026, 9, 28)}
        today={new Date(2026, 9, 28)}
        scrollToHour={9}
        timeGridHeight="96"
        // A fixed time for the current-time line, so the example stays the same.
        now={at(28, 10, 40)}
        onEventPress={(event) => setStatus(`Opened: ${event.title}`)}
        onEventChange={({ event, start, end }) => {
          setEvents((list) => list.map((e) => (e.id === event.id ? { ...e, start, end } : e)))
          setStatus(`Moved: ${event.title}`)
        }}
      />
      <Text size="sm" tone="muted" aria-live="polite">
        {status}
      </Text>
    </VStack>
  )
}
