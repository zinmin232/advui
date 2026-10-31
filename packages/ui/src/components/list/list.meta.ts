import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'List',
  slug: 'list',
  category: 'data-display',
  description: 'A vertical list of rows with a leading visual, text and trailing meta.',
  status: 'stable',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['List', 'ListFrame', 'ListProps'],
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
          options: ['plain', 'outline'],
          default: "'plain'",
          description: '`outline` puts the rows on a bordered card surface.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Row padding and text size. An item can set its own.',
        },
        {
          name: 'divided',
          type: 'boolean',
          default: 'false',
          description: 'Draws a line between items.',
        },
      ],
      children: { accepts: ['List.Item'] },
    },
    {
      name: 'List.Item',
      description:
        'The same component as `ListItem`; see List Item for every prop: `actions`, `selected`, `selectable`, `href`, `variant`, `size` and style props.',
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
            'Meta text, a Badge or a chevron. Controls go in `actions` when the item has `onPress`.',
        },
        {
          name: 'actions',
          type: 'ReactNode',
          description: 'Buttons beside the pressable row, which keep their own presses.',
        },
        {
          name: 'selected',
          type: 'boolean',
          description: 'Highlights the item; a pressable one is the current one (`aria-current`).',
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
      children: { accepts: 'any' },
      parents: ['List'],
    },
    {
      name: 'List.ItemTitle',
      description: 'The styled main line, for custom `children`.',
      props: [],
      children: { accepts: 'text' },
      within: 'List',
    },
    {
      name: 'List.ItemDescription',
      description: 'The styled muted line, for custom `children`.',
      props: [],
      children: { accepts: 'text' },
      within: 'List',
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
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'divided', type: 'boolean', default: true },
    ],
  },
  accessibility: [
    'The list has the `list` role and each row `listitem`, so screen readers announce the count.',
    'A row with `onPress` holds one button (`<button>` on web) named by its title, description and trailing text. Put other buttons in `actions`, which sit beside it.',
    'A disabled row keeps focus but sets `aria-disabled` and ignores presses.',
    'Rows are at least 44px (`sm`), 48px (`md`) or 56px (`lg`) tall.',
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
  related: ['list-item', 'card', 'avatar', 'badge', 'separator'],
})
