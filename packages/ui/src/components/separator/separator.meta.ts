import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Separator',
  slug: 'separator',
  category: 'foundations',
  description:
    'A thin line that divides content horizontally or vertically, with an optional label.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Separator', 'SeparatorProps', 'SeparatorLabelPosition'],
  files: ['components/separator/Separator.tsx', 'components/separator/index.ts'],
  keywords: ['divider', 'hr', 'rule', 'line', 'or', 'label'],
  usage: `import { Separator } from '@advui/core'

<Separator />
<Separator label="or" />
<Separator label="Continue with" labelPosition="start" />`,
  parts: [
    {
      name: 'Separator',
      description:
        'With a label, it is a row: a line, the label in small muted text, then a line, `$3` apart. View props go on that row.',
      props: [
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          options: ['horizontal', 'vertical'],
          default: "'horizontal'",
          description: 'Direction of the line. A vertical separator ignores the label.',
        },
        {
          name: 'decorative',
          type: 'boolean',
          default: 'true',
          description:
            'When false, exposes `role="separator"` to assistive technology, named by the label.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Text between two lines, such as "or". Horizontal only. Since 0.9.0.',
        },
        {
          name: 'labelPosition',
          type: "'start' | 'center' | 'end'",
          options: ['start', 'center', 'end'],
          default: "'center'",
          description:
            'Where the label sits: at `start` or `end`, the line on that side is 16px long. Since 0.9.0.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Richer content in place of `label`. Text is styled like the label.',
        },
      ],
      children: { accepts: 'text' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Horizontal and vertical' },
    {
      name: 'login',
      title: 'Labelled',
      description: 'An "or" between two ways to sign in, and a label at the start.',
    },
  ],
  accessibility: [
    'Decorative by default (hidden from screen readers). With a label, the lines are hidden and the label stays readable text.',
    'Set `decorative={false}` when it separates meaningful groups, e.g. in menus. A labelled one is then a `separator` named by its label (one element on iOS and Android).',
  ],
  related: ['card'],
})
