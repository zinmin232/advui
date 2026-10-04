import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Radio Group',
  slug: 'radio-group',
  category: 'forms',
  description: 'A set of mutually exclusive options where exactly one can be selected.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['RadioGroup'],
  files: ['components/radio-group/RadioGroup.tsx', 'components/radio-group/index.ts'],
  keywords: ['radio', 'option', 'choice', 'single select'],
  usage: `import { HStack, Label, RadioGroup } from '@advui/core'

<RadioGroup value={plan} onValueChange={setPlan} aria-label="Plan">
  <HStack gap="$2">
    <RadioGroup.Item value="free" id="plan-free" />
    <Label htmlFor="plan-free">Free</Label>
  </HStack>
</RadioGroup>`,
  parts: [
    {
      name: 'RadioGroup',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'Selected value, when you control it.',
        },
        {
          name: 'defaultValue',
          type: 'string',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called when the selection changes.',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          options: ['vertical', 'horizontal'],
          default: "'vertical'",
          description: 'Arrow-key direction and layout.',
        },
        { name: 'disabled', type: 'boolean', description: 'Disables all items.' },
        {
          name: 'name',
          type: 'string',
          platforms: ['web'],
          description: 'Field name when a native form is submitted.',
        },
        {
          name: 'required',
          type: 'boolean',
          platforms: ['web'],
          description: 'The native form will not submit until an option is picked.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'RadioGroup.Item',
      props: [
        { name: 'value', type: 'string', required: true, description: 'The option value.' },
        { name: 'id', type: 'string', description: 'Link to a Label with the same `htmlFor`.' },
        {
          name: 'size',
          type: "'sm' | 'md'",
          options: ['sm', 'md'],
          default: "'md'",
          description: '16 or 20px.',
        },
        { name: 'disabled', type: 'boolean', description: 'Disables this item.' },
      ],
      children: { accepts: 'none' },
      within: 'RadioGroup',
    },
  ],
  examples: [{ name: 'basic', title: 'Plans' }],
  accessibility: [
    'Implements the WAI-ARIA radio group: `role="radiogroup"` with `role="radio"` items and `aria-checked`.',
    'Only the selected item is in the tab order; arrow keys move and select (roving focus).',
    'Name the group with `aria-label` or `aria-labelledby`.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves focus into the group (to the selected item).' },
    { keys: 'Arrow keys', action: 'Moves focus and selection between items.' },
    { keys: 'Space', action: 'Selects the focused item.' },
  ],
  related: ['checkbox', 'select'],
})
