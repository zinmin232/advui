import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'Transfer List',
  slug: 'transfer-list',
  category: 'advanced',
  description:
    'Two lists side by side: check items in one and move them to the other, such as the columns of a table or the members of a team.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['TransferList'],
  files: ['components/transfer-list/TransferList.tsx', 'components/transfer-list/index.ts'],
  keywords: ['transfer', 'dual list', 'shuttle', 'list builder', 'pick list', 'move items'],
  usage: `import { TransferList } from '@advui/core'

<TransferList
  items={columns}
  value={shown}
  onValueChange={setShown}
  labels={{ source: 'Hidden columns', target: 'Shown columns' }}
/>`,
  parts: [
    {
      name: 'TransferList',
      props: [
        {
          name: 'items',
          type: 'TransferListItem[]',
          required: true,
          description:
            '`{ value, label, description?, disabled? }`, in the order both lists show them. A disabled item stays in its list.',
        },
        {
          name: 'value',
          type: 'string[]',
          description: 'The values in the target list (right).',
        },
        {
          name: 'defaultValue',
          type: 'string[]',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string[]) => void',
          description: 'Called after a move, with the target list in the order of `items`.',
        },
        {
          name: 'listHeight',
          type: 'SizeTokens | number',
          default: "'56'",
          token: 'size',
          description: 'Height of each list (224px by default). Longer lists scroll.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Nothing can be checked or moved.',
        },
        {
          name: 'labels',
          type: 'Partial<TransferListLabels>',
          description:
            'The lists’ names (`source`, `target`: “Available”, “Selected”), `selectAll`, `empty`, `moveTo(list)` for the buttons and `moved(count, list)` for the announcement.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Table columns' },
    { name: 'members', title: 'Controlled, with a fixed item' },
  ],
  accessibility: [
    'Each list is a Checkbox Group named by its title, with a Select All checkbox at the top.',
    'The buttons between the lists are named for where they move the items (“Move to Selected”). With nothing checked they are `aria-disabled` rather than disabled, so a button keeps focus after it moves the items.',
    'After a move, “2 moved to Selected” is announced: through a polite live region on web, and `announceForAccessibility` on iOS and Android.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between the checkboxes and the buttons.' },
    { keys: 'Space', action: 'Checks or unchecks an item.' },
    { keys: 'Enter / Space', action: 'On a button, moves the checked items.' },
  ],
  platformNotes: {
    ios: 'VoiceOver does not read group names: each checkbox has its list’s name as its hint (Checkbox Group).',
    android:
      'TalkBack does not read group names: each checkbox has its list’s name as its hint (Checkbox Group).',
  },
  related: ['checkbox-group', 'multi-select', 'list'],
})
