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
          default: "'single'",
          description: 'Pick one day, or a start and an end.',
        },
        {
          name: 'value / defaultValue',
          type: 'Date | null  (range: { start, end })',
          description: 'The picked day or range. Only the calendar day is used, not the time.',
        },
        {
          name: 'onValueChange',
          type: '(value) => void',
          description: 'Called when a day is picked.',
        },
        {
          name: 'month / defaultMonth / onMonthChange',
          type: 'Date',
          description: 'The visible month. Defaults to the picked day or today.',
        },
        { name: 'min / max', type: 'Date', description: 'Earliest and latest selectable days.' },
        {
          name: 'isDateDisabled',
          type: '(date: Date) => boolean',
          description: 'Makes days unselectable, e.g. weekends.',
        },
        {
          name: 'weekStartsOn',
          type: '0 – 6',
          default: '0',
          description: 'First day of the week (0 = Sunday).',
        },
        {
          name: 'locale',
          type: 'string',
          description: 'BCP 47 locale for month and day names. Defaults to the device.',
        },
        {
          name: 'previousMonthLabel / nextMonthLabel',
          type: 'string',
          default: "'Previous month' / 'Next month'",
          description: 'Accessible names of the month buttons.',
        },
      ],
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
