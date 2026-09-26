import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Textarea',
  slug: 'textarea',
  category: 'forms',
  description: 'A multi-line text field for longer input.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Textarea'],
  files: ['components/textarea/Textarea.tsx', 'components/textarea/index.ts'],
  keywords: ['multiline', 'comment', 'message', 'bio'],
  usage: `import { Textarea } from '@adv-ui/core'

<Textarea aria-label="Message" placeholder="Type your message…" />`,
  parts: [
    {
      name: 'Textarea',
      props: [
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description: 'Error styling + `aria-invalid`.',
        },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents editing.' },
        {
          name: 'resize',
          type: "'none' | 'vertical'",
          default: "'vertical'",
          description: 'User resizing (web only).',
        },
        { name: 'rows', type: 'number', description: 'Initial visible lines (web).' },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'With label and hint' }],
  accessibility: [
    'Pair with a `Label` or `aria-label`.',
    'Use `aria-describedby` to link helper or error text.',
  ],
  platformNotes: {
    web: 'Renders a native `<textarea>`.',
    ios: 'Multiline `TextInput`; text aligns to the top.',
    android: 'Multiline `TextInput` with `textAlignVertical="top"`.',
  },
  related: ['input', 'label'],
})
