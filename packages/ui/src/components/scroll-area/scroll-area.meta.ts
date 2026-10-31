import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'Scroll Area',
  slug: 'scroll-area',
  category: 'layout',
  description:
    'A box that scrolls its content within a set height or width. On web its scrollbars are thin and in the theme colors.',
  status: 'stable',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ScrollArea'],
  files: [
    'components/scroll-area/ScrollArea.tsx',
    'components/scroll-area/ScrollArea.native.tsx',
    'components/scroll-area/index.ts',
  ],
  keywords: [
    'scroll',
    'overflow',
    'scrollbar',
    'list',
    'carousel',
    'scroll view',
    'keyboard avoiding',
    'keyboard aware',
  ],
  usage: `import { ScrollArea, VStack } from '@advui/core'

<ScrollArea aria-label="Release tags" height="72">
  <VStack padding="4" gap="2">…</VStack>
</ScrollArea>`,
  parts: [
    {
      name: 'ScrollArea',
      description: 'Takes size and border props such as `height`, `maxWidth` and `borderRadius`.',
      props: [
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          options: ['vertical', 'horizontal'],
          default: "'vertical'",
          description: 'Which way it scrolls.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the region for screen readers. Recommended.',
        },
        {
          name: 'avoidKeyboard',
          type: 'boolean',
          default: 'false',
          platforms: ['ios', 'android'],
          description:
            'Keep the focused field above the keyboard, for a ScrollArea that fills the screen (a form, a settings page). Taps on buttons then work while the keyboard is up. Inside a ScrollArea or AppShell that already does, it leaves that to the outer one.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description:
            'One child that holds the content, such as a VStack (an HStack when horizontal).',
        },
      ],
      children: { accepts: 'any', min: 1, max: 1 },
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
    ios: 'A ScrollView with the platform scroll indicator. Top Sticky children of the content element are pinned as sticky headers (since 0.10.0); the content element’s children then become the ScrollView’s own, and its style props style the scroll content. With `avoidKeyboard` (since 0.15.0) it insets its content by the keyboard and scrolls the focused field into view (`automaticallyAdjustKeyboardInsets`).',
    android:
      'Same as iOS, with nested scrolling on, so a ScrollArea inside a scrolling screen scrolls itself (since 0.10.0; before, the screen took every vertical drag). Edge-to-edge apps no longer shrink for the keyboard, so with `avoidKeyboard` it ends where the keyboard starts, measured on screen: unlike React Native’s KeyboardAvoidingView it needs no offset for a navigation header above. Android then scrolls the focused field into view.',
  },
  related: ['sheet', 'separator', 'sticky', 'back-to-top'],
})
