import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Pagination',
  slug: 'pagination',
  category: 'navigation',
  description: 'Previous and next buttons around the page numbers of a long list or table.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Pagination',
    'getPaginationItems',
    'PaginationProps',
    'PaginationItem',
    'PaginationLabels',
  ],
  files: ['components/pagination/Pagination.tsx', 'components/pagination/index.ts'],
  keywords: ['pagination', 'pager', 'pages', 'next', 'previous', 'paging'],
  usage: `import { Pagination } from '@advui/core'

<Pagination count={12} page={page} onPageChange={setPage} />`,
  parts: [
    {
      name: 'Pagination',
      props: [
        {
          name: 'count',
          type: 'number',
          required: true,
          min: 0,
          step: 1,
          description: 'Number of pages.',
        },
        { name: 'page', type: 'number', description: 'Current page, from 1 (controlled).' },
        {
          name: 'defaultPage',
          type: 'number',
          default: '1',
          description: 'Initial page when uncontrolled.',
        },
        { name: 'onPageChange', type: '(page: number) => void', description: 'Page changed.' },
        {
          name: 'siblings',
          type: 'number',
          default: '1',
          min: 0,
          step: 1,
          description: 'Pages shown on each side of the current one.',
        },
        {
          name: 'boundaries',
          type: 'number',
          default: '1',
          min: 0,
          step: 1,
          description: 'Pages always shown at the start and the end.',
        },
        {
          name: 'variant',
          type: "'full' | 'compact'",
          options: ['full', 'compact'],
          default: "'full'",
          description: '`compact` shows "Page 3 of 10" instead of numbers; good on phones.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          options: ['sm', 'md'],
          default: "'md'",
          description: 'Button size.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables every button.',
        },
        {
          name: 'labels',
          type: 'Partial<PaginationLabels>',
          description: 'Button names and the compact text, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'getPaginationItems(page, count, options?)',
      kind: 'function',
      description:
        'The page numbers and gaps to show, for building your own pager. The item count stays the same while paging.',
      props: [],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'controlled', title: 'Controlled', description: 'Drive it from your data’s page.' },
    { name: 'compact', title: 'Compact' },
  ],
  playground: {
    component: 'Pagination',
    staticProps: { count: 10 },
    controls: [
      { prop: 'variant', type: 'select', options: ['full', 'compact'], default: 'full' },
      { prop: 'size', type: 'select', options: ['sm', 'md'], default: 'md' },
      { prop: 'siblings', type: 'number', default: 1, min: 0, max: 3 },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'A `nav` landmark named "Pagination" (set `aria-label` when a page has more than one) around a list of buttons.',
    'Page buttons are named "Page 3"; the current one has `aria-current="page"` on web and is "selected" on native.',
    'Previous and next are named icon buttons, disabled at the ends. The gaps are hidden.',
    'The compact text is a polite live region, so the new page is announced.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the buttons.' },
    { keys: 'Enter / Space', action: 'Goes to that page.' },
  ],
  responsive:
    'Below the `xs` breakpoint the buttons shrink to 32px so a full pager fits a phone. On very narrow screens they wrap; use `variant="compact"` or `siblings={0}` there.',
  related: ['table', 'button'],
})
