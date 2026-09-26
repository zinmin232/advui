import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Grid',
  slug: 'grid',
  category: 'layout',
  description: 'Equal-width responsive columns that work identically on web and native.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Grid'],
  files: ['components/layout/Grid.tsx'],
  keywords: ['columns', 'grid', 'responsive', 'cards', 'gallery'],
  usage: `import { Card, Grid } from '@advui/core'

<Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="$4">
  {items.map((item) => <Card key={item.id}>…</Card>)}
</Grid>`,
  parts: [
    {
      name: 'Grid',
      props: [
        {
          name: 'columns',
          type: 'number | { base?, xs?, sm?, md?, lg?, xl?, xxl? }',
          default: '1',
          description: 'Column count, optionally per breakpoint (mobile-first).',
        },
        { name: 'gap', type: 'SpaceTokens', default: "'$4'", description: 'Gap between cells.' },
      ],
    },
  ],
  examples: [{ name: 'grid', title: 'Responsive stats' }],
  accessibility: ['Purely visual. Reading order follows source order on all platforms.'],
  responsive:
    'Breakpoint columns compile to CSS media queries on web (SSR-safe) and to window-size checks on native.',
  platformNotes: {
    web: 'Flex-wrap based (CSS grid is not available on native).',
    ios: 'Flex-wrap based.',
    android: 'Flex-wrap based.',
  },
  related: ['stack', 'container'],
})
