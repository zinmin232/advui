import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Command Palette',
  slug: 'command-palette',
  category: 'advanced',
  description: 'A searchable list of actions in a dialog, opened with ⌘K or Ctrl+K.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'CommandPalette',
    'rankCommand',
    'Command',
    'CommandPaletteProps',
    'CommandPaletteLabels',
  ],
  files: ['components/command-palette/CommandPalette.tsx', 'components/command-palette/index.ts'],
  keywords: ['command palette', 'cmd k', 'spotlight', 'quick actions', 'launcher', 'jump to'],
  usage: `import { CommandPalette, type Command } from '@advui/core'

const commands: Command[] = [
  { id: 'reports', label: '5W reports', group: 'Go to', onSelect: () => router.push('/reports') },
  { id: 'export', label: 'Export to Excel', group: 'Actions', keywords: ['xlsx'], onSelect: exportXlsx },
]

<CommandPalette commands={commands} />`,
  parts: [
    {
      name: 'CommandPalette',
      props: [
        {
          name: 'commands',
          type: 'Command[]',
          required: true,
          description: '`{ id, label, onSelect, group?, icon?, shortcut?, keywords?, disabled? }`.',
        },
        {
          name: 'open',
          type: 'boolean',
          description: 'Open state, when you control it; the hotkey also opens it.',
        },
        {
          name: 'defaultOpen',
          type: 'boolean',
          default: 'false',
          description: 'Open at first, when the palette manages its state.',
        },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the palette opens or closes.',
        },
        {
          name: 'hotkey',
          type: 'string | null',
          platforms: ['web'],
          default: "'k'",
          description: 'Web: ⌘ or Ctrl plus this key toggles it. `null` turns it off.',
        },
        {
          name: 'labels',
          type: 'Partial<CommandPaletteLabels>',
          description: 'Title, placeholder and empty text, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'rankCommand(command, query)',
      kind: 'function',
      description:
        'The ranking it uses: 0 label starts with the text, 1 a word does, 2 contains (label, keywords, group), -1 no match.',
      props: [],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Basic',
      description: 'Groups, icons, shortcuts, keywords and a disabled command.',
    },
  ],
  accessibility: [
    'A modal dialog named "Command palette"; focus goes to the text box and returns to where it was on close.',
    'On web it is a WAI-ARIA combobox: focus stays in the text box while `aria-activedescendant` follows the arrow keys through a `listbox` of `option`s, grouped under named `group`s.',
    'On iOS and Android each command is a button in the list.',
    'Shortcut hints are shown but hidden from screen readers; the palette does not bind them.',
  ],
  keyboard: [
    { keys: '⌘K / Ctrl+K', action: 'Opens or closes the palette (web).' },
    {
      keys: 'Arrow Down / Arrow Up',
      action: 'Moves through the commands, skipping disabled ones.',
    },
    { keys: 'Enter', action: 'Runs the highlighted command and closes.' },
    { keys: 'Escape', action: 'Closes without running anything.' },
  ],
  platformNotes: {
    web: 'The hotkey listens on the whole page while the component is mounted.',
    ios: 'Open it from a button; there is no hotkey.',
    android: 'Same as iOS; the back button closes it.',
  },
  related: ['search', 'dialog', 'combobox', 'dropdown-menu'],
})
