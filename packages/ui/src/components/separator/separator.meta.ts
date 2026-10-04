import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Separator',
  slug: 'separator',
  category: 'foundations',
  description: 'A thin line that divides content horizontally or vertically.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Separator'],
  files: ['components/separator/Separator.tsx', 'components/separator/index.ts'],
  keywords: ['divider', 'hr', 'rule', 'line'],
  usage: `import { Separator } from '@advui/core'

<Separator />`,
  parts: [
    {
      name: 'Separator',
      props: [
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          options: ['horizontal', 'vertical'],
          default: "'horizontal'",
          description: 'Direction of the line.',
        },
        {
          name: 'decorative',
          type: 'boolean',
          default: 'true',
          description: 'When false, exposes `role="separator"` to assistive technology.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [{ name: 'basic', title: 'Horizontal and vertical' }],
  accessibility: [
    'Decorative by default (hidden from screen readers).',
    'Set `decorative={false}` when it separates meaningful groups, e.g. in menus.',
  ],
  related: ['card'],
})
