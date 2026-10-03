import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Date Range Picker',
  slug: 'date-range-picker',
  category: 'forms',
  description: 'A field that opens a range calendar: pick a start, then an end.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['DateRangePicker'],
  files: [
    'components/date-range-picker/DateRangePicker.tsx',
    'components/date-range-picker/index.ts',
    'components/date-picker/PickerTrigger.tsx',
    'components/calendar/Calendar.tsx',
    'components/calendar/dates.ts',
  ],
  keywords: ['date range', 'from to', 'check-in', 'booking', 'period'],
  usage: `import { DateRangePicker, Field } from '@advui/core'

<Field label="Stay">
  <DateRangePicker value={stay} onValueChange={setStay} min={new Date()} />
</Field>`,
  parts: [
    {
      name: 'DateRangePicker',
      description: 'Takes the same props as Date Picker, except the value is a range.',
      props: [
        {
          name: 'value / defaultValue',
          type: '{ start: Date | null; end: Date | null }',
          description: 'The picked range.',
        },
        {
          name: 'onValueChange',
          type: '(value: DateRange) => void',
          description: 'Called on each press; the panel closes once both ends are picked.',
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'Pick dates'",
          description: 'Shown while empty.',
        },
        {
          name: 'title',
          type: 'string',
          default: "'Choose dates'",
          description: 'Title of the panel.',
        },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'As Date Picker: a labelled button that opens a titled dialog, described by the picked range.',
    'Every day in the range has `aria-selected`, so screen readers say which days are included.',
  ],
  platformNotes: {
    ios: 'Opens as a bottom sheet.',
    android: 'Opens as a bottom sheet; the back button closes it.',
  },
  related: ['date-picker', 'calendar'],
})
