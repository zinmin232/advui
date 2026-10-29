import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { EventCalendar } from './EventCalendar'
import { type CalendarEvent, placeEvents } from './events'

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute)
const wednesday = new Date(2026, 9, 28)

const events: CalendarEvent[] = [
  { id: 'standup', title: 'Team standup', start: at(28, 9), end: at(28, 9, 30) },
  { id: 'maps', title: 'Map review', start: at(28, 11), end: at(28, 12), tone: 'warning' },
  { id: 'call', title: 'Partner call', start: at(28, 15), end: at(28, 16) },
  { id: 'report', title: 'Round report', start: at(28, 16), end: at(28, 17) },
  { id: 'field', title: 'Field visit', start: at(12, 0), end: at(14, 0), allDay: true },
  { id: 'closed', title: 'Office closed', start: at(26, 0), allDay: true, tone: 'neutral' },
]

// Times read "9:00 AM" with a narrow no-break space before AM.
const time = (text: string) => text.replace(/ (AM|PM)/g, '\\s$1')

describe('EventCalendar', () => {
  it('shows the month as a table of days with their events', async () => {
    const onEventPress = vi.fn()
    const { user } = renderWithProvider(
      <EventCalendar
        locale="en-US"
        events={events}
        defaultDate={wednesday}
        today={wednesday}
        onEventPress={onEventPress}
      />,
    )
    const table = screen.getByRole('table', { name: 'October 2026' })
    const headers = within(table).getAllByRole('columnheader')
    expect(headers).toHaveLength(7)
    expect(headers[0]).toHaveAccessibleName('Sunday')
    // A header row and five weeks: September 27 to October 31.
    expect(within(table).getAllByRole('row')).toHaveLength(6)

    const day = screen.getByRole('button', { name: 'Wednesday, October 28, 2026, 4 events' })
    expect(day).toHaveAttribute('aria-current', 'date')
    // Four events and room for three lines: two, then "+2 more".
    expect(screen.getByRole('button', { name: '2 more, Wednesday, October 28, 2026' })).toBeVisible()
    const standup = screen.getByRole('button', {
      name: new RegExp(`^${time('Team standup, Wednesday, October 28, 2026, 9:00 AM to 9:30 AM')}$`),
    })
    expect(screen.queryByRole('button', { name: /^Partner call/ })).toBeNull()
    // An all-day event shows on each of its days.
    expect(
      screen.getAllByRole('button', {
        name: 'Field visit, All day, Monday, October 12, 2026 to Wednesday, October 14, 2026',
      }),
    ).toHaveLength(3)

    await user.click(standup)
    expect(onEventPress).toHaveBeenCalledWith(events[0])
  }, 15_000)

  it('moves by month, back to today, and opens a day from its number', async () => {
    const onDatePress = vi.fn()
    const onViewChange = vi.fn()
    const { user } = renderWithProvider(
      <EventCalendar
        locale="en-US"
        events={events}
        defaultDate={wednesday}
        today={wednesday}
        onDatePress={onDatePress}
        onViewChange={onViewChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByRole('table', { name: 'November 2026' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByText('September 2026')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(screen.getByText('October 2026')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tuesday, October 27, 2026, no events' }))
    expect(onDatePress).toHaveBeenCalledWith(new Date(2026, 9, 27))
    expect(onViewChange).toHaveBeenLastCalledWith('day')
    expect(screen.getByText('Tuesday, October 27, 2026', { selector: '[aria-live]' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Day' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Next day' })).toBeInTheDocument()
  }, 15_000)

  it('shows a week of hours with the all-day events above, from weekStartsOn', async () => {
    const { user } = renderWithProvider(
      <EventCalendar
        locale="en-US"
        events={events}
        defaultDate={wednesday}
        today={wednesday}
        weekStartsOn={1}
        onEventPress={() => {}}
      />,
    )
    await user.click(screen.getByRole('radio', { name: 'Week' }))
    expect(screen.getByText('Oct 26 – Nov 1, 2026')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Office closed, All day, Monday, October 26, 2026' }),
    ).toBeInTheDocument()
    // Each day is a group of its timed events, and its heading opens it.
    const day = screen.getByRole('group', { name: 'Wednesday, October 28, 2026' })
    expect(within(day).getAllByRole('button')).toHaveLength(4)
    expect(within(day).getByText('Map review')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(screen.getByText('Oct 19 – Oct 25, 2026')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Friday, October 23, 2026' }))
    expect(screen.getByText('Friday, October 23, 2026', { selector: '[aria-live]' })).toBeInTheDocument()
  }, 15_000)

  it('lists the month in the agenda, or says it has no events', async () => {
    const { user } = renderWithProvider(
      <EventCalendar
        locale="en-US"
        events={events}
        defaultView="agenda"
        views={['agenda', 'month']}
        defaultDate={wednesday}
        today={wednesday}
      />,
    )
    expect(screen.getByText('Wed, Oct 28')).toBeInTheDocument()
    expect(screen.getByText('Mon, Oct 12')).toBeInTheDocument()
    // Without onEventPress, events are text with a full name for screen readers.
    expect(screen.queryByRole('button', { name: /Team standup/ })).toBeNull()
    expect(
      screen.getByText(new RegExp(`^${time('Team standup, Wednesday, October 28, 2026, 9:00 AM')}`)),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Week' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('No events this month')).toBeInTheDocument()
  }, 15_000)

  it('takes its labels from `labels`', () => {
    renderWithProvider(
      <EventCalendar
        locale="en-US"
        events={[]}
        defaultDate={wednesday}
        today={wednesday}
        views={['month']}
        labels={{ today: 'Now', nextMonth: 'Later' }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Later' })).toBeInTheDocument()
    // One view: no switcher, and with no day view a day's number is not a button.
    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.queryByRole('button', { name: /October 28/ })).toBeNull()
  })
})

describe('placeEvents', () => {
  it('puts overlapping events side by side, as many columns as the busiest moment needs', () => {
    const placed = placeEvents(
      [
        { id: 'a', title: 'A', start: at(28, 10), end: at(28, 12) },
        { id: 'b', title: 'B', start: at(28, 10, 30), end: at(28, 11, 30) },
        { id: 'c', title: 'C', start: at(28, 11), end: at(28, 13) },
        // After the three: a new group, full width.
        { id: 'd', title: 'D', start: at(28, 13), end: at(28, 14) },
        { id: 'e', title: 'E', start: at(27, 10), end: at(27, 11) },
      ],
      wednesday,
    )
    expect(placed.map((p) => [p.event.id, p.column, p.columns])).toEqual([
      ['a', 0, 3],
      ['b', 1, 3],
      ['c', 2, 3],
      ['d', 0, 1],
    ])
    expect(placed[0]).toMatchObject({ top: 600, bottom: 720 })
  })

  it('clips events to the day and gives short ones a minimum length', () => {
    const placed = placeEvents(
      [
        { id: 'late', title: 'Late', start: at(27, 22), end: at(28, 2) },
        { id: 'short', title: 'Short', start: at(28, 23, 55), end: at(28, 24) },
      ],
      wednesday,
      20,
    )
    expect(placed.map((p) => [p.event.id, p.top, p.bottom])).toEqual([
      ['late', 0, 120],
      ['short', 1420, 1440],
    ])
  })
})
