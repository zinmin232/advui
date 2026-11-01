import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Kanban',
  slug: 'kanban',
  category: 'advanced',
  description:
    'Cards in columns that people move by dragging, with the keyboard, or with screen reader actions.',
  status: 'experimental',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Kanban',
    'KanbanCardFrame',
    'KanbanProps',
    'KanbanLabels',
    'KanbanColumn',
    'KanbanItem',
    'KanbanMove',
    'KanbanPlace',
    'moveItem',
    'findItem',
  ],
  files: [
    'components/kanban/Kanban.tsx',
    'components/kanban/moves.ts',
    'components/kanban/place.ts',
    'components/kanban/useDrag.tsx',
    'components/kanban/useDrag.native.tsx',
    'components/kanban/index.ts',
  ],
  keywords: [
    'kanban',
    'board',
    'drag and drop',
    'sortable',
    'columns',
    'cards',
    'tasks',
    'pipeline',
    'trello',
  ],
  usage: `import { Kanban } from '@advui/data'

<Kanban
  aria-label="Sprint board"
  defaultValue={[
    { id: 'todo', title: 'To do', items: [{ id: 'a', title: 'Write the report' }] },
    { id: 'done', title: 'Done', items: [] },
  ]}
  onItemMove={(move) => save(move)}
/>`,
  parts: [
    {
      name: 'Kanban',
      description: 'Takes size props such as `width`; the board scrolls sideways inside it.',
      props: [
        {
          name: 'value',
          type: 'KanbanColumn<T>[]',
          description: 'The columns and their cards: `{ id, title, items }`.',
        },
        {
          name: 'defaultValue',
          type: 'KanbanColumn<T>[]',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(columns: KanbanColumn<T>[]) => void',
          description: 'Called with the columns after a card moves.',
        },
        {
          name: 'onItemMove',
          type: '(move: KanbanMove) => void',
          description:
            '`{ itemId, from, to }` after a move, each `{ columnId, index }`: save it here.',
        },
        {
          name: 'onItemPress',
          type: '(item: T) => void',
          description: 'A card was pressed, or Enter pressed on it: open it here.',
        },
        {
          name: 'onItemDragStart',
          type: '(item: T) => void',
          description:
            'A card was picked up. On iOS and Android, stop a scroll view around the board that is not a ScrollArea or AppShell here (`scrollEnabled={false}`).',
        },
        {
          name: 'onItemDragEnd',
          type: '(item: T) => void',
          description: 'A picked-up card was dropped or put back.',
        },
        {
          name: 'renderItem',
          type: '(item: T) => ReactNode',
          description:
            'Draws a card’s content; the card around it moves. Default: the title and description. Keep buttons and links out of it.',
        },
        {
          name: 'columnWidth',
          type: 'SizeTokens | number',
          default: "'72'",
          token: 'size',
          description: 'Width of each column.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the board for screen readers. Recommended.',
        },
        {
          name: 'labels',
          type: 'Partial<KanbanLabels>',
          description:
            'The keyboard instructions, announcements (`pickedUp`, `moved`, `dropped`, `cancelled`) and action names, for other languages.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'KanbanItem',
      kind: 'type',
      description: 'A card. Extend it with your own fields and draw them with `renderItem`.',
      props: [
        { name: 'id', type: 'string', required: true, description: 'Unique key.' },
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Shown by default, and used in announcements.',
        },
        { name: 'description', type: 'string', description: 'Shown under the title by default.' },
        {
          name: 'disabled',
          type: 'boolean',
          description: 'Stays where it is: it cannot be picked up.',
        },
      ],
    },
    {
      name: 'moveItem(columns, itemId, columnId, index)',
      kind: 'function',
      description:
        'The columns with one card moved: apply a `KanbanMove` from a server, or move cards from your own controls.',
      props: [],
    },
    {
      name: 'findItem(columns, itemId)',
      kind: 'function',
      description: 'A card’s column and index, or null.',
      props: [],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Sprint board',
      description: 'Drag a card, or press Space on it and move it with the arrow keys.',
    },
    {
      name: 'custom-cards',
      title: 'Custom cards',
      description: '`renderItem` draws a priority and an owner; a closed request is `disabled`.',
    },
  ],
  accessibility: [
    'The board is a named `region` that scrolls sideways; each column is a `list` named with its title and count (a named `group` while empty), and each card a `listitem` holding a `button` (web). A default card is named by its title and described by its description; a `renderItem` card is named by its content.',
    'Keyboard: Space picks a card up, the arrow keys move it within and between columns, and Space or Enter drops it; Escape, or moving focus away, puts it back. Each card is described by these instructions.',
    'Each step is announced through an assertive live region: “Picked up Update the Kobo form. To do, position 3 of 3.”, then the new place, then where it was dropped.',
    'A moved card keeps focus, even when it mounts again in another column.',
    'On iOS and Android each card has screen reader actions, Move up, Move down and Move to the next column’s name, and the move is announced. Swipe up or down on a card to choose one.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between cards.' },
    { keys: 'Space', action: 'Picks a card up, or drops it.' },
    { keys: 'Arrow Up / Arrow Down', action: 'Moves the card within its column.' },
    { keys: 'Arrow Left / Arrow Right', action: 'Moves the card to the next column.' },
    {
      keys: 'Enter',
      action: 'Drops a picked-up card, or presses a card when `onItemPress` is set.',
    },
    { keys: 'Escape', action: 'Puts the card back where it was.' },
  ],
  platformNotes: {
    web: 'A mouse drags once it moves; a finger after holding still for a moment, so a swipe still scrolls the board. The board scrolls sideways near its edges while dragging.',
    ios: 'A long press picks a card up and the finger drags it. The board and the ScrollArea or AppShell around it stop scrolling until the finger lifts, so a quick first move drags the card. Stop any other scroll view around the board in `onItemDragStart`. Not yet checked on a device.',
    android:
      'Same as iOS. Checked on a phone before scroll views stopped during a drag: a quick first move scrolled the screen and cancelled the drag.',
  },
  related: ['list', 'card', 'data-table', 'event-calendar'],
})
