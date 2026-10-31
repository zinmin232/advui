import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'Back to Top',
  slug: 'back-to-top',
  category: 'buttons',
  description:
    'A floating button that appears once the page or a ScrollArea is scrolled down, and scrolls it back to the top.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['BackToTop', 'useBackToTop'],
  files: ['components/back-to-top/BackToTop.tsx', 'components/back-to-top/index.ts'],
  keywords: ['scroll to top', 'back to top', 'go to top', 'scroll up', 'floating button'],
  usage: `import { BackToTop, ScrollArea, useBackToTop } from '@advui/core'

// The page (web):
<BackToTop />

// A ScrollArea (web, iOS and Android):
const scroll = useBackToTop()
<Box position="relative" flex={1}>
  <ScrollArea {...scroll.scrollProps}>…</ScrollArea>
  <BackToTop scroll={scroll} />
</Box>`,
  parts: [
    {
      name: 'BackToTop',
      description:
        'A Floating Action Button: it also takes `variant`, `size` and `placement` (defaults `surface`, `sm` and `bottom-end`).',
      props: [
        {
          name: 'scroll',
          type: 'BackToTopScroll',
          description:
            'A ScrollArea to watch, from `useBackToTop`. Without it, the button watches the page on web and is not shown on iOS and Android.',
        },
        {
          name: 'threshold',
          type: 'number',
          default: '400',
          description: 'Pixels the page is scrolled before the button shows.',
        },
        {
          name: 'label',
          type: 'string',
          default: "'Back to top'",
          description: 'Accessible name.',
        },
        { name: 'icon', type: 'ReactNode', description: 'In place of the up chevron.' },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'useBackToTop(options)',
      kind: 'hook',
      description:
        '`useBackToTop({ threshold? })` returns `{ scrollProps, visible, scrollToTop }`. Spread `scrollProps` (a ref, `onScroll` and `scrollEventThrottle`) on a ScrollArea or a React Native ScrollView.',
      props: [
        {
          name: 'threshold',
          type: 'number',
          default: '400',
          description: 'Pixels scrolled before the button shows.',
        },
      ],
    },
  ],
  // No example watches the page: its button would float over the other
  // examples in the docs and in the visual tests.
  examples: [{ name: 'basic', title: 'In a ScrollArea' }],
  accessibility: [
    'A `button` named “Back to top” (`label`). It is not in the page until it is needed, so it adds no Tab stop at the top.',
    'On web, focus moves to the top with the scroll: to the ScrollArea, or to the page, so the next Tab goes to the first link and not on from the bottom.',
    'Scrolls smoothly, or at once when the user asks for reduced motion.',
  ],
  keyboard: [{ keys: 'Enter / Space', action: 'Scrolls to the top and moves focus there.' }],
  platformNotes: {
    web: 'Without `scroll`, it watches the window and stays in its corner (`position: fixed`).',
    ios: 'The screen does not scroll by itself: pass `scroll` from `useBackToTop`. Focus for VoiceOver is not moved after the scroll.',
    android:
      'The screen does not scroll by itself: pass `scroll` from `useBackToTop`. Focus for TalkBack is not moved after the scroll.',
  },
  related: ['fab', 'scroll-area', 'sticky'],
})
