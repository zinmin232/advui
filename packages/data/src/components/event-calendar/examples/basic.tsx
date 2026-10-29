import { toast } from '@advui/core'
import { type CalendarEvent, EventCalendar } from '@advui/data'

// October 2026, with a fixed "today", so the example (and its screenshot) stays the same.
const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute)

const events: CalendarEvent[] = [
  { id: 'kickoff', title: '5W round kickoff', start: at(1, 10), end: at(1, 11) },
  {
    id: 'field',
    title: 'Field visit: Bago',
    start: at(12, 0),
    end: at(14, 0),
    allDay: true,
    tone: 'success',
  },
  { id: 'review-1', title: 'Data review', start: at(7, 14), end: at(7, 15), tone: 'info' },
  { id: 'review-2', title: 'Data review', start: at(21, 14), end: at(21, 15), tone: 'info' },
  { id: 'deadline', title: 'Submissions close', start: at(23, 0), allDay: true, tone: 'error' },
  { id: 'standup', title: 'Team standup', start: at(28, 9), end: at(28, 9, 30) },
  { id: 'maps', title: 'Map review', start: at(28, 11), end: at(28, 12), tone: 'warning' },
  { id: 'partners', title: 'Partner call', start: at(28, 15), end: at(28, 16), tone: 'info' },
  { id: 'report', title: 'Write the round report', start: at(28, 16), end: at(28, 17) },
  { id: 'training', title: 'Kobo training', start: at(16, 9), end: at(16, 12), tone: 'neutral' },
]

export default function EventCalendarBasic() {
  return (
    <EventCalendar
      events={events}
      defaultDate={new Date(2026, 9, 28)}
      today={new Date(2026, 9, 28)}
      onEventPress={(event) => toast(event.title)}
      width="100%"
      maxWidth="224"
    />
  )
}
