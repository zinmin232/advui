import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Breadcrumb',
  slug: 'breadcrumb',
  category: 'navigation',
  description:
    'Shows where the current page sits in the hierarchy, with links back up to each level.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Breadcrumb'],
  files: ['components/breadcrumb/Breadcrumb.tsx', 'components/breadcrumb/index.ts'],
  keywords: ['breadcrumbs', 'path', 'trail', 'hierarchy', 'navigation'],
  usage: `import { Breadcrumb } from '@advui/core'
import Link from 'next/link'

<Breadcrumb>
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item render={<Link href="/projects" />}>Projects</Breadcrumb.Item>
  <Breadcrumb.Item onPress={() => router.push('/projects/atlas')}>Atlas</Breadcrumb.Item>
  <Breadcrumb.Item>Settings</Breadcrumb.Item>
</Breadcrumb>`,
  parts: [
    {
      name: 'Breadcrumb',
      props: [
        {
          name: 'maxItems',
          type: 'number',
          description:
            'Show at most this many items: the first and the last ones stay, the rest collapse behind a “Show more” button.',
        },
        {
          name: 'separator',
          type: 'ReactNode',
          default: 'chevron',
          description: 'Drawn between items and hidden from screen readers.',
        },
        {
          name: 'aria-label',
          type: 'string',
          default: "'Breadcrumb'",
          description: 'Names the navigation landmark.',
        },
      ],
    },
    {
      name: 'Breadcrumb.Item',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: 'The page title.' },
        {
          name: 'href',
          type: 'string',
          description:
            'Link target on web. Ignored on iOS/Android, where apps navigate with `onPress`.',
        },
        {
          name: 'render',
          type: 'ReactElement',
          description: 'Your router’s link on web, e.g. `<Link href="/projects" />`.',
        },
        {
          name: 'onPress',
          type: '() => void',
          description: 'Navigate with your router, e.g. `router.push(…)` in Expo Router.',
        },
        {
          name: 'current',
          type: 'boolean',
          default: 'last item',
          description: 'Marks the current page; it is shown as plain text, not a link.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    {
      name: 'collapsed',
      title: 'Collapsed and custom separator',
      description: 'A deep path limited to three items, and slashes between items.',
    },
  ],
  accessibility: [
    'A `nav` landmark named “Breadcrumb” containing an ordered list, so screen readers announce the number of levels.',
    'The current page has `aria-current="page"` and is not a link. On iOS and Android its label ends with “current page”.',
    'Separators are decorative and hidden from assistive technology.',
    'The collapse button is labelled with how many levels it reveals, e.g. “Show 4 more”.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between the links and the “Show more” button.' },
    { keys: 'Enter', action: 'Follows the focused link.' },
  ],
  responsive:
    'Items wrap to a new line when space runs out; long titles are cut to one line. Use `maxItems` for deep paths on phones.',
  platformNotes: {
    web: 'Items with `href` render real `<a>` links; pass `render` for client-side routing.',
    ios: 'Items are links only when they have `onPress`.',
    android: 'Items are links only when they have `onPress`.',
  },
  related: ['tabs', 'dropdown-menu'],
})
