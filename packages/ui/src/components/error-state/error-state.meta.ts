import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Error State',
  slug: 'error-state',
  category: 'feedback',
  description: 'Shown in place of content that failed to load, with a retry button.',
  status: 'beta',
  since: '0.4.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ErrorState'],
  files: [
    'components/error-state/ErrorState.tsx',
    'components/error-state/index.ts',
    'components/empty-state/EmptyState.tsx',
  ],
  keywords: ['error', 'failed', 'retry', 'offline', 'something went wrong'],
  usage: `import { ErrorState } from '@advui/core'

<ErrorState
  description="Check your connection and try again."
  onRetry={refetch}
  retrying={isFetching}
/>`,
  parts: [
    {
      name: 'ErrorState',
      description: 'Empty State with an error icon; also accepts its props.',
      props: [
        {
          name: 'title',
          type: 'ReactNode',
          default: "'Something went wrong'",
          description: 'Short heading.',
        },
        { name: 'description', type: 'ReactNode', description: 'What failed and what to do.' },
        {
          name: 'onRetry',
          type: '() => void',
          description: 'Shows a retry button that calls this.',
        },
        {
          name: 'retryLabel',
          type: 'string',
          default: "'Try again'",
          description: 'Retry button text.',
        },
        {
          name: 'retrying',
          type: 'boolean',
          default: 'false',
          description: 'Spinner on the retry button.',
        },
        { name: 'children', type: 'ReactNode', description: 'More actions after Retry.' },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Retry' }],
  accessibility: [
    'On web it has the `alert` role, so screen readers announce it when it replaces content.',
    'The title is a heading, and the retry button shows a spinner and `aria-busy` while retrying.',
  ],
  platformNotes: {
    ios: 'Not announced automatically; move focus to it or announce with `AccessibilityInfo`.',
    android: 'Not announced automatically; move focus to it or announce with `AccessibilityInfo`.',
  },
  related: ['empty-state', 'alert'],
})
