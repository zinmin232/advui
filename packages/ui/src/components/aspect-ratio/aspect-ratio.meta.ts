import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Aspect Ratio',
  slug: 'aspect-ratio',
  category: 'layout',
  description:
    'Keeps content at a fixed width-to-height ratio as the width changes, for images, video and maps.',
  status: 'beta',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['AspectRatio'],
  files: ['components/aspect-ratio/AspectRatio.tsx', 'components/aspect-ratio/index.ts'],
  keywords: ['ratio', '16:9', 'image', 'video', 'embed', 'responsive media'],
  usage: `import { AspectRatio } from '@advui/core'

<AspectRatio ratio={16 / 9} borderRadius="$lg">
  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} accessibilityLabel="…" />
</AspectRatio>`,
  parts: [
    {
      name: 'AspectRatio',
      props: [
        {
          name: 'ratio',
          type: 'number',
          default: '1',
          description: 'Width divided by height, e.g. `16 / 9`.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Content that fills the box: 100% width and height, or absolutely positioned.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Image' },
    { name: 'ratios', title: 'Common ratios' },
  ],
  accessibility: [
    'A plain layout box with no role. Give images inside it a text alternative (`alt` on web, `accessibilityLabel` on native).',
  ],
  responsive: 'It is 100% wide by default, so its height follows the width at every breakpoint.',
  platformNotes: {
    web: 'Uses the CSS `aspect-ratio` property.',
    ios: 'Uses the React Native `aspectRatio` style.',
    android: 'Same as iOS.',
  },
  related: ['avatar', 'card'],
})
