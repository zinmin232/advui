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
    },
    {
      name: 'ContextMenu.Trigger',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'The area that opens the menu: a card, a row, a canvas…',
        },
        { name: 'disabled', type: 'boolean', description: 'Ignore right-click and long-press.' },
        { name: '…ViewProps', type: 'StackProps', description: 'Size and style the area.' },
      ],
    },
    {
      name: 'ContextMenu.Content',
      props: [
        {
          name: 'minWidth',
          type: "'$40' | '$48' | '$56' | '$64'",
          default: "'$48'",
          description: 'Minimum menu width (web).',
        },
      ],
    },
    {
      name: 'ContextMenu.Item / CheckboxItem / RadioGroup / RadioItem / Label / Separator / Group',
      description: 'The same parts and props as Dropdown Menu.',
      props: [
        { name: 'onSelect', type: '() => void', description: 'Item: called when chosen.' },
        { name: 'icon', type: 'ReactNode', description: 'Leading icon.' },
        { name: 'shortcut', type: 'string', description: 'Keyboard hint on the right (web).' },
        { name: 'destructive', type: 'boolean', description: 'Style as a dangerous action.' },
        {
          name: 'checked / onCheckedChange',
          type: 'boolean / (checked: boolean) => void',
          description: 'CheckboxItem state.',
        },
        {
          name: 'value / onValueChange',
          type: 'string / (value: string) => void',
          description: 'RadioGroup selection; RadioItem `value`.',
        },
      ],
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
