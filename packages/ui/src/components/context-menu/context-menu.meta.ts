import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Context Menu',
  slug: 'context-menu',
  category: 'overlay',
  description:
    'Actions for an area, opened with a right-click on desktop and a long-press on touch screens.',
  status: 'beta',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ContextMenu'],
  files: [
    'components/context-menu/ContextMenu.tsx',
    'components/context-menu/ContextMenu.native.tsx',
    'components/context-menu/types.ts',
    'components/context-menu/index.ts',
  ],
  keywords: ['right click', 'long press', 'secondary menu', 'actions', 'popup menu'],
  usage: `import { ContextMenu } from '@advui/core'

<ContextMenu>
  <ContextMenu.Trigger>
    <FileRow file={file} />
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item onSelect={rename}>Rename</ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item destructive onSelect={remove}>Delete</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu>`,
  parts: [
    {
      name: 'ContextMenu',
      props: [
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the menu opens or closes.',
        },
      ],
      children: { accepts: ['ContextMenu.Trigger', 'ContextMenu.Content'], max: 2 },
    },
    {
      name: 'ContextMenu.Trigger',
      description: 'Takes View props to size and style the area.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'The area that opens the menu: a card, a row, a canvas…',
        },
        { name: 'disabled', type: 'boolean', description: 'Ignore right-click and long-press.' },
      ],
      children: { accepts: 'any' },
      within: 'ContextMenu',
    },
    {
      name: 'ContextMenu.Content',
      props: [
        {
          name: 'minWidth',
          type: "'$40' | '$48' | '$56' | '$64'",
          options: ['$40', '$48', '$56', '$64'],
          default: "'$48'",
          token: 'size',
          platforms: ['web'],
          description: 'Minimum menu width.',
        },
      ],
      children: {
        accepts: [
          'ContextMenu.Item',
          'ContextMenu.CheckboxItem',
          'ContextMenu.RadioGroup',
          'ContextMenu.Label',
          'ContextMenu.Separator',
          'ContextMenu.Group',
        ],
      },
      within: 'ContextMenu',
    },
    {
      name: 'ContextMenu.Item',
      description: 'The same parts and props as Dropdown Menu.',
      props: [
        {
          name: 'onSelect',
          type: '() => void',
          description: 'Called when chosen; the menu closes.',
        },
        { name: 'icon', type: 'ReactNode', description: 'Leading icon.' },
        {
          name: 'shortcut',
          type: 'string',
          platforms: ['web'],
          description: 'Keyboard hint on the right.',
        },
        { name: 'destructive', type: 'boolean', description: 'Style as a dangerous action.' },
        { name: 'disabled', type: 'boolean', description: 'Skip this item.' },
      ],
      children: { accepts: 'text' },
      within: 'ContextMenu.Content',
    },
    {
      name: 'ContextMenu.CheckboxItem',
      props: [
        { name: 'checked', type: 'boolean', description: 'Checked state.' },
        {
          name: 'onCheckedChange',
          type: '(checked: boolean) => void',
          description: 'Called with the new state.',
        },
      ],
      children: { accepts: 'text' },
      within: 'ContextMenu.Content',
    },
    {
      name: 'ContextMenu.RadioGroup',
      props: [
        { name: 'value', type: 'string', description: 'Selected item.' },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called with the chosen value.',
        },
      ],
      children: { accepts: ['ContextMenu.RadioItem'] },
      within: 'ContextMenu.Content',
    },
    {
      name: 'ContextMenu.RadioItem',
      props: [{ name: 'value', type: 'string', required: true, description: 'Item value.' }],
      children: { accepts: 'text' },
      within: 'ContextMenu.RadioGroup',
    },
    {
      name: 'ContextMenu.Label',
      description: 'A heading for the items after it.',
      props: [],
      children: { accepts: 'text' },
      within: 'ContextMenu.Content',
    },
    {
      name: 'ContextMenu.Separator',
      description: 'A line between groups of items.',
      props: [],
      children: { accepts: 'none' },
      within: 'ContextMenu.Content',
    },
    {
      name: 'ContextMenu.Group',
      description: 'Groups items under a Label for screen readers.',
      props: [],
      children: {
        accepts: [
          'ContextMenu.Item',
          'ContextMenu.CheckboxItem',
          'ContextMenu.RadioGroup',
          'ContextMenu.Label',
          'ContextMenu.Separator',
        ],
      },
      within: 'ContextMenu.Content',
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Browser-style menu',
      description: 'Shortcuts, a disabled item, a checkbox and radio items.',
    },
    {
      name: 'list',
      title: 'Rows in a list',
      description: 'Each row has its own menu.',
    },
  ],
  accessibility: [
    'Context menus are hidden until someone thinks to look for them: offer the same actions somewhere visible too (a Dropdown Menu on the row, a toolbar).',
    'Once open, the menu follows the WAI-ARIA menu pattern, like Dropdown Menu: `menuitem`, `menuitemcheckbox` and `menuitemradio` with `aria-checked`; focus moves into the menu and back afterwards.',
    'Keyboard users open it with Shift+F10 or the Menu key while focus is inside the area.',
    'On iOS and Android the area is one accessible element with a "long press" action (listed by VoiceOver and TalkBack) and the hint "Long press for options".',
  ],
  keyboard: [
    { keys: 'Shift+F10 / Menu', action: 'Opens the menu from focus inside the area.' },
    { keys: '↓ / ↑', action: 'Moves between items (disabled items are skipped).' },
    { keys: 'Enter / Space', action: 'Chooses the focused item.' },
    { keys: 'A–Z', action: 'Type-ahead to an item.' },
    { keys: 'Esc', action: 'Closes the menu.' },
  ],
  responsive: 'The menu opens at the pointer and flips to stay inside the viewport.',
  platformNotes: {
    web: 'Opens at the pointer on right-click, and after a long-press on touch screens.',
    ios: 'A long-press opens Dropdown Menu’s bottom sheet (native menus need a native module that Expo Go does not include). Shortcut hints are hidden.',
    android: 'Same as iOS; the back gesture closes the sheet.',
  },
  related: ['dropdown-menu', 'popover', 'menu'],
})
