import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Stat',
  slug: 'stat',
  category: 'data-display',
  description: 'One figure with its label, how it changed and a short note.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Stat',
    'StatFrame',
    'StatLabel',
    'StatValue',
    'StatHelpText',
    'StatProps',
    'StatDeltaProps',
    'StatSize',
    'StatTrend',
    'StatTone',
  ],
  files: ['components/stat/Stat.tsx', 'components/stat/index.ts'],
  keywords: ['statistic', 'metric', 'number', 'figure', 'delta', 'trend', 'change', 'kpi'],
  usage: `import { Stat } from '@advui/core'

<Stat>
  <Stat.Label>Revenue</Stat.Label>
  <Stat.Value>$48,210</Stat.Value>
  <Stat.Delta trend="up">12.5%</Stat.Delta>
  <Stat.HelpText>vs. last month</Stat.HelpText>
</Stat>`,
  parts: [
    {
      name: 'Stat',
      props: [
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Type scale of the label, value and help text.',
        },
      ],
    },
    { name: 'Stat.Label', description: 'Muted name of the figure.', props: [] },
    { name: 'Stat.Value', description: 'The figure, in the heading font.', props: [] },
    {
      name: 'Stat.Delta',
      description: 'The change since the last period, with an arrow.',
      props: [
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
          description:
            'Good or bad news; picks the color. `up` is positive and `down` negative unless you say otherwise.',
        },
        {
          name: 'variant',
          type: "'plain' | 'badge'",
          default: "'plain'",
          description: '`badge` puts the change on a soft pill.',
        },
        {
          name: 'trendLabel',
          type: 'string',
          default: "'Increased by' | 'Decreased by' | 'No change:'",
          description: 'Read by screen readers before the value. Translate it here.',
        },
      ],
    },
    { name: 'Stat.HelpText', description: 'Small muted note, such as the period.', props: [] },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    {
      name: 'trends',
      title: 'Trends and tones',
      description: 'A drop in refunds is good news, so it keeps the down arrow but reads positive.',
    },
    { name: 'sizes', title: 'Sizes' },
  ],
  accessibility: [
    'The parts are plain text read in order: label, value, change, note.',
    'The arrow is hidden from screen readers; `Stat.Delta` reads its direction as words ("Increased by 12.5%"). Set `trendLabel` to translate it.',
    'Color is never the only signal: the arrow and the words carry the direction too.',
  ],
  platformNotes: {
    web: 'The trend label is visually hidden text before the value.',
    ios: 'The trend label joins the value’s accessibility label when the value is text.',
    android: 'Same as iOS.',
  },
  related: ['kpi-card', 'card', 'badge'],
})
