import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Input',
  slug: 'input',
  category: 'forms',
  description:
    'A single-line text field, with optional icons, buttons or text inside it and addons joined to it.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Input', 'inputBaseStyle', 'fieldBoxStyle'],
  files: ['components/input/Input.tsx', 'components/input/index.ts'],
  keywords: [
    'text field',
    'textbox',
    'form',
    'email',
    'password',
    'input group',
    'addon',
    'prefix',
    'suffix',
    'adornment',
    'icon',
  ],
  usage: `import { Input, Label, VStack } from '@advui/core'

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
          options: ['sm', 'md', 'lg'],
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
        { name: 'value', type: 'string', description: 'Controlled or uncontrolled value.' },
        {
          name: 'defaultValue',
          type: 'string',
          description: 'Starting `value` when uncontrolled.',
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
        {
          name: 'leading',
          type: 'ReactNode',
          description:
            'Inside the field, before the text: an icon or small button (centered in a square the height of the field) or short text such as "$". Pressing beside the text focuses the field.',
        },
        {
          name: 'trailing',
          type: 'ReactNode',
          description:
            'Inside the field, after the text: an icon, a small button such as copy or clear, or short text such as "kg". Pass `null` while it is empty rather than leaving it out, so the field is not re-created while typing.',
        },
        {
          name: 'leadingAddon',
          type: 'ReactNode',
          description: 'A shaded box joined to the start of the field, such as "https://".',
        },
        {
          name: 'trailingAddon',
          type: 'ReactNode',
          description: 'A shaded box joined to the end of the field, such as ".com" or "USD".',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'With label' },
    { name: 'sizes', title: 'Sizes' },
    { name: 'states', title: 'Invalid and disabled' },
    {
      name: 'slots',
      title: 'Icons, text and buttons inside',
      description: 'A leading icon, a currency sign and a unit, and a copy button.',
    },
    {
      name: 'addons',
      title: 'Addons',
      description: 'Boxes joined to the field, in three sizes, one of them invalid.',
    },
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
    'Text in a slot or addon ("https://", "kg") is read with the field: added to its description on web (`aria-describedby`, after any help text) and to its hint on iOS and Android. Icons are decorative; buttons in a slot need an `aria-label`.',
    'With slots, the focus ring and the invalid and disabled styles are drawn on the whole box, and pressing an icon or addon focuses the field.',
  ],
  keyboard: [{ keys: 'Tab', action: 'Moves focus into and out of the field.' }],
  responsive:
    'With slots, `width`, `margin`, `flex` and the box props (`backgroundColor`, `border*`) size and style the whole box; the text field takes the space left between the slots.',
  platformNotes: {
    web: 'Renders a native `<input>`, so autofill and password managers work.',
    ios: 'Use `keyboardType`, `textContentType` and `autoComplete` for the right keyboard and autofill.',
    android:
      'Use `keyboardType` and `autoComplete`; wrap forms in `KeyboardAvoidingView` on small screens.',
  },
  related: ['label', 'field', 'textarea', 'select', 'password-input', 'search'],
})
