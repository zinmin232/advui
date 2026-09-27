import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Dropdown Menu',
  slug: 'dropdown-menu',
  category: 'navigation',
  description: 'A list of actions or options that opens from a button.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['DropdownMenu'],
  files: [
    'components/dropdown-menu/DropdownMenu.tsx',
    'components/dropdown-menu/DropdownMenu.native.tsx',
    'components/dropdown-menu/types.ts',
    'components/dropdown-menu/index.ts',
  ],
  keywords: ['menu', 'actions', 'more', 'overflow', 'kebab', 'context', 'options'],
  usage: `import { Button, DropdownMenu } from '@advui/core'

<DropdownMenu>
  <DropdownMenu.Trigger>
    <Button variant="outline">Options</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={edit}>Edit</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item destructive onSelect={remove}>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>`,
  parts: [
    {
      name: 'DropdownMenu',
      props: [
        { name: 'open / defaultOpen', type: 'boolean', description: 'Open state.' },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the menu opens or closes.',
        },
        {
          name: 'side',
          type: "'top' | 'right' | 'bottom' | 'left'",
          default: "'bottom'",
          description: 'Where to open relative to the trigger (web).',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end'",
          default: "'start'",
          description: 'Alignment along that side (web).',
        },
      ],
    },
    {
      name: 'DropdownMenu.Trigger',
      props: [
        {
          name: 'children',
          type: 'ReactElement',
          required: true,
          description: 'One element, usually a Button or IconButton.',
        },
      ],
    },
    {
      name: 'DropdownMenu.Content',
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
      name: 'DropdownMenu.Item',
      props: [
        {
          name: 'onSelect',
          type: '() => void',
          description: 'Called when chosen; the menu closes.',
        },
        { name: 'icon', type: 'ReactNode', description: 'Leading icon.' },
        { name: 'shortcut', type: 'string', description: 'Keyboard hint on the right (web).' },
        { name: 'destructive', type: 'boolean', description: 'Style as a dangerous action.' },
        { name: 'disabled', type: 'boolean', description: 'Skip this item.' },
        {
          name: 'textValue',
          type: 'string',
          description: 'Type-ahead text when children is not a string.',
        },
      ],
    },
    {
      name: 'DropdownMenu.CheckboxItem',
      props: [
        { name: 'checked', type: 'boolean', description: 'Checked state.' },
        {
          name: 'onCheckedChange',
          type: '(checked: boolean) => void',
          description: 'Called with the new state.',
        },
      ],
    },
    {
      name: 'DropdownMenu.RadioGroup',
      props: [
        { name: 'value', type: 'string', description: 'Selected item.' },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called with the chosen value.',
        },
      ],
    },
    {
      name: 'DropdownMenu.RadioItem',
      props: [{ name: 'value', type: 'string', required: true, description: 'Item value.' }],
    },
    {
      name: 'DropdownMenu.Label / Separator / Group',
      props: [
        { name: 'children', type: 'ReactNode', description: 'Section heading and grouping.' },
      ],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Account menu',
      description: 'Icons, shortcuts, a disabled and a destructive item.',
    },
    {
      name: 'options',
      title: 'Checkbox and radio items',
      description: 'View settings from an icon button.',
    },
  ],
  accessibility: [
    'Web follows the WAI-ARIA menu button pattern: the trigger has `aria-haspopup="menu"` and `aria-expanded`; items are `menuitem`, `menuitemcheckbox` or `menuitemradio` with `aria-checked`.',
    'Focus moves into the menu when it opens and back to the trigger after a choice or Escape.',
    'Type a letter to jump to the next item that starts with it.',
    'On iOS and Android each row is a single accessible element (menu item, checkbox or radio with its checked state), at least 48pt tall.',
  ],
  keyboard: [
    {
      keys: 'Enter / Space / ↓',
      action: 'Opens the menu from the trigger and focuses the first item.',
    },
    { keys: '↓ / ↑', action: 'Moves between items (disabled items are skipped).' },
    { keys: 'Home / End', action: 'First / last item.' },
    { keys: 'Enter / Space', action: 'Chooses the focused item.' },
    { keys: 'A–Z', action: 'Type-ahead to an item.' },
    { keys: 'Esc', action: 'Closes the menu.' },
  ],
  responsive: 'The menu flips to stay inside the viewport on small screens.',
  platformNotes: {
    web: 'Floating menu next to the trigger with full keyboard support.',
    ios: 'Opens as a bottom sheet of large rows (native menus need a native module that Expo Go does not include). Shortcut hints are hidden.',
    android: 'Same as iOS; the back gesture closes the sheet.',
  },
  related: ['popover', 'select', 'context-menu'],
})
