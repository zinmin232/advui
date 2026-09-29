import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Form Field',
  slug: 'form-field',
  category: 'forms',
  description: 'A label, one control, help text and an error message, wired together.',
  status: 'beta',
  since: '0.4.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['FormField'],
  files: ['components/form-field/FormField.tsx', 'components/form-field/index.ts'],
  keywords: ['field', 'form control', 'helper text', 'validation', 'error message'],
  usage: `import { FormField, Input } from '@advui/core'

<FormField label="Email" description="We never share it." error={error}>
  <Input placeholder="you@example.com" />
</FormField>`,
  parts: [
    {
      name: 'FormField',
      description:
        'Passes `id`, `invalid`, `disabled` and `aria-required` to its child control, and links the help and error text to it.',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Visible label, linked to the control.' },
        { name: 'description', type: 'ReactNode', description: 'Help text under the control.' },
        {
          name: 'error',
          type: 'ReactNode',
          description: 'Error message. Shows under the control and marks it invalid.',
        },
        {
          name: 'required',
          type: 'boolean',
          default: 'false',
          description: 'Required marker on the label and `aria-required` on the control.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description:
            'Dims the label and disables the control. Also on while the surrounding Form is `disabled`.',
        },
        {
          name: 'children',
          type: 'ReactElement',
          description:
            'One control (Input, Textarea, Password Input, Number Input). Its own `id` is kept.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'With help text' },
    { name: 'validation', title: 'Required and invalid' },
  ],
  accessibility: [
    'The label targets the control (`htmlFor` ↔ `id`), so clicking it focuses the control.',
    'Help and error text are linked with `aria-describedby` on web and read as the hint on native.',
    'An error sets `aria-invalid` on the control; the message is text, not just a red border.',
  ],
  platformNotes: {
    ios: 'Only string help and error text become the VoiceOver hint.',
    android: 'Only string help and error text become the TalkBack hint.',
  },
  related: ['form', 'input', 'label', 'password-input', 'number-input'],
})
