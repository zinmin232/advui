import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Number Input',
  slug: 'number-input',
  category: 'forms',
  description: 'A numeric field with − and + buttons, limits and a step.',
  status: 'beta',
  since: '0.4.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['NumberInput'],
  files: ['components/number-input/NumberInput.tsx', 'components/number-input/index.ts'],
  keywords: ['number', 'stepper', 'spinbutton', 'quantity', 'counter'],
  usage: `import { Field, NumberInput } from '@advui/core'

<Field label="Guests">
  <NumberInput defaultValue={2} min={1} max={10} />
</Field>`,
  parts: [
    {
      name: 'NumberInput',
      description: 'Also accepts Input props such as `invalid`, `placeholder` and `aria-label`.',
      props: [
        { name: 'value', type: 'number | null', description: '`null` when the field is empty.' },
        {
          name: 'defaultValue',
          type: 'number | null',
          default: 'null',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: number | null) => void',
          description: 'Called when a valid number is typed or stepped.',
        },
        { name: 'min', type: 'number', description: 'Lowest value; typed values clamp on blur.' },
        { name: 'max', type: 'number', description: 'Highest value; typed values clamp on blur.' },
        {
          name: 'step',
          type: 'number',
          default: '1',
          description: 'Amount added by the buttons and arrow keys.',
        },
        {
          name: 'decrementLabel',
          type: 'string',
          default: "'Decrease'",
          description: 'Accessible name of the minus button.',
        },
        {
          name: 'incrementLabel',
          type: 'string',
          default: "'Increase'",
          description: 'Accessible name of the plus button.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'As Input.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'decimal', title: 'Decimal step' },
  ],
  accessibility: [
    'The field is a `spinbutton` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`.',
    'The − and + buttons are disabled at the limits.',
    'On web the buttons are skipped by Tab, because the arrow keys do the same from the field.',
  ],
  keyboard: [
    { keys: 'ArrowUp / ArrowDown', action: 'Adds or removes one step.' },
    { keys: 'Home / End', action: 'Jumps to `min` / `max` when set.' },
  ],
  platformNotes: {
    ios: 'VoiceOver swipe up / down steps the value (increment / decrement actions).',
    android: 'TalkBack volume keys or swipes step the value (increment / decrement actions).',
  },
  related: ['input', 'slider', 'field'],
})
