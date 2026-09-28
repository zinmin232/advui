import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'List',
  slug: 'list',
  category: 'data-display',
  description: 'A vertical list of rows with a leading visual, text and trailing meta.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'List',
    'ListFrame',
    'ListItemFrame',
    'ListItemTitle',
    'ListItemDescription',
    'ListProps',
    'ListItemProps',
  ],
  files: ['components/list/List.tsx', 'components/list/index.ts'],
  keywords: ['list', 'rows', 'items', 'menu list', 'settings', 'contacts', 'list item'],
  usage: `import { List } from '@advui/core'
import { ChevronRightIcon, UserIcon } from '@advui/icons'

<List variant="outline" divided>
  <List.Item
    leading={<UserIcon />}
    title="Account"
    description="Name, email and photo"
    trailing={<ChevronRightIcon />}
    onPress={openAccount}
  />
</List>`,
  parts: [
    {
      name: 'List',
      props: [
        {
          name: 'variant',
          type: "'plain' | 'outline'",
          default: "'plain'",
          description: '`outline` puts the rows on a bordered card surface.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'Row padding and text size.',
        },
        {
          name: 'divided',
          type: 'boolean',
          default: 'false',
          description: 'Draws a line between items.',
        },
      ],
    },
    {
      name: 'List.Item',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Main line.' },
        { name: 'description', type: 'ReactNode', description: 'Muted second line.' },
        {
          name: 'leading',
          type: 'ReactNode',
          description: 'Icon, Avatar or image before the text. Icons are 20px and muted.',
        },
        {
          name: 'trailing',
          type: 'ReactNode',
          description:
            'Meta text, a Badge, a chevron, or actions (only when the item has no `onPress`).',
        },
        {
          name: 'onPress',
          type: '(event) => void',
          description: 'Makes the whole row one button.',
        },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks `onPress`.' },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Custom content in place of `title` and `description`.',
        },
      ],
    },
    {
      name: 'List.ItemTitle / List.ItemDescription',
      description: 'The styled text, for custom `children`.',
      props: [],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    {
      name: 'interactive',
      title: 'Pressable rows',
      description: 'Each row is one button; the last one is disabled.',
    },
    {
      name: 'with-avatars',
      title: 'Avatars and actions',
      description: 'Rows without `onPress` can hold their own buttons.',
    },
  ],
  playground: {
    component: 'List',
    controls: [
      { prop: 'variant', type: 'select', options: ['plain', 'outline'], default: 'outline' },
      { prop: 'size', type: 'select', options: ['sm', 'md'], default: 'md' },
      { prop: 'divided', type: 'boolean', default: true },
    ],
  },
  accessibility: [
    'The list has the `list` role and each row `listitem`, so screen readers announce the count.',
    'A row with `onPress` holds one button (`<button>` on web) named by its title, description and trailing text. Do not put other buttons inside it.',
    'A disabled row keeps focus but sets `aria-disabled` and ignores presses.',
    'Rows are at least 44px (`sm`) or 48px (`md`) tall.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between pressable rows and the controls inside rows.' },
    { keys: 'Enter / Space', action: 'Presses the focused row.' },
  ],
  platformNotes: {
    web: 'A pressable row is a `<button>` inside the list item.',
    ios: 'A pressable row is one accessible button; VoiceOver reads all of its text.',
    android: 'Same as iOS. Pressable rows show the ripple when the config has `androidRipple`.',
  },
  related: ['card', 'avatar', 'badge', 'separator'],
})
