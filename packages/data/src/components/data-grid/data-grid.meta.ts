import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Data Grid',
  slug: 'data-grid',
  category: 'advanced',
  description:
    'A spreadsheet-like grid: move between cells with the arrow keys and edit values in place, with validation.',
  status: 'stable',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'DataGrid',
    'DataGridProps',
    'DataGridColumn',
    'DataGridCellChange',
    'DataGridLabels',
    'DataGridValue',
  ],
  files: ['components/data-grid/DataGrid.tsx', 'components/data-grid/index.ts'],
  keywords: ['data grid', 'spreadsheet', 'editable table', 'inline edit', 'cells', 'grid'],
  usage: `import { DataGrid, type DataGridColumn } from '@advui/data'

const columns: DataGridColumn<Row>[] = [
  { id: 'township', header: 'Township' },
  { id: 'reached', header: 'Reached', type: 'number', editable: true },
]

<DataGrid aria-label="Reach by township" data={rows} onDataChange={setRows} columns={columns} />`,
  parts: [
    {
      name: 'DataGrid',
      props: [
        {
          name: 'aria-label',
          type: 'string',
          required: true,
          description: 'Names the grid.',
        },
        {
          name: 'columns',
          type: 'DataGridColumn<T>[]',
          required: true,
          description: 'Column definitions (below).',
        },
        {
          name: 'data',
          type: 'T[]',
          description: 'The rows. Accepted edits come back as a new array.',
        },
        { name: 'defaultData', type: 'T[]', description: 'Starting `data` when uncontrolled.' },
        {
          name: 'onDataChange',
          type: '(data: T[]) => void',
          description: 'Called with the new `data`.',
        },
        {
          name: 'onCellChange',
          type: '(change: DataGridCellChange<T>) => void',
          description:
            'One accepted edit: `row`, `rowId`, `rowIndex`, `columnId`, `value`, `previousValue`. Save it here.',
        },
        {
          name: 'getRowId',
          type: '(row, index) => string',
          default: '`row.id`, then the index',
          description: 'Stable id for React keys and `onCellChange`.',
        },
        {
          name: 'getRowLabel',
          type: '(row) => string',
          default: 'the first column',
          description: 'Names the row in cell names and errors ("Reached, Hakha").',
        },
        { name: 'readOnly', type: 'boolean', default: 'false', description: 'No editing.' },
        {
          name: 'size',
          type: "'sm' | 'md'",
          options: ['sm', 'md'],
          default: "'md'",
          description: 'Row height.',
        },
        {
          name: 'labels',
          type: 'Partial<DataGridLabels>',
          description: 'Edit hint and error text, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'DataGridColumn<T>',
      kind: 'type',
      props: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: 'Key; the row field by default.',
        },
        { name: 'header', type: 'string', required: true, description: 'Header text.' },
        {
          name: 'editable',
          type: 'boolean',
          default: 'false',
          description: 'Cells can be edited.',
        },
        {
          name: 'type',
          type: "'text' | 'number'",
          options: ['text', 'number'],
          default: "'text'",
          description: '`number` right-aligns, shows the number keyboard and parses the input.',
        },
        {
          name: 'validate',
          type: '(value, row) => string | null',
          description: 'Return a message to reject an edit. The cell stays open with the error.',
        },
        {
          name: 'accessor',
          type: '(row: T) => string | number | null | undefined',
          description: 'Reads a value that is not a plain field. Default: `row[id]`.',
        },
        {
          name: 'setValue',
          type: '(row: T, value: string | number | null) => T',
          description: 'Writes an edited value that is not a plain field; returns the new row.',
        },
        {
          name: 'format',
          type: '(value, row) => string',
          description: 'Display text, e.g. thousands separators.',
        },
        { name: 'cell', type: '(row) => ReactNode', description: 'Custom display content.' },
        {
          name: 'width',
          type: 'number',
          default: '160',
          description: 'Pixels. The grid scrolls sideways when wider than its container.',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end'",
          options: ['start', 'center', 'end'],
          description: 'Alignment.',
        },
      ],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Editable, with validation',
      description: 'Target and Reached are numbers that must be positive; Progress is computed.',
    },
    { name: 'read-only', title: 'Read-only, with custom cells' },
  ],
  accessibility: [
    'Web follows the WAI-ARIA grid pattern: a named `grid` with `row`, `columnheader` and `gridcell` roles, row and column indexes, and one tab stop (the active cell).',
    'The editor is a text field named by its column and row ("Reached, Hakha").',
    'A rejected edit keeps the field open, marks it `aria-invalid`, and says why in a polite live region under the grid.',
    'On iOS and Android each cell reads its column, row and value; editable cells are buttons with a "Double-tap to edit" hint.',
  ],
  keyboard: [
    { keys: 'Arrow keys', action: 'Move between cells.' },
    { keys: 'Home / End', action: 'First or last cell in the row (with Ctrl or ⌘: in the grid).' },
    { keys: 'Page Up / Page Down', action: 'Move five rows.' },
    { keys: 'Enter / F2', action: 'Edit the cell. Typing a character starts editing with it.' },
    { keys: 'Delete / Backspace', action: 'Edit the cell, starting empty.' },
    { keys: 'Enter / Tab (editing)', action: 'Save and move down or right (Shift: up or left).' },
    { keys: 'Escape (editing)', action: 'Cancel the edit.' },
    { keys: 'Tab', action: 'Leave the grid.' },
  ],
  responsive: 'Columns have fixed widths; the grid scrolls sideways on narrow screens.',
  platformNotes: {
    web: 'Double-click a cell to edit it. Clicking elsewhere saves the edit, or drops it when it is invalid.',
    ios: 'Tap an editable cell to edit; the keyboard’s Done key saves.',
    android: 'Same as iOS.',
  },
  related: ['data-table', 'table', 'input'],
})
