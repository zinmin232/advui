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
  keywords: ['page', 'wrapper', 'max width', 'center', 'gutter', 'fluid', 'bootstrap'],
  usage: `import { Container } from '@advui/core'

<Container size="lg">…page…</Container>

// Edge to edge on phones, padded from md
<Container gutter={{ base: '$0', md: '$6' }}>…</Container>`,
  parts: [
    {
      name: 'Container',
      description: 'Takes View style props too.',
      props: [
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full'",
          options: ['sm', 'md', 'lg', 'xl', 'xxl', 'full'],
          default: "'xl'",
          description:
            'Max width: the breakpoint width (640, 768, 1024, 1280 or 1536 px), or `full` for no maximum (Bootstrap’s `container-fluid`).',
        },
        {
          name: 'gutter',
          type: 'SpaceTokens',
          token: 'space',
          responsive: true,
          default: "{ base: '$4', md: '$6', lg: '$8' }",
          description:
            'Side padding. A token or map replaces the default at every breakpoint; `"$0"` removes it. Since 0.9.0.',
        },
        {
          name: 'centerContent',
          type: 'boolean',
          default: 'false',
          description: 'Centers the children horizontally (`alignItems: center`). Since 0.9.0.',
        },
      ],
      children: { accepts: 'any' },
    },
  ],
  examples: [
    { name: 'container', title: 'Page container' },
    {
      name: 'gutter',
      title: 'Gutter and centered content',
      description: 'The default gutter, `gutter="$0"` and `centerContent`.',
    },
  ],
  accessibility: ['Visual only.'],
  responsive:
    'By default the side padding grows from 16px (phones) to 24px (md) and 32px (lg). `gutter` takes a token or a mobile-first map `{ base, sm, md, … }`; it compiles to CSS media queries on web.',
  tables: [
    {
      id: 'from-bootstrap',
      title: 'From Bootstrap',
      columns: ['Bootstrap', 'Adv UI', 'Notes'],
      rows: [
        ['`.container`', '`<Container>`', 'Up to 1280px (`xl`), centered.'],
        ['`.container-lg`', '`<Container size="lg">`', 'Also `sm`, `md`, `xl` and `xxl`.'],
        ['`.container-fluid`', '`<Container size="full">`', 'There is no separate `fluid` prop.'],
        [
          '`.px-0` on a container',
          '`gutter="$0"`',
          'Or a map, such as `{ base: "$0", md: "$6" }`.',
        ],
      ],
    },
  ],
  related: ['stack', 'grid'],
})
