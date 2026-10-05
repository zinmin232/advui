import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Date Picker',
  slug: 'date-picker',
  category: 'forms',
  description: 'A field that opens a calendar in a popover, or a bottom sheet on phones.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['DatePicker'],
  files: [
    'components/date-picker/DatePicker.tsx',
    'components/date-picker/PickerTrigger.tsx',
    'components/date-picker/index.ts',
    'components/calendar/Calendar.tsx',
    'components/calendar/dates.ts',
  ],
  keywords: ['date', 'date picker', 'calendar', 'birthday', 'due date'],
  usage: `import { DatePicker, Field } from '@advui/core'

<Field label="Due date">
  <DatePicker value={due} onValueChange={setDue} min={new Date()} />
</Field>`,
  parts: [
    {
      name: 'DatePicker',
      description:
        'Also takes Calendar’s `min`, `max`, `isDateDisabled`, `weekStartsOn` and `locale`.',
      props: [
        { name: 'value', type: 'Date | null', description: 'The picked day.' },
        {
          name: 'defaultValue',
          type: 'Date | null',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: Date | null) => void',
          description: 'Called when a day is picked; the panel then closes.',
        },
        { name: 'open', type: 'boolean', description: 'Open state of the panel.' },
        { name: 'defaultOpen', type: 'boolean', description: 'Starting `open` when uncontrolled.' },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called with the new `open`.',
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'Pick a date'",
          description: 'Shown while empty.',
        },
        {
          name: 'formatOptions',
          type: 'Intl.DateTimeFormatOptions',
          default: "{ dateStyle: 'medium' }",
          description: 'How the day is written in the field.',
        },
        {
          name: 'title',
          type: 'string',
          default: "'Choose a date'",
          description: 'Title of the panel, which names it for screen readers.',
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
          description: 'Error styling and `aria-invalid`.',
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
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'The field is a button with `aria-haspopup="dialog"`; a Field’s label names it, and the picked date is linked as its description.',
    'The panel is a dialog named by its title. Focus moves into it and returns to the field when it closes.',
    'The calendar inside follows the WAI-ARIA grid pattern (see Calendar).',
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Opens the calendar (on the field).' },
    { keys: 'Escape', action: 'Closes it without changing the date.' },
  ],
  platformNotes: {
    ios: 'Opens as a bottom sheet.',
    android: 'Opens as a bottom sheet; the back button closes it.',
  },
  related: ['calendar', 'date-range-picker', 'time-picker', 'field'],
})
