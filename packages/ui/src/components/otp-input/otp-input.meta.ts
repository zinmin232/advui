import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'OTP Input',
  slug: 'otp-input',
  category: 'forms',
  description: 'A one-time-code field drawn as separate slots, with paste and SMS autofill.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['OtpInput'],
  files: ['components/otp-input/OtpInput.tsx', 'components/otp-input/index.ts'],
  keywords: ['otp', 'one-time code', 'verification code', 'pin', '2fa', 'sms code'],
  usage: `import { FormField, OtpInput } from '@advui/core'

<FormField label="Verification code">
  <OtpInput onComplete={verify} />
</FormField>`,
  parts: [
    {
      name: 'OtpInput',
      description: 'Also accepts Input props such as `aria-label`, `autoFocus` and `name`.',
      props: [
        { name: 'length', type: 'number', default: '6', description: 'Number of characters.' },
        { name: 'value / defaultValue', type: 'string', description: 'The code typed so far.' },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called on every change.',
        },
        {
          name: 'onComplete',
          type: '(value: string) => void',
          description: 'Called once every slot is filled.',
        },
        {
          name: 'type',
          type: "'numeric' | 'alphanumeric'",
          default: "'numeric'",
          description: 'Which characters are kept; others are dropped.',
        },
        {
          name: 'groupSize',
          type: 'number',
          description: 'Draws a dash after every N slots.',
        },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Slot size.' },
        { name: 'invalid / disabled', type: 'boolean', default: 'false', description: 'As Input.' },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'grouped', title: 'Grouped and invalid' },
  ],
  accessibility: [
    'It is one text box, so screen readers announce one field and its whole value, not six.',
    'Give it a label with Form Field or `aria-label`; the slots are hidden from assistive technology.',
    'Pasting a full code, or picking it from the SMS suggestion, fills every slot at once.',
  ],
  keyboard: [
    { keys: 'Characters', action: 'Fill the next slot.' },
    { keys: 'Backspace', action: 'Clears the last slot.' },
  ],
  platformNotes: {
    web: '`autocomplete="one-time-code"` lets browsers offer codes from SMS.',
    ios: '`textContentType="oneTimeCode"` shows the code from Messages above the keyboard.',
    android: '`autoComplete="sms-otp"` lets autofill offer the code from SMS.',
  },
  related: ['input', 'form-field'],
})
