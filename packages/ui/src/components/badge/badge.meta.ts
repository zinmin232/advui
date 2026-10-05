import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Badge',
  slug: 'badge',
  category: 'foundations',
  description: 'A small label for status, counts or categories.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Badge', 'BadgeText', 'BadgeFrame'],
  files: ['components/badge/Badge.tsx', 'components/badge/index.ts'],
  keywords: ['tag', 'chip', 'status', 'label', 'pill'],
  usage: `import { Badge } from '@advui/core'

<Badge variant="success">Active</Badge>`,
  parts: [
    {
      name: 'Badge',
      props: [
        {
          name: 'variant',
          type: "'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info'",
          options: ['default', 'secondary', 'outline', 'destructive', 'success', 'warning', 'info'],
          default: "'default'",
          description: 'Color intent.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          options: ['sm', 'md'],
          default: "'md'",
          description: 'Padding scale.',
        },
        { name: 'icon', type: 'ReactNode', description: 'Leading icon (12px, tinted to match).' },
      ],
      children: { accepts: 'text' },
    },
  ],
  examples: [
    { name: 'variants', title: 'Variants' },
    { name: 'with-icon', title: 'With icon' },
  ],
  playground: {
    component: 'Badge',
    children: 'Badge',
    controls: [
      {
        prop: 'variant',
        type: 'select',
        options: ['default', 'secondary', 'outline', 'destructive', 'success', 'warning', 'info'],
        default: 'default',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md'], default: 'md' },
    ],
  },
  accessibility: [
    'Badges are static text — do not rely on color alone; the label must carry the meaning.',
    'Soft status variants meet 4.5:1 text contrast in light and dark mode.',
    'For live counts (e.g. unread messages) announce changes with a polite live region elsewhere.',
  ],
  related: ['avatar', 'alert'],
})
