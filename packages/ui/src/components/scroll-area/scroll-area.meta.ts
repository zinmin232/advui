import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Scroll Area',
  slug: 'scroll-area',
  category: 'layout',
  description:
    'A box that scrolls its content within a set height or width, with thin scrollbars in the theme colors.',
  status: 'beta',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ScrollArea'],
  files: [
    'components/scroll-area/ScrollArea.tsx',
    'components/scroll-area/ScrollArea.native.tsx',
    'components/scroll-area/index.ts',
  ],
  keywords: ['scroll', 'overflow', 'scrollbar', 'list', 'carousel', 'scroll view'],
  usage: `import { ScrollArea, VStack } from '@advui/core'

<ScrollArea aria-label="Release tags" height="$72">
  <VStack padding="$4" gap="$2">…</VStack>
</ScrollArea>`,
  parts: [
    {
      name: 'ScrollArea',
      description: 'Takes size and border props such as `height`, `maxWidth` and `borderRadius`.',
      props: [
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: 'Which way it scrolls.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the region for screen readers. Recommended.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description:
            'One child that holds the content, such as a VStack (an HStack when horizontal).',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Vertical list' },
    { name: 'horizontal', title: 'Horizontal row' },
  ],
  accessibility: [
    'On web it takes keyboard focus, so people who do not use a mouse can scroll it with the arrow keys, with a visible focus ring.',
    'With `aria-label` it is a named `region` landmark.',
    'Content keeps its own semantics; the scrollbars are the browser’s, only thinner and in theme colors.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focuses the area.' },
    { keys: 'Arrow keys / Page Up / Page Down', action: 'Scroll while it has focus.' },
  ],
  platformNotes: {
    web: 'A scrolling box with CSS `scrollbar-width: thin` and theme colors (browsers without support show their default scrollbar).',
    ios: 'A ScrollView with the platform scroll indicator.',
    android: 'Same as iOS.',
  },
  related: ['sheet', 'separator'],
})
