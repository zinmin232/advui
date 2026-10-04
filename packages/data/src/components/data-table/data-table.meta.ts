import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Data Table',
  slug: 'data-table',
  category: 'data-display',
  description:
    'A table driven by data and columns, with sorting, search, row selection and pagination.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'DataTable',
    'DataTableProps',
    'DataTableColumn',
    'DataTableSort',
    'DataTableLabels',
    'DataTableValue',
  ],
  files: ['components/data-table/DataTable.tsx', 'components/data-table/index.ts'],
  keywords: ['data table', 'data grid', 'sort', 'filter', 'search', 'select rows', 'paginate'],
  usage: `import { DataTable, type DataTableColumn } from '@advui/data'

const columns: DataTableColumn<Project>[] = [
  { id: 'organization', header: 'Organization', sortable: true },
  { id: 'beneficiaries', header: 'Reached', sortable: true, align: 'end' },
]

<DataTable aria-label="Projects" data={projects} columns={columns} pageSize={10} searchable selectable />`,
  parts: [
    {
      name: 'DataTable',
      description: 'Also takes the Table props: `variant`, `size`, `striped`, `minWidth`.',
      props: [
        { name: 'data', type: 'T[]', required: true, description: 'The rows.' },
        {
          name: 'columns',
          type: 'DataTableColumn<T>[]',
          required: true,
          description: 'Column definitions (below).',
        },
        {
          name: 'getRowId',
          type: '(row, index) => string',
          default: '`row.id`, then the index',
          description: 'Stable id for selection and React keys.',
        },
        {
          name: 'getRowLabel',
          type: '(row) => string',
          description: 'Names a row’s checkbox ("Select INV-001"). Default: its id.',
        },
        {
          name: 'sort',
          type: "{ column: string; direction: 'ascending' | 'descending' } | null",
          description: 'Sorted column. Pressing a header cycles ascending, descending, none.',
        },
        {
          name: 'defaultSort',
          type: "{ column: string; direction: 'ascending' | 'descending' } | null",
          description: 'Starting `sort` when uncontrolled.',
        },
        {
          name: 'onSortChange',
          type: "(sort: { column: string; direction: 'ascending' | 'descending' } | null) => void",
          description: 'Called with the new `sort`.',
        },
        {
          name: 'pageSize',
          type: 'number',
          description: 'Rows per page. Without it every row is shown.',
        },
        {
          name: 'page',
          type: 'number',
          description: 'Current page, from 1. Sorting and searching go back to page 1.',
        },
        { name: 'defaultPage', type: 'number', description: 'Starting `page` when uncontrolled.' },
        {
          name: 'onPageChange',
          type: '(page: number) => void',
          description: 'Called with the new `page`.',
        },
        {
          name: 'selectable',
          type: 'boolean',
          default: 'false',
          description: 'Adds a checkbox column and a "select all on this page" box.',
        },
        { name: 'selectedIds', type: 'string[]', description: 'Selected row ids.' },
        {
          name: 'defaultSelectedIds',
          type: 'string[]',
          description: 'Starting `selectedIds` when uncontrolled.',
        },
        {
          name: 'onSelectedIdsChange',
          type: '(selectedIds: string[]) => void',
          description: 'Called with the new `selectedIds`.',
        },
        {
          name: 'searchable',
          type: 'boolean',
          default: 'false',
          description: 'Adds a search field over the searchable columns.',
        },
        { name: 'search', type: 'string', description: 'Search text (controlled or not).' },
        {
          name: 'defaultSearch',
          type: 'string',
          description: 'Starting `search` when uncontrolled.',
        },
        {
          name: 'onSearchChange',
          type: '(search: string) => void',
          description: 'Called with the new `search`.',
        },
        {
          name: 'filterRow',
          type: '(row, search) => boolean',
          description:
            'Custom filter. Default: a column contains the text, ignoring case and accents.',
        },
        { name: 'toolbar', type: 'ReactNode', description: 'Controls next to the search field.' },
        { name: 'empty', type: 'ReactNode', description: 'Shown when no row matches.' },
        {
          name: 'loading',
          type: 'boolean',
          default: 'false',
          description: 'Placeholder rows and `aria-busy`.',
        },
        {
          name: 'labels',
          type: 'Partial<DataTableLabels>',
          description: 'Search, checkbox, empty and status text, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'DataTableColumn<T>',
      kind: 'type',
      props: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: 'Key; the row field read by default.',
        },
        { name: 'header', type: 'ReactNode', required: true, description: 'Header text.' },
        {
          name: 'accessor',
          type: '(row: T) => string | number | boolean | Date | null | undefined',
          description: 'Value to sort, search and show. Default: `row[id]`.',
        },
        { name: 'cell', type: '(row) => ReactNode', description: 'Custom cell content.' },
        { name: 'sortable', type: 'boolean', description: 'Header becomes a sort button.' },
        {
          name: 'searchable',
          type: 'boolean',
          default: 'true',
          description: 'Include in the search.',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end'",
          options: ['start', 'center', 'end'],
          default: "'start'",
          description: 'Alignment of the header and cells, as on Table cells.',
        },
        {
          name: 'flex',
          type: 'number',
          default: '1',
          min: 0,
          description: 'Share of the width, like CSS `flex-grow`.',
        },
        {
          name: 'width',
          type: 'number | SizeTokens',
          token: 'size',
          description: 'A fixed width instead of a share.',
        },
      ],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Sort, search, select and page',
      description: 'Sorted by reach; scrolls sideways on phones.',
    },
    { name: 'states', title: 'Loading and empty' },
  ],
  accessibility: [
    'Built on Table: ARIA table roles, a name from `aria-label` or `caption`, and sort buttons with `aria-sort`.',
    'Row checkboxes are named from `getRowLabel` ("Select Shwe Health, Mawlamyine"); the header box selects the page and is "mixed" when some are.',
    'The search field is a named `searchbox`. The line under the table ("1 selected · 1–5 of 7") is a polite live region, so filtering and paging are announced.',
    'While `loading` the wrapper has `aria-busy` and the placeholder rows are hidden.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Search field, sort buttons, checkboxes, then the pager.' },
    { keys: 'Enter / Space', action: 'Sort by the focused column.' },
    { keys: 'Space', action: 'Check the focused row.' },
  ],
  responsive:
    'Set `minWidth` so the table scrolls sideways on phones; the search field and pager wrap.',
  platformNotes: {
    web: 'Sorting, searching and paging run in the browser on `data`. For server-side data, control `sort`, `search` and `page` and pass only the current page.',
    ios: 'Same features; the sort button’s name says how the column is sorted.',
    android: 'Same as iOS.',
  },
  related: ['table', 'pagination', 'checkbox'],
})
