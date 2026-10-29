import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Infinite Scroll',
  slug: 'infinite-scroll',
  category: 'data-display',
  description:
    'Loads more items as the end of a list comes into view, with loading, error and end states.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['InfiniteScroll', 'InfiniteScrollProps', 'InfiniteScrollMode'],
  files: [
    'components/infinite-scroll/InfiniteScroll.tsx',
    'components/infinite-scroll/useNearEnd.tsx',
    'components/infinite-scroll/useNearEnd.native.tsx',
    'components/infinite-scroll/index.ts',
  ],
  keywords: [
    'infinite',
    'endless',
    'load more',
    'pagination',
    'lazy load',
    'feed',
    'next page',
    'scroll',
  ],
  usage: `import { Text } from '@advui/core'
import { InfiniteScroll } from '@advui/data'

<InfiniteScroll
  aria-label="Activity"
  height="80"
  hasMore={hasMore}
  loading={loading}
  onLoadMore={loadNextPage}
  endMessage="You're all caught up"
>
  {items.map((item) => <Text key={item.id}>{item.text}</Text>)}
</InfiniteScroll>`,
  parts: [
    {
      name: 'InfiniteScroll',
      description:
        'A ScrollArea: give it a height to scroll on its own. On web, without one it grows and the page scrolls.',
      props: [
        {
          name: 'hasMore',
          type: 'boolean',
          required: true,
          description: 'More items remain to load.',
        },
        {
          name: 'onLoadMore',
          type: '() => void',
          required: true,
          description: 'Loads the next page: called near the end, or from Load more or Try again.',
        },
        {
          name: 'loading',
          type: 'boolean',
          default: 'false',
          description: 'A page is loading. Shows the loading row; no other load starts.',
        },
        {
          name: 'mode',
          type: "'auto' | 'button'",
          options: ['auto', 'button'],
          default: "'auto'",
          description: '`auto` loads as the end comes near; `button` waits for Load more.',
        },
        {
          name: 'threshold',
          type: 'number',
          default: '0.5',
          min: 0,
          max: 3,
          step: 0.1,
          description: 'How near the end loading starts, in visible heights.',
        },
        {
          name: 'itemCount',
          type: 'number',
          description:
            'The number of loaded items, when they sit in one element such as a VStack. Default: the number of children.',
        },
        {
          name: 'error',
          type: 'ReactNode',
          description:
            'Why the last page failed. Shown with Try again; loading pauses until it is cleared.',
        },
        {
          name: 'endMessage',
          type: 'ReactNode',
          description: 'Shown once nothing remains.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the area for screen readers. Recommended.',
        },
        {
          name: 'loadingLabel',
          type: 'string',
          default: "'Loading more…'",
          description: 'Text of the loading row.',
        },
        {
          name: 'loadMoreLabel',
          type: 'string',
          default: "'Load more'",
          description: 'The button in `button` mode.',
        },
        {
          name: 'retryLabel',
          type: 'string',
          default: "'Try again'",
          description: 'The button after an error.',
        },
        {
          name: 'loadedLabel',
          type: '(count: number) => string',
          description: 'Announced after a page loads. Default: “10 more loaded”.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'The loaded items.',
        },
      ],
      children: { accepts: 'any' },
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Activity feed',
      description: 'Pages load as you scroll, until the end message.',
    },
    {
      name: 'load-more',
      title: 'Load more button',
      description: '`mode="button"` loads only when asked, so content after the list stays in reach.',
    },
    {
      name: 'error',
      title: 'A page that fails',
      description: 'The second page fails once; Try again loads it.',
    },
  ],
  accessibility: [
    'While a page loads the area has `aria-busy`, and the loading row says so in words (its spinner is hidden).',
    'After a page, the number of new items is announced (“10 more loaded”): through a polite live region on web, with `AccessibilityInfo.announceForAccessibility` on iOS and Android. A text `error` is announced the same way.',
    'In `button` mode, Load more stays focusable while it loads (`aria-busy` and `aria-disabled`, not `disabled`, which would drop focus) and ignores presses; use it when content after the list must stay in reach.',
    'The items keep their own semantics: put a List inside, or rows with their own roles.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the items, then to Load more or Try again.' },
    { keys: 'Enter / Space', action: 'Presses Load more or Try again.' },
    { keys: 'Arrow keys / Page Up / Page Down', action: 'Scroll the area while it has focus.' },
  ],
  platformNotes: {
    web: 'An IntersectionObserver watches the end, so it works in a ScrollArea of its own height, inside another scrolling box, or on the page.',
    ios: 'The ScrollView’s scroll, content size and layout events: give it a height, as a screen does not scroll around it. Content shorter than the area loads more until it fills it.',
    android: 'Same as iOS, with nested scrolling on.',
  },
  related: ['virtual-list', 'scroll-area', 'list', 'loading-button', 'pagination'],
})
