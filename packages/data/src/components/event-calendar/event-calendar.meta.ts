import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Event Calendar',
  slug: 'event-calendar',
  category: 'advanced',
  description:
    'Events on a month grid, a week or a day of hours, or an agenda list, with Today, previous and next.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'EventCalendar',
    'EventCalendarProps',
    'EventCalendarView',
    'EventCalendarLabels',
    'CalendarEvent',
    'CalendarEventTone',
    'CalendarEventChange',
  ],
  files: [
    'components/event-calendar/EventCalendar.tsx',
    'components/event-calendar/MonthView.tsx',
    'components/event-calendar/TimeGrid.tsx',
    'components/event-calendar/AgendaView.tsx',
    'components/event-calendar/parts.tsx',
    'components/event-calendar/events.ts',
    'components/event-calendar/dates.ts',
    'components/event-calendar/editing.ts',
    'components/event-calendar/useEventDrag.tsx',
    'components/event-calendar/useEventDrag.native.tsx',
    'components/event-calendar/index.ts',
  ],
  keywords: [
    'calendar',
    'events',
    'schedule',
    'scheduler',
    'agenda',
    'planner',
    'week view',
    'month view',
    'appointments',
    'bookings',
  ],
  usage: `import { EventCalendar } from '@advui/data'

<EventCalendar
  events={[
    { id: 'standup', title: 'Team standup', start: new Date(2026, 9, 28, 9), end: new Date(2026, 9, 28, 9, 30) },
  ]}
  onEventPress={(event) => open(event.id)}
/>`,
  parts: [
    {
      name: 'EventCalendar',
      props: [
        {
          name: 'events',
          type: 'readonly CalendarEvent[]',
          required: true,
          description: '`{ id, title, start, end?, allDay?, tone? }` events.',
        },
        {
          name: 'view',
          type: "'month' | 'week' | 'day' | 'agenda'",
          options: ['month', 'week', 'day', 'agenda'],
          description: 'The view shown.',
        },
        {
          name: 'defaultView',
          type: "'month' | 'week' | 'day' | 'agenda'",
          options: ['month', 'week', 'day', 'agenda'],
          default: "'month'",
          description: 'Starting `view` when uncontrolled.',
        },
        {
          name: 'onViewChange',
          type: '(view: EventCalendarView) => void',
          description: 'Called with the new `view`.',
        },
        {
          name: 'views',
          type: 'EventCalendarView[]',
          default: "['month', 'week', 'day', 'agenda']",
          description: 'The views to switch between, in order. With one, there is no switcher.',
        },
        {
          name: 'date',
          type: 'Date',
          description: 'A day in the shown month, week or day.',
        },
        {
          name: 'defaultDate',
          type: 'Date',
          description: 'Starting `date` when uncontrolled. Default: today.',
        },
        {
          name: 'onDateChange',
          type: '(date: Date) => void',
          description: 'Called with the new `date`: previous, next, Today, or a day opened.',
        },
        {
          name: 'onEventPress',
          type: '(event: CalendarEvent) => void',
          description: 'Makes events buttons. Without it they are text.',
        },
        {
          name: 'onEventChange',
          type: '(change: CalendarEventChange) => void',
          description:
            'Makes timed events in the week and day views movable: drag one to another time or day (a long press first on touch screens), its bottom edge to change when it ends, or use the arrow keys or screen reader actions. Called with `{ event, start, end }`: update `events` with them.',
        },
        {
          name: 'snapMinutes',
          type: 'number',
          default: '15',
          min: 5,
          max: 60,
          step: 5,
          description: 'Minutes that moved times snap to, from midnight.',
        },
        {
          name: 'now',
          type: 'Date',
          description:
            'The time on the line across today in the week and day views. Default: the clock, each minute, from after the first render.',
        },
        {
          name: 'onDatePress',
          type: '(date: Date) => void',
          description:
            'A month day’s number or a week day’s heading was pressed. With the day view in `views`, that day opens there too.',
        },
        {
          name: 'weekStartsOn',
          type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
          options: ['0', '1', '2', '3', '4', '5', '6'],
          default: '0',
          description: 'First day of the week: 0 is Sunday, 1 Monday.',
        },
        {
          name: 'locale',
          type: 'string',
          description: 'BCP 47 locale for dates and times. Defaults to the device locale.',
        },
        {
          name: 'today',
          type: 'Date',
          description: 'Overrides today, for tests and screenshots.',
        },
        {
          name: 'maxEventsPerDay',
          type: 'number',
          default: '3',
          min: 1,
          max: 8,
          step: 1,
          description: 'Lines a month day shows: its events, or fewer and “+2 more”.',
        },
        {
          name: 'timeGridHeight',
          type: 'SizeTokens | number',
          default: "'128'",
          token: 'size',
          description: 'Height of the scrolling hours in the week and day views.',
        },
        {
          name: 'scrollToHour',
          type: 'number',
          default: '8',
          min: 0,
          max: 23,
          step: 1,
          description: 'The hour at the top when the week or day view opens.',
        },
        {
          name: 'labels',
          type: 'Partial<EventCalendarLabels>',
          description:
            'Button names and words, such as `today`, `nextMonth`, `allDay` and `more(count)`, for other languages.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'CalendarEvent',
      kind: 'type',
      description: 'One event.',
      props: [
        { name: 'id', type: 'string', required: true, description: 'Unique key.' },
        { name: 'title', type: 'string', required: true, description: 'Shown and read.' },
        { name: 'start', type: 'Date', required: true, description: 'When it starts.' },
        {
          name: 'end',
          type: 'Date',
          description:
            'When it ends: default an hour after `start`. For an all-day event, its last day.',
        },
        {
          name: 'allDay',
          type: 'boolean',
          description: 'Fills whole days; shown above the hours in the week and day views.',
        },
        {
          name: 'tone',
          type: "'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'",
          options: ['primary', 'success', 'warning', 'error', 'info', 'neutral'],
          default: "'primary'",
          description: 'Color, as a soft fill with its text color.',
        },
        {
          name: 'readOnly',
          type: 'boolean',
          description: 'Not moved or resized, even with `onEventChange`.',
        },
      ],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Month',
      description: 'A day’s number opens it; a busy day shows “+2 more”.',
    },
    {
      name: 'week',
      title: 'Week',
      description:
        'Starts on Monday; events that overlap share the day’s width. Drag an event, or its bottom edge, to change it; a line marks the current time.',
    },
    {
      name: 'agenda',
      title: 'Agenda',
      description: 'A list of the month’s days with events, which suits phones.',
    },
  ],
  accessibility: [
    'The month is a `table` named by its month, with a column header per weekday; each day is a `cell` (web).',
    'A day’s number is a button named with its date and event count (“Wednesday, October 28, 2026, 4 events”), with `aria-current="date"` for today; iOS and Android add “today” to the name.',
    'Events are buttons when `onEventPress` is set, named with their title, day and times (“Team standup, Wednesday, October 28, 2026, 9:00 AM to 9:30 AM”); otherwise that name is hidden text.',
    'In the week and day views each day is a `group` named by its date (web), holding its events in time order. The time gutter is hidden.',
    'With `onEventChange`, timed events in the week and day views are buttons even without `onEventPress`, described by how to move them with the keyboard (web). Each change is announced with the event’s new name. On iOS and Android they have actions instead: “Move 15 minutes earlier”, “Move to Thursday”, “End 15 minutes later”…',
    'The current-time line is hidden from screen readers.',
    'The title is a polite live region, so moving by month, week or day is announced. The view switcher is a Toggle Group (`radiogroup`).',
    'On phones a month day shows dots for its events, hidden from screen readers: its name counts them, and its number opens the day.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the toolbar, then the days and events in order.' },
    { keys: 'Enter / Space', action: 'Opens a day or presses an event.' },
    { keys: 'Arrow keys', action: 'Move between views in the switcher.' },
    {
      keys: 'Up / Down',
      action: 'With `onEventChange`, move a focused event `snapMinutes` earlier or later.',
    },
    { keys: 'Left / Right', action: 'Move a focused event to the day before or after, if shown.' },
    { keys: 'Shift + Up / Down', action: 'End a focused event earlier or later.' },
    { keys: 'Escape', action: 'Puts an event that is being dragged back.' },
  ],
  responsive:
    'Below `sm` a month day shows dots instead of event titles; the agenda view lists them in full.',
  platformNotes: {
    web: 'The days and the all-day row stay pinned above the hours with `position: sticky`. A mouse drags an event once it moves, a finger after holding still for a moment; near the top or bottom of the hours a drag scrolls them.',
    ios: 'The week and day views are a ScrollView whose header is pinned (`stickyHeaderIndices`), scrolled to `scrollToHour` once laid out. iOS has no table roles: days and events are buttons. A long press picks an event up (near its bottom edge, its end), and the hours and the ScrollArea around them stop scrolling until the finger lifts, so a drag reaches the hours in view. Not yet checked on a device.',
    android: 'Same as iOS, with the ripple on events when the config has `androidRipple`.',
  },
  related: ['calendar', 'date-picker', 'timeline', 'kanban'],
})
