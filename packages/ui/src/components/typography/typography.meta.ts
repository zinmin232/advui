import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Typography',
  slug: 'typography',
  category: 'foundations',
  description: 'Text, Heading and Kbd components built on the type scale and semantic colors.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Text', 'Heading', 'Kbd'],
  files: [
    'components/typography/Text.tsx',
    'components/typography/Heading.tsx',
    'components/typography/Kbd.tsx',
    'components/typography/index.ts',
  ],
  keywords: ['text', 'heading', 'font', 'h1', 'paragraph', 'type scale'],
  usage: `import { Heading, Text } from '@adv-ui/core'

<Heading level={2}>Billing</Heading>
<Text tone="muted">Manage your plan and invoices.</Text>`,
  parts: [
    {
      name: 'Text',
      props: [
        {
          name: 'size',
          type: "'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' … '6xl'",
          default: "'base'",
          description: '12px → 60px.',
        },
        {
          name: 'weight',
          type: "'normal' | 'medium' | 'semibold' | 'bold'",
          description: 'Font weight.',
        },
        {
          name: 'tone',
          type: "'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'inherit'",
          description: 'Semantic color.',
        },
        { name: 'truncate', type: 'boolean', description: 'Single line with ellipsis.' },
        { name: 'mono', type: 'boolean', description: 'Monospace font.' },
      ],
    },
    {
      name: 'Heading',
      props: [
        {
          name: 'level',
          type: '1 | 2 | 3 | 4 | 5 | 6',
          default: '2',
          description: 'Semantic level (h1–h6).',
        },
        {
          name: 'size',
          type: 'TextSize',
          description: 'Override the visual size independently of the level.',
        },
      ],
    },
    { name: 'Kbd', description: 'Keyboard key hint rendered as `<kbd>` on web.', props: [] },
  ],
  examples: [
    { name: 'scale', title: 'Type scale' },
    { name: 'tones', title: 'Tones' },
  ],
  accessibility: [
    'Heading renders `<h1>`–`<h6>` on web and `role="heading"` with `aria-level` on native.',
    'Keep heading levels sequential; change `size`, not `level`, for visual tweaks.',
    'All tones meet 4.5:1 contrast on the default background.',
    'Text respects the OS font scale on iOS/Android (Dynamic Type / font size).',
  ],
  related: ['theme', 'colors'],
})
