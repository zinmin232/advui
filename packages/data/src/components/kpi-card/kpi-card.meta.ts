import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'KPI Card',
  slug: 'kpi-card',
  category: 'data-display',
  description: 'A card for one key figure on a dashboard, with its change and an icon.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['KpiCard', 'KpiCardProps'],
  files: ['components/kpi-card/KpiCard.tsx', 'components/kpi-card/index.ts'],
  keywords: ['kpi', 'metric', 'dashboard', 'stat', 'statistic', 'tile', 'summary', 'indicator'],
  usage: `import { KpiCard } from '@advui/data'
import { CreditCardIcon } from '@advui/icons'

<KpiCard
  label="Total revenue"
  value="$45,231.89"
  delta="20.1%"
  trend="up"
  description="from last month"
  icon={<CreditCardIcon />}
/>`,
  parts: [
    {
      name: 'KpiCard',
      description: 'Also takes every Card prop (`variant`, `interactive`, `onPress`…).',
      props: [
        { name: 'label', type: 'ReactNode', required: true, description: 'What is measured.' },
        {
          name: 'value',
          type: 'ReactNode',
          required: true,
          description: 'The figure, already formatted.',
        },
        { name: 'delta', type: 'ReactNode', description: 'The change, e.g. `"12.5%"`.' },
        {
          name: 'trend',
          type: "'up' | 'down' | 'neutral'",
          default: "'neutral'",
          description: 'Direction of the change; picks the arrow.',
        },
        {
          name: 'tone',
          type: "'positive' | 'negative' | 'neutral'",
          default: 'from `trend`',
          description: 'Good or bad news; picks the color. Set it when a drop is good.',
        },
        {
          name: 'trendLabel',
          type: 'string',
          default: "'Increased by' | 'Decreased by' | 'No change:'",
          description: 'Read by screen readers before the delta.',
        },
        { name: 'description', type: 'ReactNode', description: 'Short note after the delta.' },
        { name: 'icon', type: 'ReactNode', description: 'Decorative icon in the top corner.' },
        {
          name: 'loading',
          type: 'boolean',
          default: 'false',
          description: 'Placeholders for the value and delta; sets `aria-busy`.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Extra content below the figure, such as a Progress bar.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    {
      name: 'grid',
      title: 'Dashboard row',
      description: 'Fewer returns is good news: `tone="positive"` on a down trend.',
    },
    { name: 'with-progress', title: 'With a progress bar' },
    { name: 'loading', title: 'Loading' },
  ],
  playground: {
    component: 'KpiCard',
    staticProps: {
      label: 'Total revenue',
      value: '$45,231.89',
      delta: '20.1%',
      description: 'from last month',
    },
    controls: [
      { prop: 'trend', type: 'select', options: ['up', 'down', 'neutral'], default: 'up' },
      {
        prop: 'variant',
        type: 'select',
        options: ['outline', 'elevated', 'filled', 'ghost'],
        default: 'outline',
      },
      { prop: 'loading', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'The card reads as plain text in order: label, value, change, note. The icon is hidden.',
    'The change is read with its direction ("Increased by 20.1%"); set `trendLabel` to translate it.',
    'While `loading`, the card has `aria-busy` and the placeholders are hidden.',
    'An interactive card (`interactive` + `onPress`) needs a `role` and an `aria-label`, as with Card.',
  ],
  responsive:
    'Card padding shrinks from 24px to 16px below the `sm` breakpoint. Lay cards out with Grid.',
  related: ['stat', 'card', 'progress', 'skeleton'],
})
