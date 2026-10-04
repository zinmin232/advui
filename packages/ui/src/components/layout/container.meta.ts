import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Container',
  slug: 'container',
  category: 'layout',
  description: 'Centers page content with a max width and responsive side padding.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Container'],
  files: ['components/layout/Container.tsx'],
  keywords: ['page', 'wrapper', 'max width', 'center'],
  usage: `import { Container } from '@advui/core'

<Container size="lg">…page…</Container>`,
  parts: [
    {
      name: 'Container',
      description: 'Takes View style props too.',
      props: [
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg' | 'xl' | 'full'",
          options: ['sm', 'md', 'lg', 'xl', 'full'],
          default: "'xl'",
          description:
            'Max width: the breakpoint width (640, 768, 1024 or 1280 px), or `full` for no maximum.',
        },
      ],
      children: { accepts: 'any' },
    },
  ],
  examples: [{ name: 'container', title: 'Page container' }],
  accessibility: ['Visual only.'],
  responsive: 'Side padding grows from 16px (phones) to 24px (md) and 32px (lg).',
  related: ['stack', 'grid'],
})
