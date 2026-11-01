import { useState } from 'react'
import { type Token, getTokenValue } from 'tamagui/unstyled'
import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, renderWithProvider, screen, within } from '../../../test/utils'
import { moveTimes, resizeTimes } from './editing'
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
    expect(
      screen.getByRole('button', { name: '2 more, Wednesday, October 28, 2026' }),
    ).toBeVisible()
    const standup = screen.getByRole('button', {
      name: new RegExp(
        `^${time('Team standup, Wednesday, October 28, 2026, 9:00 AM to 9:30 AM')}$`,
      ),
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
    expect(
      screen.getByText('Friday, October 23, 2026', { selector: '[aria-live]' }),
    ).toBeInTheDocument()
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
      screen.getByText(
        new RegExp(`^${time('Team standup, Wednesday, October 28, 2026, 9:00 AM')}`),
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Week' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('No events this month')).toBeInTheDocument()
  }, 15_000)

  it('draws the current time as a line across today, in the week and day views', async () => {
    const { container, user } = renderWithProvider(
      <EventCalendar
        locale="en-US"
        events={events}
        defaultView="week"
        defaultDate={wednesday}
        today={wednesday}
        now={at(28, 10, 30)}
      />,
    )
    const lines = container.querySelectorAll('.aui-event-calendar-now')
    expect(lines).toHaveLength(1)
    // 10:30 is 630 of the day's 1440 minutes, in Wednesday's column.
    expect(lines[0]).toHaveStyle({ top: '43.75%' })
    expect(screen.getByRole('group', { name: 'Wednesday, October 28, 2026' })).toContainElement(
      lines[0] as HTMLElement,
    )
    await user.click(screen.getByRole('button', { name: 'Next week' }))
    expect(container.querySelectorAll('.aui-event-calendar-now')).toHaveLength(0)
  })

  it('moves and resizes events with the arrow keys, announcing the new times', async () => {
    const onEventChange = vi.fn()
    function Editable() {
      const [list, setList] = useState(events)
      return (
        <EventCalendar
          locale="en-US"
          events={list}
          defaultView="week"
          defaultDate={wednesday}
          today={wednesday}
          onEventChange={(change) => {
            onEventChange(change)
            setList((current) =>
              current.map((event) =>
                event.id === change.event.id
                  ? { ...event, start: change.start, end: change.end }
                  : event,
              ),
            )
          }}
        />
      )
    }
    const { user } = renderWithProvider(<Editable />)
    const standup = () => screen.getByRole('button', { name: /^Team standup/ })
    expect(standup()).toHaveAccessibleDescription(/^Up and Down arrows move it by 15 minutes/)
    // All-day events are not moved on the hours: with no onEventPress, they are text.
    expect(screen.queryByRole('button', { name: /^Office closed/ })).toBeNull()
    standup().focus()
    await user.keyboard('{ArrowDown}')
    expect(onEventChange).toHaveBeenLastCalledWith({
      event: expect.objectContaining({ id: 'standup' }),
      start: at(28, 9, 15),
      end: at(28, 9, 45),
    })
    const status = screen.getByRole('status')
    expect(status.textContent).toMatch(
      new RegExp(time('Team standup, Wednesday, October 28, 2026, 9:15 AM to 9:45 AM')),
    )
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}')
    expect(onEventChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ start: at(28, 9, 15), end: at(28, 10) }),
    )
    // To Thursday: it mounts again in that column and keeps the focus.
    await user.keyboard('{ArrowRight}')
    expect(onEventChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ start: at(29, 9, 15), end: at(29, 10) }),
    )
    const thursday = screen.getByRole('group', { name: 'Thursday, October 29, 2026' })
    expect(within(thursday).getByRole('button', { name: /^Team standup/ })).toHaveFocus()
    // Never shorter than a step.
    await user.keyboard('{Shift>}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{/Shift}')
    expect(onEventChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ start: at(29, 9, 15), end: at(29, 9, 30) }),
    )
  }, 15_000)

  it('drags an event to a new time, and its bottom edge to a new end', async () => {
    const onEventChange = vi.fn()
    const onEventPress = vi.fn()
    const { container } = renderWithProvider(
      <EventCalendar
        locale="en-US"
        events={events}
        defaultView="day"
        defaultDate={wednesday}
        today={wednesday}
        onEventPress={onEventPress}
        onEventChange={onEventChange}
      />,
    )
    // happy-dom lays nothing out: a tall box, so the pointer is not near the edges that scroll.
    const box = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      ...{ x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 1000, width: 600, height: 1000 },
      toJSON: () => ({}),
    })
    const minute = getTokenValue('12' as Token, 'size') / 60
    const block = screen.getByRole('button', { name: /^Map review/ })
    const drag = (target: Element, dy: number) => {
      act(() => {
        fireEvent.pointerDown(target, { button: 0, pointerId: 1, clientX: 100, clientY: 200 })
      })
      act(() => {
        window.dispatchEvent(
          new PointerEvent('pointermove', { pointerId: 1, clientX: 100, clientY: 200 + dy }),
        )
      })
      act(() => {
        window.dispatchEvent(
          new PointerEvent('pointerup', { pointerId: 1, clientX: 100, clientY: 200 + dy }),
        )
      })
    }
    // Half an hour later, snapped to the steps; a little more rounds away.
    drag(block, 32 * minute)
    expect(onEventChange).toHaveBeenLastCalledWith({
      event: events[1],
      start: at(28, 11, 30),
      end: at(28, 12, 30),
    })
    // The click that ends a drag is not a press.
    act(() => {
      fireEvent.click(block)
    })
    expect(onEventPress).not.toHaveBeenCalled()
    // The bottom edge is the last thing in the event.
    drag(block.lastElementChild!, 45 * minute)
    expect(onEventChange).toHaveBeenLastCalledWith({
      event: events[1],
      start: at(28, 11),
      end: at(28, 12, 45),
    })
    expect(container.querySelector('.aui-event-calendar-now')).toBeNull()
    box.mockRestore()
  })

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

describe('moveTimes and resizeTimes', () => {
  const event = { id: 'a', title: 'A', start: at(28, 9, 7), end: at(28, 10, 7) }

  it('move a start onto the steps, keep the length, and stay on the day', () => {
    expect(moveTimes(event, 20, 0, 15)).toEqual({ start: at(28, 9, 30), end: at(28, 10, 30) })
    expect(moveTimes(event, 0, 1, 15)).toEqual({ start: at(29, 9), end: at(29, 10) })
    expect(moveTimes(event, -24 * 60, 0, 15)).toEqual({ start: at(28, 0), end: at(28, 1) })
    // The latest start is a step before midnight.
    expect(moveTimes(event, 24 * 60, 0, 15).start).toEqual(at(28, 23, 45))
  })

  it('move an end onto the steps, a step after the start and by midnight at the latest', () => {
    expect(resizeTimes(event, 50, 15)).toEqual({ start: at(28, 9, 7), end: at(28, 11) })
    expect(resizeTimes(event, -120, 15).end).toEqual(at(28, 9, 22))
    expect(resizeTimes(event, 24 * 60, 15).end).toEqual(at(29, 0))
  })
})
