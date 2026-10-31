import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'Portal',
  slug: 'portal',
  category: 'foundations',
  description:
    'Renders its children above the app, out of the layout they are written in: for your own floating bars, panels and overlays.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Portal'],
  files: ['components/portal/Portal.tsx', 'components/portal/index.ts'],
  keywords: ['portal', 'teleport', 'layer', 'overlay', 'z-index', 'floating'],
  usage: `import { Portal } from '@advui/core'

<Portal zIndex="overlay">
  <Card position="absolute" bottom="4" left="4" right="4">…</Card>
</Portal>`,
  parts: [
    {
      name: 'Portal',
      description:
        'Tamagui’s Portal, with a layer that lets touches outside the children reach the app. Place the children with `position="absolute"`.',
      props: [
        {
          name: 'zIndex',
          type: 'PortalLayer | number',
          default: "'overlay'",
          description:
            'A layer of the theme’s `zIndex` scale (`dropdown`, `sticky`, `overlay`, `modal`, `popover`, `toast`, `tooltip`) or a number. Android takes 32-bit z-indices only.',
        },
      ],
      children: { accepts: 'any' },
    },
  ],
  examples: [{ name: 'basic', title: 'A bar over the page' }],
  accessibility: [
    'Content moves to the end of the page on web and beside the app on iOS and Android, so screen readers and the Tab key reach it last. Keep it for content that floats above the page.',
    'A Portal is not a dialog: it does not trap focus or hide the page behind it. For modal content use Dialog, Drawer or Sheet, which do.',
  ],
  platformNotes: {
    web: 'Renders after hydration, at the end of `body`, so it is not in the server-rendered HTML.',
    ios: 'Renders beside the app. React context from above the Portal does not reach its children (the theme does): pass values as props.',
    android:
      'Renders beside the app. React context from above the Portal does not reach its children (the theme does): pass values as props.',
  },
  related: ['dialog', 'sheet', 'popover', 'snackbar'],
})
