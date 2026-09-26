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
          name: 'value / defaultValue',
          type: 'string',
          description: 'Selected value (controlled / uncontrolled).',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called when the selection changes.',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: 'Arrow-key direction and layout.',
        },
        { name: 'disabled', type: 'boolean', description: 'Disables all items.' },
        {
          name: 'name / required',
          type: 'string / boolean',
          description: 'Native form participation (web).',
        },
      ],
    },
    {
      name: 'RadioGroup.Item',
      props: [
        { name: 'value', type: 'string', required: true, description: 'The option value.' },
        { name: 'id', type: 'string', description: 'Link to a Label with the same `htmlFor`.' },
        { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '16 or 20px.' },
        { name: 'disabled', type: 'boolean', description: 'Disables this item.' },
      ],
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
