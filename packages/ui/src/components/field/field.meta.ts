import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Field',
  slug: 'field',
  category: 'forms',
  description:
    'A label, a control, help text and an error message, wired together for screen readers. Validation stays with your app or form library.',
  status: 'beta',
  since: '0.4.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Field',
    'FieldProps',
    'FieldOrientation',
    'useFieldControl',
    'FieldControlProps',
    'FieldState',
    'FormField',
    'FormFieldProps',
  ],
  files: ['components/field/Field.tsx', 'components/field/index.ts'],
  keywords: [
    'field',
    'form field',
    'form control',
    'label',
    'helper text',
    'help text',
    'required',
    'optional',
    'validation',
    'error message',
    'react hook form',
    'formik',
  ],
  usage: `import { Field, Input } from '@advui/core'

<Field label="Email" description="We never share it." error={errors.email?.message} required>
  <Input value={email} onChangeText={setEmail} />
</Field>`,
  parts: [
    {
      name: 'Field',
      description:
        'A View that takes every view prop (`padding`, `width`, `backgroundColor`, `theme`, media props, `testID`…). It tells the control inside it, at any depth, its id, state and descriptions through context, and never clones its children. Every core form control reads it: Input, Textarea, Select, Checkbox, Switch, Radio Group, Password, Number and OTP Input, the date and time pickers, Combobox, Autocomplete, Multi Select, File Upload and Rich Text Editor.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description:
            'The control, or a layout with one control in it (an Input next to a Button).',
        },
        {
          name: 'label',
          type: 'ReactNode',
          description:
            'Visible label, linked to the control. Without one, give the control an `aria-label`.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Help text under the control. Stays visible when there is an error.',
        },
        {
          name: 'error',
          type: 'ReactNode',
          description:
            'Error message under the help text. It marks the control invalid; `undefined`, `null`, `false` and `""` mean no error.',
        },
        {
          name: 'required',
          type: 'boolean',
          default: 'false',
          description: 'Required marker on the label and `aria-required` on the control.',
        },
        {
          name: 'optional',
          type: 'boolean',
          default: 'false',
          description: 'Adds "(optional)" to the label. `required` wins when both are set.',
        },
        {
          name: 'optionalText',
          type: 'string',
          default: "'(optional)'",
          description: 'The text `optional` adds, e.g. for another language.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description:
            'Dims the label and disables the control. Also on while the surrounding Form is `disabled`.',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          options: ['vertical', 'horizontal'],
          default: "'vertical'",
          description:
            '`horizontal` puts the label beside the control, in a third of the width, with the help and error text under the control.',
        },
        {
          name: 'gap',
          type: 'SpaceTokens | number',
          token: 'space',
          default: "'$2'",
          description: 'Space between the label, control and messages.',
        },
        {
          name: 'fullWidth',
          type: 'boolean',
          default: 'false',
          description: "Fills the container's width, e.g. in a horizontal Form.",
        },
        {
          name: 'id',
          type: 'string',
          description:
            "The control's id, which the label targets. Defaults to the `id` of a single child, or a generated one.",
        },
      ],
      children: { accepts: 'any', min: 1 },
    },
    {
      name: 'useFieldControl',
      kind: 'hook',
      description:
        'For your own controls: `const props = useFieldControl(ownProps)` fills in what the surrounding Field decides, so a Field wires your control like a core one. Outside a Field it returns the props unchanged, except `disabled`, which is `true` inside a disabled Form.',
      props: [
        {
          name: 'id',
          type: 'string',
          description: 'The id the label targets. The control’s own `id` wins.',
        },
        {
          name: 'invalid',
          type: 'boolean',
          description: '`true` when the field has an error, or the control is `invalid` itself.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          description:
            '`true` when the field, the surrounding Form or the control is disabled. A disabled Form disables the control even without a Field.',
        },
        {
          name: 'aria-required',
          type: 'boolean',
          description: '`true` when the field is `required`.',
        },
        {
          name: 'aria-describedby',
          type: 'string',
          description: 'Web: the ids of the error and help text, after the control’s own.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Native: the text of the label. The control’s own wins.',
        },
        {
          name: 'accessibilityHint',
          type: 'string',
          description: 'Native: the text of the error and help text.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'description', title: 'With help text' },
    { name: 'required-optional', title: 'Required and optional' },
    {
      name: 'validation',
      title: 'Error message',
      description: 'Type a valid email or a longer password: the app sets `error`, Field shows it.',
    },
    { name: 'disabled', title: 'Disabled' },
    { name: 'horizontal', title: 'Horizontal' },
    {
      name: 'compound',
      title: 'Control in a layout',
      description: 'The Input gets the label and help text; the Button is left alone.',
    },
    { name: 'rich-content', title: 'Elements as label, help and error' },
    { name: 'form', title: 'In a Form' },
  ],
  accessibility: [
    'The label targets the control (`htmlFor` ↔ `id`), so clicking it focuses the control. A Radio Group is named with `aria-labelledby` instead.',
    'Help and error text are linked with `aria-describedby` on web (error first). On native, the text of the label names the control, the help and error text become its hint, and the visible label is hidden from screen readers so it is not read twice.',
    'An error sets `aria-invalid` on the control; the message is text, not just a red border.',
    '`required` sets `aria-required` on the control, so screen readers say "required"; the asterisk itself is hidden from them. "(optional)" is part of the label.',
    'A disabled field disables its control, so it leaves the Tab order and is announced as dimmed.',
  ],
  responsive:
    '`orientation` is a plain prop, not a style, so the markup never depends on the screen size. Use `vertical` (the default) on narrow screens.',
  platformNotes: {
    ios: 'The text of the label names the control, and the help and error text become the VoiceOver hint. iOS has no required or invalid state for screen readers, so put it in the error text.',
    android:
      'The text of the label names the control, and the help and error text become the TalkBack hint. Android has no required or invalid state for screen readers, so put it in the error text.',
  },
  related: ['form', 'input', 'label', 'select', 'checkbox', 'password-input'],
})
