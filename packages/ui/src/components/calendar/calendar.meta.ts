import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Calendar',
  slug: 'calendar',
  category: 'data-display',
  description: 'A month grid for picking a day or a range, with limits and disabled days.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Calendar', 'DateRange'],
  files: [
    'components/calendar/Calendar.tsx',
    'components/calendar/dates.ts',
    'components/calendar/index.ts',
  ],
  keywords: ['calendar', 'date', 'month', 'day', 'range', 'schedule'],
  usage: `import { Calendar } from '@advui/core'

<Calendar value={day} onValueChange={setDay} min={new Date()} />`,
  parts: [
    {
      name: 'Calendar',
      props: [
        {
          name: 'mode',
          type: "'single' | 'range'",
          options: ['single', 'range'],
          default: "'single'",
          description: 'Pick one day, or a start and an end.',
        },
        {
          name: 'value',
          type: 'Date | DateRange | null',
          description:
            'The picked day, or `{ start, end }` in range mode, when you control it. Only the calendar day is used, not the time.',
        },
        {
          name: 'defaultValue',
          type: 'Date | DateRange | null',
          description: 'The picked day or range at first, when the calendar manages it.',
        },
        {
          name: 'onValueChange',
          type: '(value) => void',
          description: 'Called when a day is picked.',
        },
        { name: 'month', type: 'Date', description: 'The visible month, when you control it.' },
        {
          name: 'defaultMonth',
          type: 'Date',
          description: 'The month shown first. Defaults to the picked day or today.',
        },
        {
          name: 'onMonthChange',
          type: '(month: Date) => void',
          description: 'Called when the visible month changes.',
        },
        { name: 'min', type: 'Date', description: 'Earliest selectable day.' },
        { name: 'max', type: 'Date', description: 'Latest selectable day.' },
        {
          name: 'isDateDisabled',
          type: '(date: Date) => boolean',
          description: 'Makes days unselectable, e.g. weekends.',
        },
        {
          name: 'weekStartsOn',
          type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
          options: ['0', '1', '2', '3', '4', '5', '6'],
          default: '0',
          description: 'First day of the week (0 = Sunday).',
        },
        {
          name: 'locale',
          type: 'string',
          description: 'BCP 47 locale for month and day names. Defaults to the device.',
        },
        {
          name: 'previousMonthLabel',
          type: 'string',
          default: "'Previous month'",
          description: 'Accessible name of the previous-month button.',
        },
        {
          name: 'nextMonthLabel',
          type: 'string',
          default: "'Next month'",
          description: 'Accessible name of the next-month button.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Single day' },
    { name: 'range', title: 'Range with disabled weekends' },
  ],
  accessibility: [
    'On web it is a WAI-ARIA `grid` labelled by the month name, with one Tab stop.',
    'Every day is named with its full date ("Monday, 28 September 2026"); the picked days have `aria-selected`, today has `aria-current="date"`, and days outside the limits have `aria-disabled`.',
    'The month name is a polite live region, so changing month is announced.',
  ],
  keyboard: [
    { keys: 'ArrowLeft / ArrowRight', action: 'Previous / next day.' },
    { keys: 'ArrowUp / ArrowDown', action: 'Same day of the previous / next week.' },
    { keys: 'Home / End', action: 'First / last day of the week.' },
    { keys: 'PageUp / PageDown', action: 'Previous / next month (with Shift: year).' },
    { keys: 'Enter / Space', action: 'Picks the focused day.' },
  ],
  platformNotes: {
    ios: 'Each day is a button, so VoiceOver swipes through the days in order.',
    android: 'Each day is a button, so TalkBack swipes through the days in order.',
  },
  related: ['date-picker', 'date-range-picker'],
})
