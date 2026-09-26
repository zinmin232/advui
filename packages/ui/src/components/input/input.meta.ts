import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Input',
  slug: 'input',
  category: 'forms',
  description: 'A single-line text field.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Input', 'inputBaseStyle', 'fieldBoxStyle'],
  files: ['components/input/Input.tsx', 'components/input/index.ts'],
  keywords: ['text field', 'textbox', 'form', 'email', 'password'],
  usage: `import { Input, Label, VStack } from '@adv-ui/core'

<VStack gap="$2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="you@example.com" inputMode="email" />
</VStack>`,
  parts: [
    {
      name: 'Input',
      description:
        'Accepts all Tamagui Input / TextInput props (value, onChangeText, secureTextEntry, …).',
      props: [
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: '32, 40 or 48px tall.',
        },
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description: 'Error styling + `aria-invalid`.',
        },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents editing.' },
        {
          name: 'value / defaultValue',
          type: 'string',
          description: 'Controlled or uncontrolled value.',
        },
        {
          name: 'onChangeText',
          type: '(text: string) => void',
          description: 'Called on every change (web and native).',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Hint text — never a replacement for a label.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'With label' },
    { name: 'sizes', title: 'Sizes' },
    { name: 'states', title: 'Invalid and disabled' },
  ],
  playground: {
    component: 'Input',
    staticProps: { 'aria-label': 'Email' },
    controls: [
      { prop: 'placeholder', type: 'text', default: 'you@example.com' },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'invalid', type: 'boolean', default: false },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'Always pair with a visible `Label` (`htmlFor` ↔ `id`) or an `aria-label`.',
    '`invalid` sets `aria-invalid`; describe the error in text next to the field (not just red).',
    'Placeholder text meets 4.5:1 contrast only as a hint — it is not announced as the label.',
  ],
  keyboard: [{ keys: 'Tab', action: 'Moves focus into and out of the field.' }],
  platformNotes: {
    web: 'Renders a native `<input>`, so autofill and password managers work.',
    ios: 'Use `keyboardType`, `textContentType` and `autoComplete` for the right keyboard and autofill.',
    android:
      'Use `keyboardType` and `autoComplete`; wrap forms in `KeyboardAvoidingView` on small screens.',
  },
  related: ['label', 'textarea', 'select'],
})
