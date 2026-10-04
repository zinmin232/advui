import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Search',
  slug: 'search',
  category: 'advanced',
  description: 'A search field with a magnifier, a clear button and a loading state.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Search', 'SearchProps'],
  files: ['components/search/Search.tsx', 'components/search/index.ts'],
  keywords: ['search', 'find', 'filter', 'query', 'searchbox', 'lookup'],
  usage: `import { Search } from '@advui/core'

<Search placeholder="Search publications" onSearch={runSearch} />`,
  parts: [
    {
      name: 'Search',
      description: 'Also takes the Input props (`placeholder`, `disabled`, `id`…).',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'The text (controlled or not). Filter live from `onValueChange`.',
        },
        {
          name: 'defaultValue',
          type: 'string',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called with the new `value`.',
        },
        {
          name: 'onSearch',
          type: '(value: string) => void',
          description: 'Enter, or the keyboard’s search key, was pressed.',
        },
        {
          name: 'loading',
          type: 'boolean',
          default: 'false',
          description: 'A spinner replaces the magnifier; sets `aria-busy`.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Height.',
        },
        {
          name: 'aria-label',
          type: 'string',
          default: "'Search'",
          description: 'Name of the field. Say what it searches.',
        },
        {
          name: 'clearLabel',
          type: 'string',
          default: "'Clear search'",
          description: 'Name of the clear button.',
        },
        {
          name: 'landmark',
          type: 'boolean',
          default: 'false',
          platforms: ['web'],
          description: 'Wraps it in a `search` landmark, for the page’s main search.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Search on Enter' },
    {
      name: 'live',
      title: 'Live results',
      description: 'Filters as you type, with the loading spinner and a live result count.',
    },
  ],
  playground: {
    component: 'Search',
    controls: [
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'loading', type: 'boolean', default: false },
      { prop: 'placeholder', type: 'text', default: 'Search' },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'A `searchbox` named by `aria-label` (default "Search"); the icons are hidden.',
    'The clear button is named "Clear search", appears only with text, and returns focus to the field.',
    'While `loading` the field has `aria-busy`. Announce result counts in a polite live region, as in the Live example.',
    '`landmark` adds a `search` landmark so screen-reader users can jump to it.',
  ],
  keyboard: [
    { keys: 'Enter', action: 'Runs `onSearch`.' },
    { keys: 'Escape', action: 'Clears the text (web).' },
  ],
  platformNotes: {
    web: 'The Enter key hint is "search" on phone keyboards.',
    ios: 'The keyboard’s return key reads "Search".',
    android: 'Same as iOS.',
  },
  related: ['input', 'command-palette', 'autocomplete', 'data-table'],
})
