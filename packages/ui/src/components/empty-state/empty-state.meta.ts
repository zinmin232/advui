import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Empty State',
  slug: 'empty-state',
  category: 'feedback',
  description: 'A placeholder for an empty list, search or page, with the action that fills it.',
  status: 'beta',
  since: '0.4.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['EmptyState'],
  files: ['components/empty-state/EmptyState.tsx', 'components/empty-state/index.ts'],
  keywords: ['empty', 'no results', 'blank slate', 'zero state', 'placeholder'],
  usage: `import { Button, EmptyState } from '@advui/core'
import { MailIcon } from '@advui/icons'

<EmptyState
  icon={<MailIcon />}
  title="No messages"
  description="New messages will show up here."
>
  <Button>Compose</Button>
</EmptyState>`,
  parts: [
    {
      name: 'EmptyState',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Short heading.' },
        { name: 'description', type: 'ReactNode', description: 'One or two sentences.' },
        { name: 'icon', type: 'ReactNode', description: 'Icon in a circle above the title.' },
        { name: 'children', type: 'ReactNode', description: 'Actions, usually Buttons.' },
        {
          name: 'headingLevel',
          type: '1 | 2 | 3 | 4 | 5 | 6',
          default: '3',
          description: 'Heading level of the title.',
        },
        {
          name: 'bordered',
          type: 'boolean',
          default: 'false',
          description: 'Dashed border, for empty areas inside a page.',
        },
        {
          name: 'tone',
          type: "'default' | 'error'",
          default: "'default'",
          description: 'Colors of the icon circle.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'search', title: 'No search results' },
  ],
  accessibility: [
    'The title is a heading (`h3` by default), so screen-reader users can find it; set `headingLevel` to fit the page outline.',
    'The icon is decorative and hidden from assistive technology.',
  ],
  platformNotes: {},
  related: ['error-state', 'skeleton', 'alert'],
})
