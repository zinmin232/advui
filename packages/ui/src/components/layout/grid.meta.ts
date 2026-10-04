import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Grid',
  slug: 'grid',
  category: 'layout',
  description:
    'Responsive columns with spans and offsets, such as 12-column 8 / 4 layouts, identical on web and native.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Grid', 'GridItem'],
  files: ['components/layout/Grid.tsx'],
  keywords: [
    'columns',
    'grid',
    'responsive',
    'cards',
    'gallery',
    'span',
    'offset',
    '12 column',
    'bootstrap',
    'row',
    'col',
  ],
  usage: `import { Grid } from '@advui/core'

<Grid columns={12} gap="$4">
  <Grid.Item span={{ base: 12, md: 8 }}>…main…</Grid.Item>
  <Grid.Item span={{ base: 12, md: 4 }}>…side…</Grid.Item>
</Grid>

// Equal columns: plain children are one column each
<Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="$4">
  {items.map((item) => <Card key={item.id}>…</Card>)}
</Grid>`,
  parts: [
    {
      name: 'Grid',
      description:
        'A row of columns that wraps. Each child is a cell: a `Grid.Item`, or any other element in a one-column cell. Takes View style props.',
      props: [
        {
          name: 'columns',
          type: 'number',
          responsive: true,
          default: '1',
          min: 1,
          step: 1,
          description:
            'Column count, optionally per breakpoint (mobile-first: a missing breakpoint inherits the nearest smaller one).',
        },
        {
          name: 'gap',
          type: 'SpaceTokens',
          token: 'space',
          default: "'$4'",
          description: 'Gap between cells.',
        },
        {
          name: 'rowGap',
          type: 'SpaceTokens',
          token: 'space',
          description: 'Gap between rows. Defaults to `gap`.',
        },
        {
          name: 'columnGap',
          type: 'SpaceTokens',
          token: 'space',
          description:
            'Gap between columns. Defaults to `gap`. It is padding inside each cell, so it never changes a cell’s share of the row.',
        },
        {
          name: 'alignItems',
          type: "'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline'",
          options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'],
          default: "'stretch'",
          description:
            'Cross-axis alignment of the cells in a row. `stretch` makes cells in a row the same height.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'Grid.Item',
      description:
        'One cell (also exported as `GridItem`), since 0.7.0. It is the cell itself, with no extra wrapper, so its horizontal padding is the column gap: put backgrounds, borders and padding on a child. Cells in a row share its height; give the child `flexGrow={1}` to fill it. Takes View style props.',
      props: [
        {
          name: 'span',
          type: "number | 'full' | 'auto'",
          responsive: true,
          default: '1',
          min: 1,
          step: 1,
          description:
            "Columns to cover, optionally per breakpoint (mobile-first). A map without `base` covers the full row below its first breakpoint, like Bootstrap: `{ md: 8 }` stacks on phones. `'full'` covers every column at that breakpoint, `'auto'` sizes to the content (capped at the row). Clamped to 1 – `columns`.",
        },
        {
          name: 'offset',
          type: 'number',
          responsive: true,
          default: '0',
          min: 0,
          step: 1,
          description:
            'Empty columns before the cell, optionally per breakpoint. Applied as `marginInlineStart`, so it mirrors in right-to-left layouts. Clamped so the cell still fits its row.',
        },
      ],
      children: { accepts: 'any' },
      parents: ['Grid'],
    },
  ],
  examples: [
    {
      name: 'two-column-8-4',
      title: 'Two columns (8 / 4)',
      description: 'Main content and a side panel from md; stacked on phones.',
    },
    {
      name: 'sidebar-3-9',
      title: 'Sidebar (3 / 9)',
      description: 'Section links beside the content from md; above it on phones.',
    },
    {
      name: 'responsive-cards',
      title: 'Responsive cards',
      description: 'One column on phones, two from sm and three from lg, with plain children.',
    },
    {
      name: 'offset',
      title: 'Offset',
      description: 'Empty columns before a cell: centered from md, or pushed to the end.',
    },
    { name: 'grid', title: 'Responsive stats' },
  ],
  playground: {
    component: 'Grid',
    controls: [
      { prop: 'columns', type: 'number', default: 1, min: 1, max: 12, step: 1 },
      { prop: 'gap', type: 'select', options: ['$0', '$2', '$4', '$6', '$8'], default: '$4' },
      {
        prop: 'alignItems',
        type: 'select',
        options: ['stretch', 'flex-start', 'center', 'flex-end'],
        default: 'stretch',
      },
    ],
  },
  accessibility: [
    'Purely visual: Grid and Grid.Item add no roles.',
    'Reading order follows source order on every platform. Offsets only add space, and there is no `order` prop, so what you see matches what screen readers read.',
  ],
  responsive:
    '`columns`, `span` and `offset` take a number or a mobile-first map `{ base, xs, sm, md, lg, xl, xxl }` (from 460, 640, 768, 1024, 1280 and 1536 px). A missing breakpoint inherits the nearest smaller one. A missing `base` is the prop’s default (`columns` 1, `offset` 0), except in a `span` map, where it is the full row, as in Bootstrap. At each breakpoint a cell is `min(span, columns) / columns` of the row, and only the breakpoints where that changes are emitted. They compile to CSS media queries on web (SSR-safe) and to window-size checks on native.',
  tables: [
    {
      id: 'from-bootstrap',
      title: 'From Bootstrap',
      description:
        'Bootstrap’s 12-column grid maps to `<Grid columns={12}>`, and a `span` map without `base` is full width below its first breakpoint, as a Bootstrap column is.',
      columns: ['Bootstrap', 'Adv UI', 'Notes'],
      rows: [
        ['`.row`', '`<Grid columns={12}>`', 'A Grid has 1 column unless you set `columns`.'],
        ['`.col-8`', '`<Grid.Item span={8}>`', 'At every width.'],
        ['`.col-md-8`', '`<Grid.Item span={{ md: 8 }}>`', 'Full width below md.'],
        [
          '`.col-6 .col-md-8 .col-lg-6`',
          '`span={{ base: 6, md: 8, lg: 6 }}`',
          'Mobile-first; set `base` for phones.',
        ],
        ['`.col-auto`', '`span="auto"`', 'Content width, capped at the row.'],
        [
          '`.col` (equal widths)',
          'Plain children in `<Grid columns={3}>`',
          'Set `columns` to the number of cells per row.',
        ],
        [
          '`.row-cols-1 .row-cols-md-3`',
          '`<Grid columns={{ base: 1, md: 3 }}>`',
          'No Grid.Item needed.',
        ],
        ['`.offset-md-2`', '`offset={{ md: 2 }}`', 'Mirrors in right-to-left layouts.'],
        [
          '`.g-3` (1rem)',
          '`gap="$4"` (16px)',
          '`.g-1` → `$1`, `.g-2` → `$2`, `.g-4` → `$6`, `.g-5` → `$12`.',
        ],
        ['`.gx-*` / `.gy-*`', '`columnGap` / `rowGap`', 'Both default to `gap`.'],
        ['`.align-items-center` on `.row`', '`<Grid alignItems="center">`', ''],
        [
          '`.order-*`',
          'Not supported',
          'React Native has no `order`, and reordering would break reading order. Change the source order.',
        ],
      ],
    },
  ],
  platformNotes: {
    web: 'Flex-wrap with percentage widths, not CSS grid: Tamagui’s CSS-grid props (`gridTemplateColumns`, `gridColumn`) are web-only and dropped on native, and `display: grid` does not exist there, so one flex layout keeps web, iOS and Android identical. Offsets use `margin-inline-start`.',
    ios: 'Identical to web: the same flex-wrap and percentage widths, laid out by Yoga. Offsets use `marginStart`, mirrored in right-to-left layouts.',
    android:
      'Identical to web: the same flex-wrap and percentage widths, laid out by Yoga. Offsets use `marginStart`, mirrored in right-to-left layouts.',
  },
  related: ['stack', 'container'],
})
