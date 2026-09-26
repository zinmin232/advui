import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Alert',
  slug: 'alert',
  category: 'feedback',
  description: 'An inline message that draws attention without interrupting the task.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Alert'],
  files: ['components/alert/Alert.tsx', 'components/alert/index.ts'],
  keywords: ['callout', 'banner', 'notice', 'message', 'warning', 'error'],
  usage: `import { Alert } from '@advui/core'

<Alert variant="warning">
  <Alert.Title>Trial ending</Alert.Title>
  <Alert.Description>Upgrade to keep your projects.</Alert.Description>
</Alert>`,
  parts: [
    {
      name: 'Alert',
      props: [
        {
          name: 'variant',
          type: "'default' | 'info' | 'success' | 'warning' | 'error'",
          default: "'default'",
          description: 'Intent and icon.',
        },
        {
          name: 'icon',
          type: 'ReactNode | null',
          description: 'Custom icon, or `null` to hide it.',
        },
      ],
    },
    { name: 'Alert.Title', props: [] },
    { name: 'Alert.Description', props: [] },
  ],
  examples: [{ name: 'variants', title: 'Variants' }],
  accessibility: [
    '`error` and `warning` use `role="alert"` (announced immediately); other variants use `role="status"` (polite).',
    'Only render an `alert` when something just happened — pre-existing content should not use it.',
    'Color is paired with an icon and text, never used alone.',
  ],
  related: ['toast', 'badge'],
})
