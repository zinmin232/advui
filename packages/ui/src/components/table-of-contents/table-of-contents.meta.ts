import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'Table of Contents',
  slug: 'table-of-contents',
  category: 'navigation',
  description:
    'The sections of a page as links, with the current one marked. On web it follows the scroll by itself.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['TableOfContents'],
  files: [
    'components/table-of-contents/TableOfContents.tsx',
    'components/table-of-contents/index.ts',
  ],
  keywords: [
    'toc',
    'on this page',
    'contents',
    'outline',
    'scrollspy',
    'anchor links',
    'jump links',
  ],
  usage: `import { TableOfContents } from '@advui/core'

<TableOfContents
  title="On this page"
  items={[
    { id: 'install', label: 'Install', level: 2 },
    { id: 'provider', label: 'Set up the provider', level: 3 },
    { id: 'usage', label: 'Usage', level: 2 },
  ]}
/>`,
  parts: [
    {
      name: 'TableOfContents',
      props: [
        {
          name: 'items',
          type: 'TableOfContentsItem[]',
          required: true,
          description:
            '`{ id, label, level? }`: the id of the section’s heading, its text, and its heading level (2 for an h2). Deeper levels are indented.',
        },
        {
          name: 'activeId',
          type: 'string',
          description:
            'The current section. On web, leave it out to follow the scroll; the first item is current until then.',
        },
        {
          name: 'onActiveIdChange',
          type: '(id: string) => void',
          description: 'Called as the scroll reaches another section (web) or an item is pressed.',
        },
        {
          name: 'onItemPress',
          type: '(item: TableOfContentsItem) => void',
          description:
            'Called when an item is pressed. Web follows the link to `#id` too; on iOS and Android, scroll to the section here.',
        },
        { name: 'title', type: 'string', description: 'Visible heading above the links.' },
        {
          name: 'label',
          type: 'string',
          default: "'On this page'",
          description: 'Accessible name of the navigation. Give each one on a page its own.',
        },
        {
          name: 'headingOffset',
          type: 'number',
          default: '80',
          description:
            'Web: a heading counts as reached once its top is this many pixels below the top of the window, such as the height of a sticky header.',
        },
        {
          name: 'currentLabel',
          type: 'string',
          default: "'current'",
          description: 'Added to the current item’s name on iOS and Android.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'On web, a `nav` named by `label`, holding a list of links. The current one has `aria-current="location"`.',
    'Once the page is scrolled to the end, the last section is current, as a short last section never reaches the top.',
    'On iOS and Android, which read no `aria-current`, the current link’s name ends in “current”.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between the links.' },
    { keys: 'Enter', action: 'Goes to the section.' },
  ],
  platformNotes: {
    web: 'Watches the window’s scroll. Each item’s `id` must be the id of an element on the page, such as a Heading.',
    ios: 'There are no anchors: pass `activeId` and scroll to the section in `onItemPress`.',
    android: 'There are no anchors: pass `activeId` and scroll to the section in `onItemPress`.',
  },
  related: ['link', 'breadcrumb', 'sidebar', 'back-to-top'],
})
