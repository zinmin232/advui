import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'List Item',
  slug: 'list-item',
  category: 'data-display',
  description:
    'One row of content: a leading visual, a title and description, trailing meta and actions. Pressable, selectable or a link.',
  status: 'stable',
  since: '0.13.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'ListItem',
    'ListItemFrame',
    'ListItemTitle',
    'ListItemDescription',
    'ListItemProps',
    'ListItemSize',
    'ListItemVariant',
  ],
  files: ['components/list-item/ListItem.tsx', 'components/list-item/index.ts'],
  keywords: [
    'list item',
    'row',
    'settings row',
    'navigation item',
    'selectable',
    'contact',
    'profile',
    'cell',
  ],
  usage: `import { ListItem } from '@advui/core'
import { ChevronRightIcon, LockIcon } from '@advui/icons'

<ListItem
  leading={<LockIcon />}
  title="Privacy"
  description="Manage your privacy preferences"
  trailing={<ChevronRightIcon />}
  onPress={openPrivacy}
/>`,
  parts: [
    {
      name: 'ListItem',
      description:
        'The same component as `List.Item`. Inside a List it is a `listitem` and takes the List’s size and dividers; on its own it has no list role.',
      props: [
        {
          name: 'title',
          type: 'ReactNode',
          description: 'Main line. An element is rendered as it is.',
        },
        { name: 'description', type: 'ReactNode', description: 'Muted second line.' },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Custom content in place of `title` and `description`. Use `ListItemTitle` and `ListItemDescription` for the same text styles.',
        },
        {
          name: 'leading',
          type: 'ReactNode',
          description:
            'Before the text: an icon, Avatar, image, Checkbox or Radio. Icons are sized to the item (20px, 24px at `lg`) and muted. It never shrinks.',
        },
        {
          name: 'trailing',
          type: 'ReactNode',
          description:
            'After the text: meta text, a Badge, a status or a chevron. At most half the row wide, so long meta wraps. Part of the pressable area: when the item has `onPress`, `href` or `selectable`, put controls in `actions` instead. On a row without them it may hold a Switch.',
        },
        {
          name: 'actions',
          type: 'ReactNode',
          description:
            'Buttons or controls at the end, beside the pressable area rather than inside it, so they keep their own presses and keys. Give icon-only buttons an `aria-label`.',
        },
        {
          name: 'variant',
          type: "'plain' | 'filled' | 'outline'",
          options: ['plain', 'filled', 'outline'],
          default: "'plain'",
          description:
            '`filled` is a muted surface, `outline` a bordered card surface. Inside a List, leave it `plain` and set the List’s `variant`.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "the List's size, or 'md'",
          description:
            'Padding, text and icon size. Rows are at least 44px, 48px or 56px tall and grow with wrapped text.',
        },
        {
          name: 'divider',
          type: 'boolean',
          default: "from the List's `divided`",
          description:
            'A line above the item. `false` turns off a divided List’s line for this item.',
        },
        {
          name: 'onPress',
          type: '(event) => void',
          description:
            'Makes the content one button (`<button>` on web), named by its text. Enter and Space press it.',
        },
        {
          name: 'href',
          type: 'string',
          description:
            'Web: the content is a link (`<a>`). On iOS and Android navigate in `onPress` (e.g. `router.push`).',
        },
        {
          name: 'selected',
          type: 'boolean',
          description:
            'Highlights the item with a fill and an edge bar, on every variant. A pressable item is then the current one (`aria-current`, "page" for a link); with `selectable` it is the toggle state. Controlled by the parent.',
        },
        {
          name: 'selectable',
          type: 'boolean',
          default: 'false',
          description:
            'Pressing toggles `selected`: a toggle button (`aria-pressed` on web, "checked" on native).',
        },
        {
          name: 'defaultSelected',
          type: 'boolean',
          default: 'false',
          description: 'Selected at first, when a `selectable` item manages its own state.',
        },
        {
          name: 'onSelectedChange',
          type: '(selected: boolean) => void',
          description:
            'Called with the new state, once per press, when a `selectable` item is pressed. Never while rendering or when disabled.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description:
            'Blocks `onPress`, `href` and selection, dims the content and sets `aria-disabled`. `actions` and controls in `trailing` stay enabled: disable them yourself.',
        },
        {
          name: 'color',
          type: 'ColorTokens',
          token: 'color',
          default: 'from the theme',
          description:
            'Color of the title, description, trailing text and icons. Pair it with a `backgroundColor`: `primarySoftForeground` on `primarySoft`.',
        },
        {
          name: 'backgroundColor',
          type: 'ColorTokens',
          token: 'color',
          default: 'from `variant`',
          description: 'Overrides the variant surface. The selected fill still paints over it.',
        },
        {
          name: 'borderColor',
          type: 'ColorTokens',
          token: 'color',
          default: 'from `variant`',
          description: 'Overrides the outline or divider color.',
        },
        {
          name: 'borderRadius',
          type: 'RadiusTokens | number',
          token: 'radius',
          default: "'md' (plain), 'lg' (filled, outline), none in a List",
          description: 'Corner radius. Hover and selected fills follow it.',
        },
        {
          name: 'padding',
          type: 'SpaceTokens | number',
          token: 'space',
          default: 'from `size`',
          description:
            'Inner padding, applied inside the pressable area so it stays full size. `paddingHorizontal`, `paddingVertical` and the shorthands work too.',
        },
        {
          name: 'gap',
          type: 'SpaceTokens | number',
          token: 'space',
          default: "'3'",
          description: 'Space between the leading visual, the text and the trailing content.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description:
            'Replaces the name built from the text, e.g. "5 unread messages" for a row that shows "5".',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'ListItemTitle',
      description: 'The title text style, for custom `children`. Also `List.ItemTitle`.',
      props: [],
      children: { accepts: 'text' },
    },
    {
      name: 'ListItemDescription',
      description:
        'The muted description style, for custom `children`. Also `List.ItemDescription`.',
      props: [],
      children: { accepts: 'text' },
    },
  ],
  playground: {
    component: 'ListItem',
    controls: [
      { prop: 'title', type: 'text', default: 'Privacy' },
      { prop: 'description', type: 'text', default: 'Manage your privacy preferences' },
      {
        prop: 'variant',
        type: 'select',
        options: ['plain', 'filled', 'outline'],
        default: 'plain',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'leading', type: 'boolean', default: true },
      { prop: 'trailing', type: 'boolean', default: true },
      { prop: 'onPress', type: 'boolean', default: true },
      { prop: 'actions', type: 'boolean', default: false },
      { prop: 'selected', type: 'boolean', default: false },
      { prop: 'disabled', type: 'boolean', default: false },
      { prop: 'divider', type: 'boolean', default: false },
      { prop: 'backgroundColor', type: 'text', default: '' },
      { prop: 'color', type: 'text', default: '' },
      { prop: 'borderRadius', type: 'text', default: '' },
      { prop: 'padding', type: 'text', default: '' },
    ],
  },
  examples: [
    {
      name: 'settings',
      title: 'Settings list',
      description:
        'A switch in a row without `onPress`, pressable rows with a chevron or a value, and a disabled row.',
    },
    {
      name: 'navigation',
      title: 'Navigation list',
      description: 'The parent keeps the current page; `selected` marks it with `aria-current`.',
    },
    {
      name: 'profiles',
      title: 'Profiles with actions',
      description: 'Each row opens a profile; the email button beside it acts on its own.',
    },
    {
      name: 'selectable',
      title: 'Selectable items',
      description:
        'Toggle buttons for a multiple choice. The parent keeps the selected ids; for a single choice, keep one.',
    },
    {
      name: 'variants',
      title: 'Variants, sizes and colors',
      description:
        'Style props take precedence over the variant and size; the selected fill paints over them.',
    },
  ],
  accessibility: [
    'Without `onPress`, `href` or `selectable` the item is plain content: no button role, and its text is read in order.',
    'With them, the leading visual, text and trailing content are one button or link, named by that text (or `aria-label`). Controls go in `actions`, which sit beside it, so there are no nested interactive elements and an action never presses the row.',
    'Selected: a pressable item is the current one (`aria-current="true"`, or `"page"` for a link); a `selectable` item is a toggle button (`aria-pressed`). Native announces "selected" or "checked". The highlight is a fill and an edge bar, not color alone.',
    'Disabled: the button keeps focus, sets `aria-disabled` and ignores presses; a disabled link drops its `href`. A row without `onPress` has nothing to disable, so it is only dimmed.',
    'Inside a List the item is a `listitem`; on its own it has no list role, which would be invalid outside a list.',
    'Text wraps instead of truncating, and rows have a minimum height (44px or more) rather than a fixed one, so larger font sizes do not clip.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the item (when pressable) and then to each of its actions.' },
    { keys: 'Enter / Space', action: 'Presses the item, or toggles a `selectable` one.' },
  ],
  platformNotes: {
    web: 'A pressable item is a `<button>`, or an `<a>` with `href`. `actions` are siblings of it.',
    ios: 'A pressable item is one accessible button; VoiceOver reads all of its text. `href` is web-only: navigate in `onPress`.',
    android:
      'Same as iOS; a selectable item is a toggle button. Pressable items show the ripple when the config has `androidRipple`.',
  },
  related: ['list', 'sidebar', 'menu', 'avatar', 'badge', 'switch'],
})
