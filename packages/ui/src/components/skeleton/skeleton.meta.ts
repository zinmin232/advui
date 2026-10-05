import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Skeleton',
  slug: 'skeleton',
  category: 'foundations',
  description: 'A pulsing placeholder that previews the shape of loading content.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Skeleton'],
  files: ['components/skeleton/Skeleton.tsx', 'components/skeleton/index.ts'],
  keywords: ['loading', 'placeholder', 'shimmer'],
  usage: `import { Skeleton } from '@advui/core'

<Skeleton height="$4" width="60%" />`,
  parts: [
    {
      name: 'Skeleton',
      description: 'Accepts any layout/size style prop.',
      props: [
        {
          name: 'circle',
          type: 'boolean',
          default: 'false',
          description: 'Fully rounded (for avatars).',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [{ name: 'card', title: 'Loading card' }],
  accessibility: [
    'Skeletons are `aria-hidden`. Mark the loading region with `aria-busy` and announce completion if needed.',
    'The pulse animation stops when the user prefers reduced motion.',
  ],
  platformNotes: {
    web: 'Pulses with a CSS animation.',
    ios: 'Static placeholder (no animation).',
    android: 'Static placeholder (no animation).',
  },
  related: ['spinner', 'progress'],
})
