import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Sticky',
  slug: 'sticky',
  category: 'layout',
  description:
    'Keeps a header or a list heading in view while its container scrolls: CSS sticky on web, a pinned ScrollArea header on iOS and Android.',
  status: 'beta',
  since: '0.10.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Sticky', 'StickyProps', 'StickyEdge'],
  files: ['components/sticky/Sticky.tsx', 'components/sticky/index.ts'],
  keywords: ['sticky', 'pinned', 'fixed header', 'section header', 'position sticky'],
  usage: `import { ScrollArea, Sticky, VStack } from '@advui/core'

<Sticky offset="$0"><Header /></Sticky>

// Pinned on iOS and Android too: a direct child of the ScrollArea's content
<ScrollArea height={400}>
  <VStack>
    <Sticky><Text>Kachin</Text></Sticky>
    …
  </VStack>
</ScrollArea>`,
  parts: [
    {
      name: 'Sticky',
      description:
        'A View that takes View style props; give it a background so content scrolls under it.',
      props: [
        {
          name: 'edge',
          type: "'top' | 'bottom'",
          options: ['top', 'bottom'],
          default: "'top'",
          description: 'The edge it sticks to. `bottom` works on web only.',
        },
        {
          name: 'offset',
          type: 'SpaceTokens | number',
          token: 'space',
          default: '0',
          description: 'Distance from that edge, such as the height of a header above it.',
          platforms: ['web'],
        },
        {
          name: 'zIndex',
          type: 'ZIndexTokens | number',
          token: 'zIndex',
          default: "'$sticky'",
          description: 'Stacking level: above content, below dropdowns and dialogs.',
        },
      ],
      children: { accepts: 'any' },
    },
  ],
  examples: [
    {
      name: 'page-header',
      title: 'Sticky header',
      description: 'A report header with an action stays at the top while the report scrolls.',
    },
    {
      name: 'list-headers',
      title: 'List section headers',
      description: 'Each region heading stays at the top until the next one pushes it away.',
    },
  ],
  accessibility: [
    'Sticky changes only where something is drawn: reading and focus order follow the source.',
    'Leave room for focused elements: `scroll-padding-top` on the scrolling container (web) stops a focused field from hiding under a top Sticky.',
  ],
  platformNotes: {
    web: '`position: sticky` with `top` (or `bottom`) set to `offset`. It sticks within its nearest scrolling ancestor (the page or a ScrollArea) and only while its parent is in view, so put it high in the tree, not in a short wrapper.',
    ios: 'React Native has no sticky positioning. A top Sticky that is a direct child of a ScrollArea’s content element (fragments count as opened) is pinned with `stickyHeaderIndices`: the ScrollArea makes that element’s children its own and moves the element’s style props (padding, gap…) to the scroll content; its other props, such as `testID`, are not kept. Anywhere else it is a plain View; `edge="bottom"` and `offset` are web only.',
    android:
      'As on iOS: pinned with `stickyHeaderIndices` when it is a direct child of a ScrollArea’s content element, a plain View elsewhere.',
  },
  related: ['scroll-area', 'section', 'navigation-bar'],
})
