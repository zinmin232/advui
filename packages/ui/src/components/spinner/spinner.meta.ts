import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Spinner',
  slug: 'spinner',
  category: 'feedback',
  description: 'An indeterminate loading indicator.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Spinner'],
  files: [
    'components/spinner/Spinner.tsx',
    'components/spinner/Spinner.native.tsx',
    'components/spinner/sizes.ts',
    'components/spinner/index.ts',
  ],
  keywords: ['loading', 'busy', 'activity indicator'],
  usage: `import { Spinner } from '@advui/core'

<Spinner label="Loading orders" />`,
  parts: [
    {
      name: 'Spinner',
      props: [
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: '16, 20 or 28px.',
        },
        {
          name: 'color',
          type: 'string',
          description: 'Theme token (e.g. `$primary`) or color. Defaults to the text color.',
        },
        { name: 'label', type: 'string', default: "'Loading'", description: 'Accessible name.' },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Sizes and colors' }],
  accessibility: [
    'Exposes `role="progressbar"` with an accessible name and `aria-busy`.',
    'With reduced motion the spinner keeps rotating, but slower, because it communicates state.',
  ],
  platformNotes: {
    web: 'Lightweight CSS-animated SVG (no JS animation).',
    ios: 'Native `ActivityIndicator`.',
    android: 'Native `ActivityIndicator`.',
  },
  related: ['progress', 'skeleton', 'button'],
})
