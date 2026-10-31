import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'Date Time Picker',
  slug: 'date-time-picker',
  category: 'forms',
  description:
    'A date field and time selects side by side that make one Date, for meetings, deliveries and reminders.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['DateTimePicker'],
  // Only its own files: the registry gives a file to the first item that
  // lists it, and this slug sorts before time-picker. Date Picker and Time
  // Picker come in as registry dependencies through the imports.
  files: ['components/date-time-picker/DateTimePicker.tsx', 'components/date-time-picker/index.ts'],
  keywords: ['date time', 'datetime', 'date and time', 'schedule', 'appointment', 'reminder'],
  usage: `import { DateTimePicker, Field } from '@advui/core'

<Field label="Starts">
  <DateTimePicker value={start} onValueChange={setStart} hourCycle={12} minuteStep={15} />
</Field>`,
  parts: [
    {
      name: 'DateTimePicker',
      description:
        'Also takes Date Picker’s `formatOptions`, `placeholder`, `title`, `isDateDisabled`, `weekStartsOn` and `locale`, and Time Picker’s `hourLabel`, `minuteLabel` and `periodLabel`.',
      props: [
        {
          name: 'value',
          type: 'Date | null',
          description: 'The picked day and time, in local time.',
        },
        {
          name: 'defaultValue',
          type: 'Date | null',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: Date | null) => void',
          description: 'Called once a day and a time are both picked, and on later changes.',
        },
        {
          name: 'hourCycle',
          type: '12 | 24',
          options: ['12', '24'],
          default: '24',
          description: '12 adds an AM/PM select.',
        },
        {
          name: 'minuteStep',
          type: 'number',
          default: '5',
          description: 'Minutes between options.',
        },
        {
          name: 'min',
          type: 'Date',
          description: 'Earliest day that can be picked. Times on that day are not limited.',
        },
        {
          name: 'max',
          type: 'Date',
          description: 'Latest day that can be picked. Times on that day are not limited.',
        },
        {
          name: 'id',
          type: 'string',
          description: 'Goes on the date field, so a Field’s label targets it.',
        },
        {
          name: 'dateLabel',
          type: 'string',
          default: "'Date'",
          description: 'Accessible name of the date field.',
        },
        {
          name: 'timeLabel',
          type: 'string',
          default: "'Time'",
          description: 'Accessible name of the group of time selects (web).',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'As Input.',
        },
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description: 'Error styling and `aria-invalid` on every part.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Not focusable or editable.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'twelve-hour', title: '12-hour, weekdays only' },
  ],
  accessibility: [
    'On web, a `group` named by its Field’s label (or `aria-label`), holding a date field named “Date” and a “Time” group of Selects (Hour, Minute, AM or PM).',
    'The date field is a button that opens a calendar dialog (see Date Picker); the picked day and the Field’s help and error text are its description.',
    'On iOS and Android, where group names are not read, each part carries the field’s name, as in “Starts, Date” and “Starts, Hour”, and the help text is its hint.',
    'The date and the time each open their own panel, so no overlay opens inside another.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between the date field and the time selects.' },
    { keys: 'Enter / Space', action: 'Opens the calendar or a time list.' },
    { keys: 'Escape', action: 'Closes it without changing the value.' },
  ],
  platformNotes: {
    ios: 'The calendar and each time list open as bottom sheets.',
    android: 'The calendar and each time list open as bottom sheets; the back button closes them.',
  },
  related: ['date-picker', 'time-picker', 'calendar', 'field'],
})
