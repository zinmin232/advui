import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Table',
  slug: 'table',
  category: 'data-display',
  description: 'Rows and columns of data, with sortable headers, stripes and sideways scrolling.',
  status: 'stable',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Table',
    'TableFrame',
    'TableRowFrame',
    'TableHeadFrame',
    'TableCellFrame',
    'TableProps',
    'TableRowProps',
    'TableHeadProps',
    'TableCellProps',
    'TableSortDirection',
  ],
  files: ['components/table/Table.tsx', 'components/table/index.ts'],
  keywords: ['table', 'grid', 'rows', 'columns', 'data', 'spreadsheet', 'sort', 'tabular'],
  usage: `import { Table } from '@advui/data'

<Table caption="Recent invoices">
  <Table.Header>
    <Table.Row>
      <Table.Head>Invoice</Table.Head>
      <Table.Head align="end">Amount</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>INV-001</Table.Cell>
      <Table.Cell align="end">$250.00</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>`,
  parts: [
    {
      name: 'Table',
      props: [
        {
          name: 'caption',
          type: 'ReactNode',
          description: 'Names the table (`aria-labelledby`); shown under it. Or pass `aria-label`.',
        },
        {
          name: 'variant',
          type: "'plain' | 'outline'",
          options: ['plain', 'outline'],
          default: "'plain'",
          description: '`outline` puts the table on a bordered card surface.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          options: ['sm', 'md'],
          default: "'md'",
          description: 'Cell padding: compact or comfortable.',
        },
        {
          name: 'striped',
          type: 'boolean',
          default: 'false',
          description: 'Shades every other body row.',
        },
        {
          name: 'minWidth',
          type: 'number',
          min: 0,
          description: 'Below this width the table scrolls sideways instead of squeezing columns.',
        },
      ],
      children: { accepts: ['Table.Header', 'Table.Body', 'Table.Footer'] },
    },
    {
      name: 'Table.Header',
      description: 'The row group of column headers.',
      props: [],
      children: { accepts: ['Table.Row'] },
      within: 'Table',
    },
    {
      name: 'Table.Body',
      description: 'The row group of data rows, divided (and striped with `striped`).',
      props: [],
      children: { accepts: ['Table.Row'] },
      within: 'Table',
    },
    {
      name: 'Table.Footer',
      description: 'A shaded row group, for totals.',
      props: [],
      children: { accepts: ['Table.Row'] },
      within: 'Table',
    },
    {
      name: 'Table.Row',
      props: [
        {
          name: 'selected',
          type: 'boolean',
          default: 'false',
          description: 'Highlights the row.',
        },
      ],
      children: { accepts: ['Table.Head', 'Table.Cell'] },
      parents: ['Table.Header', 'Table.Body', 'Table.Footer'],
    },
    {
      name: 'Table.Head',
      props: [
        {
          name: 'align',
          type: "'start' | 'center' | 'end'",
          options: ['start', 'center', 'end'],
          default: "'start'",
          description: 'Match the column’s cells.',
        },
        {
          name: 'sortDirection',
          type: "'ascending' | 'descending' | 'none'",
          options: ['ascending', 'descending', 'none'],
          description: 'Makes the header a sort button and sets `aria-sort`.',
        },
        { name: 'onSort', type: '() => void', description: 'Called when the header is pressed.' },
      ],
      children: { accepts: 'text' },
      parents: ['Table.Row'],
    },
    {
      name: 'Table.Cell',
      description:
        'Plain text is wrapped in body text. Set `width` or `flex` on the cells and header of a column to size it.',
      props: [
        {
          name: 'align',
          type: "'start' | 'center' | 'end'",
          options: ['start', 'center', 'end'],
          default: "'start'",
          description: 'Use `end` for numbers.',
        },
      ],
      children: { accepts: 'any' },
      parents: ['Table.Row'],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic', description: 'A wider partner column and a totals footer.' },
    {
      name: 'sortable',
      title: 'Sortable columns',
      description: 'Your code sorts the rows; the header shows and announces the direction.',
    },
    { name: 'scroll', title: 'Striped, scrolling sideways' },
  ],
  playground: {
    component: 'Table',
    staticProps: { 'aria-label': 'Empty table' },
    controls: [
      { prop: 'variant', type: 'select', options: ['plain', 'outline'], default: 'outline' },
      { prop: 'size', type: 'select', options: ['sm', 'md'], default: 'md' },
      { prop: 'striped', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'Uses the ARIA table roles (`table`, `rowgroup`, `row`, `columnheader`, `cell`), so screen readers can move by row and column and read each cell with its header.',
    'Name every table with `caption` or `aria-label`.',
    'A sortable header holds a button and sets `aria-sort`; the icon is hidden. On native, where there is no `aria-sort`, the button’s name says how the column is sorted.',
    'With `minWidth`, the scrolling area can take focus on web, so the arrow keys scroll it.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the sort buttons and any controls in cells.' },
    { keys: 'Enter / Space', action: 'Sorts by the focused header.' },
    { keys: 'Arrow keys', action: 'Scroll a focused table that is wider than the screen.' },
  ],
  responsive:
    'Columns share the width equally unless cells set `width` or `flex`. Set `minWidth` so a wide table scrolls sideways on phones.',
  platformNotes: {
    web: 'Built from flex rows with ARIA table roles rather than `<table>`, so the layout is the same on every platform.',
    ios: 'VoiceOver reads cells in row order.',
    android: 'Same as iOS.',
  },
  related: ['pagination', 'list', 'card'],
})
