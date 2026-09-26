import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Checkbox',
  slug: 'checkbox',
  category: 'forms',
  description:
    'Lets users select one or more options, or toggle a single setting before submitting.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Checkbox'],
  files: ['components/checkbox/Checkbox.tsx', 'components/checkbox/index.ts'],
  keywords: ['check', 'tick', 'option', 'terms', 'indeterminate'],
  usage: `import { Checkbox, HStack, Label } from '@advui/core'

<HStack gap="$2">
  <Checkbox id="terms" checked={accepted} onCheckedChange={setAccepted} />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</HStack>`,
  parts: [
    {
      name: 'Checkbox',
      props: [
        { name: 'checked', type: "boolean | 'indeterminate'", description: 'Controlled state.' },
        {
          name: 'defaultChecked',
          type: "boolean | 'indeterminate'",
          default: 'false',
          description: 'Initial state when uncontrolled.',
        },
        {
          name: 'onCheckedChange',
          type: "(checked: boolean | 'indeterminate') => void",
          description: 'Called when toggled.',
        },
        { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '16 or 20px.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents toggling.' },
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description: 'Error styling + `aria-invalid`.',
        },
        {
          name: 'name / value / required',
          type: 'string / string / boolean',
          description: 'Native form participation (web).',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'With label' },
    { name: 'indeterminate', title: 'Indeterminate (select all)' },
  ],
  playground: {
    component: 'Checkbox',
    staticProps: { 'aria-label': 'Accept terms' },
    controls: [
      { prop: 'size', type: 'select', options: ['sm', 'md'], default: 'md' },
      { prop: 'defaultChecked', type: 'boolean', default: true },
      { prop: 'disabled', type: 'boolean', default: false },
      { prop: 'invalid', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'Exposes `role="checkbox"` with `aria-checked` = true / false / mixed.',
    'Link a `Label` with `htmlFor` for a larger hit area and an accessible name.',
    'A hidden native input keeps form submission and autofill working on web.',
  ],
  keyboard: [{ keys: 'Space', action: 'Toggles the checkbox.' }],
  platformNotes: {
    web: 'Custom-drawn control backed by a hidden `<input type="checkbox">`.',
    ios: 'Pressable with checkbox semantics (iOS has no native checkbox).',
    android: 'Pressable with checkbox semantics announced by TalkBack.',
  },
  related: ['switch', 'radio-group', 'label'],
})
