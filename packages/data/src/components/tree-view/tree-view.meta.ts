import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Tree View',
  slug: 'tree-view',
  category: 'advanced',
  description: 'A hierarchy of items that open and close, such as folders or place codes.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['TreeView', 'flattenTree', 'TreeViewProps', 'TreeNode'],
  files: ['components/tree-view/TreeView.tsx', 'components/tree-view/index.ts'],
  keywords: ['tree', 'hierarchy', 'folders', 'file explorer', 'nested', 'outline', 'expand'],
  usage: `import { TreeView } from '@advui/data'

<TreeView
  aria-label="Files"
  data={[{ id: 'reports', label: 'Reports', children: [{ id: 'q3', label: 'Q3 summary' }] }]}
  defaultExpanded={['reports']}
/>`,
  parts: [
    {
      name: 'TreeView',
      props: [
        {
          name: 'data',
          type: 'TreeNode[]',
          required: true,
          description: '`{ id, label, icon?, children?, disabled? }` nodes.',
        },
        { name: 'aria-label', type: 'string', description: 'Names the tree. Required.' },
        { name: 'expanded', type: 'string[]', description: 'Ids of open branches.' },
        {
          name: 'defaultExpanded',
          type: 'string[]',
          description: 'Starting `expanded` when uncontrolled.',
        },
        {
          name: 'onExpandedChange',
          type: '(expanded: string[]) => void',
          description: 'Called with the new `expanded`.',
        },
        { name: 'selected', type: 'string | null', description: 'Id of the selected item.' },
        {
          name: 'defaultSelected',
          type: 'string | null',
          description: 'Starting `selected` when uncontrolled.',
        },
        {
          name: 'onSelectedChange',
          type: '(selected: string | null) => void',
          description: 'Called with the new `selected`.',
        },
        {
          name: 'onNodePress',
          type: '(node: TreeNode) => void',
          description: 'An item was activated (press, Enter or Space).',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'flattenTree(nodes, expanded)',
      kind: 'function',
      description:
        'The visible nodes in order, with level and position. Useful for your own rendering.',
      props: [],
    },
  ],
  examples: [
    { name: 'basic', title: 'Files' },
    {
      name: 'controlled',
      title: 'Controlled',
      description: 'Expand or collapse everything from outside; one township is disabled.',
    },
  ],
  accessibility: [
    'Follows the WAI-ARIA tree pattern on web: `tree` and `treeitem` roles with `aria-level`, `aria-posinset`, `aria-setsize`, `aria-expanded` and `aria-selected`.',
    'The tree is one Tab stop (roving `tabIndex`); focus lands on the selected item.',
    'On iOS and Android, which have no tree roles, each item is a button that reports expanded and selected.',
    'Chevrons, icons and indents are hidden. Rows are 44pt tall on touch screens.',
  ],
  keyboard: [
    { keys: 'Arrow Down / Arrow Up', action: 'Next or previous visible item.' },
    { keys: 'Arrow Right', action: 'Opens a closed branch, or moves into an open one.' },
    { keys: 'Arrow Left', action: 'Closes an open branch, or moves to the parent.' },
    { keys: 'Home / End', action: 'First or last visible item.' },
    { keys: 'Enter / Space', action: 'Selects the item.' },
    { keys: 'A–Z', action: 'Moves to the next item starting with that letter.' },
  ],
  platformNotes: {
    web: 'Pressing a branch selects it and toggles it open.',
    ios: 'Tapping a branch selects it and toggles it open. VoiceOver reads "expanded" or "collapsed".',
    android: 'Same as iOS, with the ripple when the config has `androidRipple`.',
  },
  related: ['accordion', 'list', 'collapsible'],
})
