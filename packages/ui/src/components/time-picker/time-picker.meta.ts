import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Time Picker',
  slug: 'time-picker',
  category: 'forms',
  description: 'Hour, minute and optional AM/PM selects that produce an "HH:mm" time.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['TimePicker'],
  files: ['components/time-picker/TimePicker.tsx', 'components/time-picker/index.ts'],
  keywords: ['time', 'clock', 'hour', 'minute', 'appointment'],
  usage: `import { FormField, TimePicker } from '@advui/core'

<FormField label="Start time">
  <TimePicker value={time} onValueChange={setTime} hourCycle={12} minuteStep={15} />
</FormField>`,
  parts: [
    {
      name: 'TimePicker',
      props: [
        {
          name: 'value / defaultValue',
          type: 'string | null',
          description: '24-hour `"HH:mm"`, whatever `hourCycle` shows.',
        },
        {
          name: 'onValueChange',
          type: '(value: string | null) => void',
          description: 'Called once an hour and a minute are both picked, and on later changes.',
        },
        {
          name: 'hourCycle',
          type: '12 | 24',
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
          name: 'id',
          type: 'string',
          description: 'Goes on the hour select, so a Form Field label targets it.',
        },
        {
          name: 'hourLabel / minuteLabel / periodLabel',
          type: 'string',
          default: "'Hour' / 'Minute' / 'AM or PM'",
          description: 'Accessible names of the selects.',
        },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'As Select.' },
        {
          name: 'invalid / disabled',
          type: 'boolean',
          default: 'false',
          description: 'As Select.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: '24-hour' },
    { name: 'twelve-hour', title: '12-hour, 15-minute steps' },
  ],
  accessibility: [
    'A `group` of Selects, each with its own name (Hour, Minute, AM or PM). Name the group with `aria-label` when it has no Form Field.',
    'Each Select is a listbox on web and an accessible bottom sheet on phones.',
  ],
  platformNotes: {
    ios: 'Each part opens as a bottom sheet.',
    android: 'Each part opens as a bottom sheet; the back button closes it.',
  },
  related: ['date-picker', 'select', 'form-field'],
})
