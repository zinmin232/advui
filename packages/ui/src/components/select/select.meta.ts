import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Select',
  slug: 'select',
  category: 'forms',
  description:
    'Choose one option from a list — a dropdown on desktop, a bottom sheet on touch devices.',
  status: 'beta',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Select'],
  files: ['components/select/Select.tsx', 'components/select/index.ts'],
  keywords: ['dropdown', 'picker', 'listbox', 'combobox', 'options'],
  usage: `import { Label, Select } from '@advui/core'

<Label htmlFor="country">Country</Label>
<Select id="country" value={country} onValueChange={setCountry} placeholder="Choose…">
  <Select.Item value="mm">Myanmar</Select.Item>
  <Select.Item value="th">Thailand</Select.Item>
</Select>`,
  parts: [
    {
      name: 'Select',
      props: [
        { name: 'value', type: 'string', description: 'Selected value.' },
        {
          name: 'defaultValue',
          type: 'string',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called with the chosen value.',
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'Select…'",
          description: 'Shown when nothing is selected.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Trigger height.',
        },
        { name: 'invalid', type: 'boolean', description: 'Error styling and `aria-invalid`.' },
        { name: 'disabled', type: 'boolean', description: 'Not focusable or editable.' },
        { name: 'id', type: 'string', description: 'Links the trigger to a Label’s `htmlFor`.' },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the select when there is no visible label.',
        },
        {
          name: 'width',
          type: 'SizeTokens | string',
          token: 'size',
          default: "'100%'",
          description: 'Trigger width.',
        },
      ],
      children: { accepts: ['Select.Item', 'Select.Group'] },
    },
    {
      name: 'Select.Item',
      props: [
        {
          name: 'value',
          type: 'string',
          required: true,
          description: 'Option value. Children are the label.',
        },
      ],
      children: { accepts: 'text' },
      parents: ['Select', 'Select.Group'],
    },
    {
      name: 'Select.Group',
      props: [{ name: 'label', type: 'string', description: 'Group heading.' }],
      children: { accepts: ['Select.Item'] },
      parents: ['Select'],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'groups', title: 'Grouped options' },
  ],
  accessibility: [
    'The trigger is a `combobox` with `aria-expanded`; options use `role="option"` and `aria-selected`.',
    'Typeahead: typing letters jumps to matching options.',
    'On touch devices options open in a modal sheet with large touch targets.',
  ],
  keyboard: [
    { keys: 'Enter / Space / ↓', action: 'Opens the list.' },
    { keys: '↑ ↓', action: 'Moves between options.' },
    { keys: 'Enter', action: 'Selects the focused option.' },
    { keys: 'Escape', action: 'Closes without changing the value.' },
  ],
  responsive: 'Below the `md` breakpoint on touch devices the list becomes a bottom sheet.',
  platformNotes: {
    web: 'Server-renders a static trigger and mounts the interactive select after hydration (avoids SSR mismatches).',
    ios: 'Opens in a bottom sheet (Tamagui Sheet).',
    android:
      'Opens in a bottom sheet; back button closes it. With `androidRipple` (on in `material()`), presses show the native ripple.',
  },
  related: ['radio-group', 'combobox'],
})
