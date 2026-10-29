import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Virtual List',
  slug: 'virtual-list',
  category: 'data-display',
  description:
    'A long list that draws only the rows in view, so thousands of rows scroll smoothly.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['VirtualList', 'VirtualListProps'],
  files: [
    'components/virtual-list/VirtualList.tsx',
    'components/virtual-list/VirtualList.native.tsx',
    'components/virtual-list/offsets.ts',
    'components/virtual-list/index.ts',
  ],
  keywords: [
    'virtual',
    'virtualized',
    'windowing',
    'long list',
    'large list',
    'performance',
    'flatlist',
    'recycler',
  ],
  usage: `import { Text } from '@advui/core'
import { VirtualList } from '@advui/data'

<VirtualList
  aria-label="Invoices"
  height="80"
  data={invoices}
  itemHeight={56}
  getItemKey={(invoice) => invoice.id}
  renderItem={(invoice) => <Text>{invoice.id}</Text>}
/>`,
  parts: [
    {
      name: 'VirtualList',
      description:
        'Give it a height (`height`, or `flex` in a sized parent). Takes ScrollArea’s size and border props.',
      props: [
        {
          name: 'data',
          type: 'readonly T[]',
          required: true,
          description: 'The rows, in order.',
        },
        {
          name: 'renderItem',
          type: '(item: T, index: number) => ReactNode',
          required: true,
          description: 'Draws one row, in a box of the row’s height.',
        },
        {
          name: 'itemHeight',
          type: 'number | ((index: number) => number)',
          required: true,
          description: 'Row height in pixels: one for every row, or one per row.',
        },
        {
          name: 'getItemKey',
          type: '(item: T, index: number) => string | number',
          description: 'A stable key per row, such as its id. Default: the index.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the list for screen readers. Recommended.',
        },
        {
          name: 'overscan',
          type: 'number',
          default: '4',
          min: 0,
          max: 50,
          step: 1,
          platforms: ['web'],
          description:
            'Rows drawn above and below the visible ones, so fast scrolling shows no gap.',
        },
        {
          name: 'initialCount',
          type: 'number',
          default: '10',
          min: 1,
          step: 1,
          description: 'Rows drawn before the list is measured: on the server and in the first frame.',
        },
        {
          name: 'onEndReached',
          type: '() => void',
          description:
            'Called when the end comes near, once for each length of `data`: load the next page here.',
        },
        {
          name: 'onEndReachedThreshold',
          type: 'number',
          default: '0.5',
          min: 0,
          step: 0.1,
          description: 'How near the end `onEndReached` fires, in visible heights.',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description: 'Shown after the last row, such as a loading row.',
        },
        {
          name: 'empty',
          type: 'ReactNode',
          description: 'Shown instead of the list when `data` is empty, such as an Empty State.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Ten thousand rows',
      description: 'Only the rows in view, and a few around them, are drawn.',
    },
    {
      name: 'load-more',
      title: 'Load more at the end',
      description: '`onEndReached` loads the next page and `footer` shows that it is loading.',
    },
    {
      name: 'variable-heights',
      title: 'Rows of different heights',
      description: '`itemHeight` as a function: day headings are shorter than messages.',
    },
  ],
  accessibility: [
    'On web it is a ScrollArea (a named `region` that takes focus, so the arrow keys scroll it) holding a `list`.',
    'Only the drawn rows are in the page, so each `listitem` has `aria-posinset` and `aria-setsize`: screen readers say “3 of 10,000”.',
    'A row that holds focus stays drawn when it scrolls out of view, so keyboard focus is never lost. Tab moves through the drawn rows, and the list scrolls to each.',
    'On iOS and Android it is a FlatList named with `accessibilityLabel`; VoiceOver and TalkBack scroll it as they move from row to row.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focuses the list, then moves through what its rows hold.' },
    { keys: 'Arrow keys / Page Up / Page Down', action: 'Scroll while the list has focus.' },
    { keys: 'Home / End', action: 'Scroll to the first or last row.' },
  ],
  platformNotes: {
    web: 'Rows are placed at their offsets in a box as tall as the whole list, so the scrollbar is true to length.',
    ios: 'A FlatList with `getItemLayout` from `itemHeight`, so it places rows without measuring them. It keeps its own window of rows; `overscan` is ignored. In a scrolling screen it still windows its rows, as it has a height, so React Native’s warning about lists nested in scroll views is not raised.',
    android: 'Same as iOS, with nested scrolling on, so the list scrolls inside a scrolling screen.',
  },
  related: ['scroll-area', 'list', 'infinite-scroll', 'data-table'],
})
