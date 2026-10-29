import { type CalendarEvent, EventCalendar } from '@advui/data'

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute)

const events: CalendarEvent[] = [
  { id: 'kickoff', title: '5W round kickoff', start: at(1, 10), end: at(1, 11) },
  { id: 'review', title: 'Data review', start: at(7, 14), end: at(7, 15), tone: 'info' },
  {
    id: 'field',
    title: 'Field visit: Bago',
    start: at(12, 0),
    end: at(14, 0),
    allDay: true,
    tone: 'success',
  },
  { id: 'training', title: 'Kobo training', start: at(16, 9), end: at(16, 12), tone: 'neutral' },
  { id: 'deadline', title: 'Submissions close', start: at(23, 0), allDay: true, tone: 'error' },
  { id: 'standup', title: 'Team standup', start: at(28, 9), end: at(28, 9, 30) },
  { id: 'maps', title: 'Map review', start: at(28, 11), end: at(28, 12), tone: 'warning' },
]

/** The agenda suits phones: a list of the month's days that have events. */
export default function EventCalendarAgenda() {
  return (
    <EventCalendar
      events={events}
      defaultView="agenda"
      views={['agenda', 'month']}
      defaultDate={new Date(2026, 9, 28)}
      today={new Date(2026, 9, 28)}
      width="100%"
      maxWidth="128"
    />
  )
}
