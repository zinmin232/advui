import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Password Input',
  slug: 'password-input',
  category: 'forms',
  description: 'A password field with a button that shows and hides the text.',
  status: 'beta',
  since: '0.4.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['PasswordInput'],
  files: ['components/password-input/PasswordInput.tsx', 'components/password-input/index.ts'],
  keywords: ['password', 'secret', 'show password', 'reveal', 'login'],
  usage: `import { Field, PasswordInput } from '@advui/core'

<Field label="Password">
  <PasswordInput />
</Field>`,
  parts: [
    {
      name: 'PasswordInput',
      description: 'Accepts every Input prop except `type` and `secureTextEntry`.',
      props: [
        {
          name: 'visible / defaultVisible',
          type: 'boolean',
          default: 'false',
          description: 'Whether the password is shown.',
        },
        {
          name: 'onVisibleChange',
          type: '(visible: boolean) => void',
          description: 'Called when the button is pressed.',
        },
        {
          name: 'toggleLabel',
          type: 'string',
          default: "'Show password'",
          description: 'Accessible name of the button.',
        },
        {
          name: 'autoComplete',
          type: 'string',
          default: "'current-password'",
          description: "Use 'new-password' on sign-up forms.",
        },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'As Input.' },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'The button is a toggle with a fixed name ("Show password") and `aria-pressed`, so its state is announced instead of a changing label.',
    'Password managers and autofill see a normal password field.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves from the field to the show/hide button.' },
    { keys: 'Space / Enter', action: 'Shows or hides the password (on the button).' },
  ],
  platformNotes: {
    web: 'The field switches between `type="password"` and `type="text"`.',
    ios: 'Uses `secureTextEntry`; iOS may clear the field when typing resumes after hiding.',
    android: 'Uses `secureTextEntry`.',
  },
  related: ['input', 'field'],
})
