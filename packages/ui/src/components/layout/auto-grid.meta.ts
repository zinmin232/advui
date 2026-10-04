import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Auto Grid',
  slug: 'auto-grid',
  category: 'layout',
  description:
    'Equal-width cells that pick their column count from the available width: as many as fit at a minimum width, with no breakpoints.',
  status: 'beta',
  since: '0.11.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['AutoGrid', 'AutoGridProps', 'autoGridColumns'],
  files: [
    'components/layout/AutoGrid.tsx',
    'components/layout/AutoGrid.native.tsx',
    'components/layout/autoGridColumns.ts',
  ],
  keywords: [
    'auto grid',
    'auto-fill',
    'responsive',
    'cards',
    'gallery',
    'tiles',
    'min child width',
    'columns',
  ],
  usage: `import { AutoGrid, Card } from '@advui/core'

<AutoGrid minChildWidth={240} gap="$4" maxColumns={4}>
  {items.map((item) => <Card key={item.id}>…</Card>)}
</AutoGrid>`,
  parts: [
    {
      name: 'AutoGrid',
      description:
        'Each child is one cell. Cells are equal width and fill the row; a lone child stays one column wide. It takes View style props and is full width by default.',
      props: [
        {
          name: 'minChildWidth',
          type: 'number',
          default: '240',
          min: 1,
          step: 1,
          description:
            'Narrowest a cell gets, in px. Columns = how many fit with the gaps, so a 1000px grid with 240px cells and `$4` gaps has 3. A grid narrower than this has one column, as wide as the grid.',
        },
        {
          name: 'maxColumns',
          type: 'number',
          min: 1,
          step: 1,
          description: 'Most columns, however wide the grid gets. Default: no limit.',
        },
        {
          name: 'gap',
          type: 'SpaceTokens',
          token: 'space',
          default: "'$4'",
          description: 'Space between cells, across and down.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'autoGridColumns(width, minChildWidth, gap?, maxColumns?)',
      kind: 'function',
      description:
        'The column count for a width, in px, the same one the grid picks, for example to render the right number of skeleton cells.',
      props: [],
    },
  ],
  examples: [
    {
      name: 'card-gallery',
      title: 'Card gallery',
      description:
        'Cards at least 220px wide, up to 4 a row: 1 column on phones, more as the window widens.',
    },
  ],
  accessibility: [
    'Purely visual: AutoGrid adds no role. For a list of items, give it `role="list"` and each card `role="listitem"`.',
    'Cells flow in source order, left to right then down, so reading order matches what is seen.',
  ],
  responsive:
    'No breakpoints: the column count follows the grid’s own width, so the same grid works full width or in a narrow sidebar. Use Grid when the counts should change at set breakpoints.',
  platformNotes: {
    web: 'CSS grid, `repeat(auto-fill, minmax(…))`, the one place Adv UI uses it: it is the only way to get the column count right on the first paint and in server-rendered HTML without measuring.',
    ios: 'No CSS grid in React Native: the grid measures its width with `onLayout` and lays cells out in a wrapping row of equal widths, with the same column count as web. It shows one column until the first layout.',
    android:
      'No CSS grid in React Native: the grid measures its width with `onLayout` and lays cells out in a wrapping row of equal widths, with the same column count as web. It shows one column until the first layout.',
  },
  related: ['grid', 'wrap', 'card'],
})
