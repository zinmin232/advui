import { defineMeta } from '../../meta/types.ts'

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
  usage: `import { Field, RadioGroup } from '@advui/core'

<Field label="Plan">
  <RadioGroup value={plan} onValueChange={setPlan}>
    <RadioGroup.Item value="free" label="Free" description="Up to 3 projects" />
    <RadioGroup.Item value="pro" label="Pro" />
  </RadioGroup>
</Field>`,
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
          name: 'gap',
          type: 'SpaceTokens',
          token: 'space',
          default: "'3'",
          description: 'Space between items.',
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
        {
          name: 'label',
          type: 'ReactNode',
          description:
            'Text beside the radio; pressing it selects the item. Without one, give the item an `aria-label`, or an `id` and your own `Label htmlFor`.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Smaller text under the label, linked as the radio’s description.',
        },
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
  examples: [
    { name: 'basic', title: 'Plans', description: 'Items with a label and a description.' },
  ],
  accessibility: [
    'Implements the WAI-ARIA radio group: `role="radiogroup"` with `role="radio"` items and `aria-checked`.',
    'Only the selected item is in the tab order; arrow keys move and select (roving focus).',
    'Name the group with `aria-label` or `aria-labelledby`; inside a Field, the field’s label names it.',
    'An item’s `label` names its radio and its `description` is linked through `aria-describedby`.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves focus into the group (to the selected item).' },
    { keys: 'Arrow keys', action: 'Moves focus and selection between items.' },
    { keys: 'Space', action: 'Selects the focused item.' },
  ],
  platformNotes: {
    ios: 'VoiceOver has no group names, so each item reads the group’s name and help text as its hint, after its own description. A labelled item’s visible label and description are hidden from VoiceOver, since the radio already reads them.',
    android:
      'TalkBack has no group names, so each item reads the group’s name and help text as its hint, after its own description. A labelled item’s visible label and description are hidden from TalkBack, since the radio already reads them.',
  },
  related: ['checkbox-group', 'checkbox', 'select'],
})
