import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Checkbox Group',
  slug: 'checkbox-group',
  category: 'forms',
  description:
    'A labelled set of checkboxes that share one value, the list of checked options, with an optional Select All.',
  status: 'stable',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['CheckboxGroup'],
  files: ['components/checkbox-group/CheckboxGroup.tsx', 'components/checkbox-group/index.ts'],
  keywords: ['checkbox', 'multiple choice', 'options', 'select all', 'check all', 'fieldset'],
  usage: `import { CheckboxGroup, Field } from '@advui/core'

<Field label="Notifications">
  <CheckboxGroup value={channels} onValueChange={setChannels}>
    <CheckboxGroup.SelectAll label="All channels" />
    <CheckboxGroup.Item value="email" label="Email" />
    <CheckboxGroup.Item value="sms" label="SMS" description="Standard rates apply." />
  </CheckboxGroup>
</Field>`,
  parts: [
    {
      name: 'CheckboxGroup',
      description:
        'A View with `role="group"`. Lay items out freely inside it (in a nested stack, beside other content); they find the group through context.',
      props: [
        {
          name: 'value',
          type: 'string[]',
          description: 'The checked items’ values, when you control it.',
        },
        {
          name: 'defaultValue',
          type: 'string[]',
          default: '[]',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string[]) => void',
          description:
            'Called with the new list when an item or Select All is toggled. A checked item is added at the end.',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          options: ['vertical', 'horizontal'],
          default: "'vertical'",
          description: '`horizontal` puts the items in a row that wraps.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          options: ['sm', 'md'],
          default: "'md'",
          description: 'Checkbox size for every item: 16 or 20px.',
        },
        {
          name: 'gap',
          type: 'SpaceTokens',
          token: 'space',
          default: "'3'; horizontal: '5' between items, '3' between rows",
          description: 'Space between items, and between rows when a horizontal group wraps.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables every item. Also on inside a disabled Field or Form.',
        },
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description:
            'Error border and `aria-invalid` on every item. On inside a Field with an `error`.',
        },
        {
          name: 'name',
          type: 'string',
          platforms: ['web'],
          description:
            'Field name for a native form: each checked item submits its `value` under it.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the group. Inside a Field, the field’s label names it instead.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'CheckboxGroup.Item',
      description: 'A Checkbox; other Checkbox props (`id`, `aria-label`, style props) go to it.',
      props: [
        {
          name: 'value',
          type: 'string',
          required: true,
          description: 'Added to the group’s value while checked.',
        },
        {
          name: 'label',
          type: 'ReactNode',
          description:
            'Text beside the checkbox; pressing it toggles the checkbox. Without one, give the item an `aria-label` or your own `Label htmlFor`.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Smaller text under the label, linked as the checkbox’s description.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          options: ['sm', 'md'],
          default: 'the group’s',
          description: '16 or 20px.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables this item. Select All leaves it as it is.',
        },
      ],
      children: { accepts: 'none' },
      within: 'CheckboxGroup',
    },
    {
      name: 'CheckboxGroup.SelectAll',
      description:
        'A Checkbox that is checked when every item is, mixed when some are. It is not part of the value.',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Text beside the checkbox.' },
        { name: 'description', type: 'ReactNode', description: 'Smaller text under the label.' },
        {
          name: 'size',
          type: "'sm' | 'md'",
          options: ['sm', 'md'],
          default: 'the group’s',
          description: '16 or 20px.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables it. It is also disabled when every item is.',
        },
      ],
      children: { accepts: 'none' },
      within: 'CheckboxGroup',
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Labels and descriptions',
      description: 'Each item has a label and help text; one is disabled.',
    },
    {
      name: 'select-all',
      title: 'Select All',
      description:
        'Checks or clears every item, and shows a mixed state while only some are checked.',
    },
    {
      name: 'field',
      title: 'In a Field',
      description:
        'The field names the group and shows its error; the items sit in a row that wraps.',
    },
  ],
  accessibility: [
    '`role="group"`, named by `aria-label` or, inside a Field, by the field’s label (`aria-labelledby`). The field’s help and error text describe the group.',
    'Each item is a checkbox named by its `label`, with its `description` linked through `aria-describedby`. Pressing the label toggles it.',
    'Select All is `aria-checked="mixed"` while only some items are checked, and lists the items in `aria-controls`.',
    'Every checkbox stays a Tab stop, as in the WAI-ARIA checkbox pattern. Space toggles the focused one.',
    'A Field’s `required` adds the marker to its label, but a group has no required state for screen readers: say what is required in the help or error text.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the next checkbox.' },
    { keys: 'Space', action: 'Toggles the focused checkbox.' },
  ],
  platformNotes: {
    web: 'A `div` with `role="group"`; each checked item has a hidden `<input type="checkbox">` for form submission.',
    ios: 'VoiceOver has no group names, so each item reads the group’s name and help text as its hint, after its own description. The visible label and description are hidden from VoiceOver, since the checkbox already reads them.',
    android:
      'TalkBack has no group names, so each item reads the group’s name and help text as its hint, after its own description. The visible label and description are hidden from TalkBack, since the checkbox already reads them.',
  },
  related: ['checkbox', 'radio-group', 'field', 'multi-select'],
})
