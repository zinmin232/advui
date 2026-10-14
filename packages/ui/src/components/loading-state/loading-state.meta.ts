import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Loading State',
  slug: 'loading-state',
  category: 'feedback',
  description:
    'Shown in place of content while it loads: a spinner, what is loading and a way to cancel.',
  status: 'beta',
  since: '0.13.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['LoadingState'],
  files: ['components/loading-state/LoadingState.tsx', 'components/loading-state/index.ts'],
  keywords: ['loading', 'loader', 'busy', 'fetching', 'please wait', 'spinner'],
  usage: `import { LoadingState } from '@advui/core'

<LoadingState
  title="Loading invoices…"
  description="This can take a minute."
  delay={300}
/>`,
  parts: [
    {
      name: 'LoadingState',
      props: [
        {
          name: 'title',
          type: 'ReactNode',
          default: "'Loading…'",
          description: 'What is loading.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'One sentence, such as how long it takes.',
        },
        {
          name: 'delay',
          type: 'number',
          default: '0',
          min: 0,
          step: 100,
          description: 'Milliseconds before it shows, so fast loads do not flash a spinner.',
        },
        {
          name: 'bordered',
          type: 'boolean',
          default: 'false',
          description: 'Dashed border, for loading areas inside a page.',
        },
        { name: 'children', type: 'ReactNode', description: 'Actions, such as a Cancel button.' },
      ],
      children: { accepts: 'any' },
    },
  ],
  playground: {
    component: 'LoadingState',
    controls: [
      { prop: 'title', type: 'text', default: 'Loading invoices…' },
      { prop: 'description', type: 'text', default: 'This can take a few seconds.' },
      { prop: 'bordered', type: 'boolean', default: false },
    ],
  },
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'cancel', title: 'With a cancel button' },
  ],
  accessibility: [
    'On web the title and description are a `status` region, so screen readers announce them politely, and again when they change (for example "Loading 3 of 10…").',
    'With `delay`, the empty region is on the page first and the text is added to it, which screen readers announce more reliably than a new region.',
    'The spinner is hidden from assistive technology because the text already says what is loading. Actions sit outside the status text and keep their own focus stop.',
  ],
  platformNotes: {
    ios: 'The text is one accessible element. Not announced automatically; announce it with `AccessibilityInfo` if needed.',
    android:
      'The text is one accessible element. Not announced automatically; announce it with `AccessibilityInfo` if needed.',
  },
  related: ['spinner', 'skeleton', 'empty-state', 'error-state'],
})
