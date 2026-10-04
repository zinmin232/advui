import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Wrap',
  slug: 'wrap',
  category: 'layout',
  description: 'A row that wraps onto new lines, for chips, tags and badges.',
  status: 'beta',
  since: '0.9.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Wrap', 'WrapProps'],
  files: ['components/layout/Stack.tsx'],
  keywords: ['wrap', 'flex wrap', 'chips', 'tags', 'badges', 'inline', 'row', 'cluster'],
  usage: `import { Badge, Wrap } from '@advui/core'

<Wrap>
  {tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
</Wrap>`,
  parts: [
    {
      name: 'Wrap',
      description:
        'A Stack with `flexDirection: row`, `flexWrap: wrap` and centered items. It takes the Stack props and View style props.',
      props: [
        {
          name: 'gap',
          type: 'SpaceTokens',
          token: 'space',
          default: "'$2'",
          description: 'Space between items, across and down.',
        },
        {
          name: 'rowGap',
          type: 'SpaceTokens',
          token: 'space',
          description: 'Space between lines. Defaults to `gap`.',
        },
        {
          name: 'columnGap',
          type: 'SpaceTokens',
          token: 'space',
          description: 'Space between items on a line. Defaults to `gap`.',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
          options: ['start', 'center', 'end', 'stretch', 'baseline'],
          responsive: true,
          default: "'center'",
          description: 'Alignment of the items on a line. Sets `alignItems`.',
        },
        {
          name: 'distribute',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
          responsive: true,
          default: "'start'",
          description: 'Where the items sit along each line. Sets `justifyContent`.',
        },
      ],
      children: { accepts: 'any' },
    },
  ],
  examples: [
    {
      name: 'tags',
      title: 'Chips and badges',
      description: 'Filter chips, and the picked topics as badges, wrapping to the width.',
    },
  ],
  accessibility: [
    'Purely visual: Wrap adds no role. Give a set of related controls a `role="group"` and an `aria-label`, or a list `role="list"` with `listitem` children.',
    'Items wrap in source order, so reading order matches what is seen.',
  ],
  responsive:
    'Items wrap to the available width with no breakpoints. `align` and `distribute` also take a mobile-first map, as on Stack.',
  related: ['stack', 'chip', 'badge'],
})
