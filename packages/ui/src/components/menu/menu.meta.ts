import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Menu',
  slug: 'menu',
  category: 'navigation',
  description:
    'An always-visible list of actions or destinations, with icons, groups and a selected item.',
  status: 'beta',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Menu'],
  files: ['components/menu/Menu.tsx', 'components/menu/index.ts'],
  keywords: ['menu list', 'nav list', 'sidebar', 'side nav', 'action list', 'settings'],
  usage: `import { Menu } from '@advui/core'

<Menu aria-label="Mailboxes" value={page} onValueChange={setPage}>
  <Menu.Group label="Mail">
    <Menu.Item value="inbox" icon={<MailIcon />} trailing={12}>Inbox</Menu.Item>
    <Menu.Item value="sent" icon={<UploadIcon />}>Sent</Menu.Item>
  </Menu.Group>
  <Menu.Separator />
  <Menu.Item destructive onSelect={emptyTrash}>Empty trash</Menu.Item>
</Menu>`,
  parts: [
    {
      name: 'Menu',
      props: [
        {
          name: 'value / defaultValue',
          type: 'string',
          description: 'The selected item’s `value` (the current page or view).',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called when an item with a `value` is chosen.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the menu for screen readers, e.g. "Mailboxes".',
        },
        { name: '…ViewProps', type: 'StackProps', description: 'Size and style the list.' },
      ],
    },
    {
      name: 'Menu.Item',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'Label; truncated to one line.',
        },
        {
          name: 'value',
          type: 'string',
          description: 'Selects this item when chosen. Leave it out for plain actions.',
        },
        { name: 'onSelect', type: '() => void', description: 'Called when the item is chosen.' },
        { name: 'icon', type: 'ReactNode', description: 'Leading icon, sized and tinted for you.' },
        {
          name: 'trailing',
          type: 'ReactNode',
          description: 'A count, Badge or hint on the right. Strings and numbers are muted text.',
        },
        {
          name: 'selected',
          type: 'boolean',
          description: 'Force the selected look. Default: the menu’s `value` equals `value`.',
        },
        { name: 'destructive', type: 'boolean', description: 'Style as a dangerous action.' },
        { name: 'disabled', type: 'boolean', description: 'Skip this item.' },
        {
          name: 'href',
          type: 'string',
          description: 'Web: render a link. On iOS/Android navigate in `onSelect`.',
        },
        {
          name: 'render',
          type: 'ReactElement | string',
          description: 'Web: your router’s link, e.g. `render={<Link href="/inbox" />}`.',
        },
      ],
    },
    {
      name: 'Menu.Group',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Visible heading that also names the group for screen readers.',
        },
      ],
    },
    { name: 'Menu.Separator', props: [] },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Mailbox navigation',
      description: 'A group with icons, counts and a selected item.',
    },
    {
      name: 'actions',
      title: 'Actions in a card',
      description: 'Plain actions with a badge, a disabled and a destructive item.',
    },
  ],
  accessibility: [
    'The list is a `menu` of `menuitem`s; name it with `aria-label`. Groups are `group`s named by their label.',
    'The selected item has `aria-current` (`page` for links), disabled items `aria-disabled`.',
    'On web the menu is one Tab stop: focus lands on the selected item, and arrow keys move between items, skipping disabled ones.',
    'Items are buttons, or links when they have `href` or `render`, so Enter and Space work as expected.',
    'On iOS and Android each item is one accessible element with a touch target of at least 48pt.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves focus into the menu (to the selected item) and out again.' },
    { keys: '↓ / ↑', action: 'Next / previous item; wraps around.' },
    { keys: 'Home / End', action: 'First / last item.' },
    { keys: 'Enter / Space', action: 'Chooses the focused item.' },
  ],
  responsive:
    'Fills its container’s width. Rows grow to finger size on touch screens; long labels are truncated.',
  platformNotes: {
    web: 'Items render as buttons, or as links with `href` / `render`.',
    ios: 'Rows are 48pt tall. Navigate with your router in `onSelect`, since `href` is web-only.',
    android:
      'Same as iOS. With `androidRipple` (on in `material()`), presses show the native ripple.',
  },
  related: ['dropdown-menu', 'navigation-bar', 'drawer'],
})
