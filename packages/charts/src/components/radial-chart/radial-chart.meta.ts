import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Radial Chart',
  slug: 'radial-chart',
  category: 'charts',
  description:
    'Progress toward a goal as rings: radial bars for a few items, or a gauge for one value.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['RadialChart', 'RadialChartProps', 'RadialItem'],
  files: ['components/radial-chart/RadialChart.tsx', 'components/radial-chart/index.ts'],
  keywords: ['radial bar chart', 'gauge', 'progress ring', 'speedometer', 'goal', 'activity rings'],
  usage: `import { RadialChart } from '@advui/charts'

<RadialChart
  title="Funding received"
  data={[{ label: 'Food', value: 72 }, { label: 'Health', value: 58 }]}
  max={100}
/>`,
  parts: [
    {
      name: 'RadialChart',
      props: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Names the chart: its heading and accessible name.',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Muted line under the title (units, period).',
        },
        {
          name: 'data',
          type: '{ label: string; value: number }[]',
          required: true,
          description:
            'One ring each, from the outside in, in color order (`chart1`…`chart8`). Up to five rings stay readable.',
        },
        {
          name: 'max',
          type: 'number',
          min: 0,
          description:
            'The value that fills a ring, such as 100 for percentages. By default the largest value, rounded up. Larger values fill the ring and no more.',
        },
        {
          name: 'variant',
          type: "'bars' | 'gauge'",
          options: ['bars', 'gauge'],
          default: "'bars'",
          description:
            '`bars` draws a three-quarter ring per item, named at its start. `gauge` draws a wider arc with the first value and label in the middle; more than one item adds a legend.',
        },
        {
          name: 'text',
          type: '{ label, value, percent }',
          description: 'Table headings, for translation.',
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: 'Formats the values in the middle, the legend, the tooltip and the table.',
        },
        {
          name: 'height',
          type: 'number',
          default: '240',
          min: 0,
          description: 'Pixels.',
        },
        {
          name: 'width',
          type: 'number',
          description: 'Fixed width. By default it fills its container.',
        },
        {
          name: 'labels',
          type: 'Partial<ChartLabels>',
          description: '"Show table", "Hide table" and the keyboard hint, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Radial bars' },
    { name: 'gauge', title: 'Gauge' },
  ],
  accessibility: [
    'The chart is a `figure` named by its title. The plot is one focusable image whose name gives the title, description and a hint; the arrow keys (Home / End too) step through the rings from the outside in, and a polite live region reads each value and its percent of `max`.',
    'Every chart has a table view ("Show table") with the same values, so nothing depends on seeing colors or hovering.',
    'Identity never relies on color alone: radial bars are named at the start of each ring, a lone gauge in its middle, and several gauges get a legend with their values.',
    'Colors come from the `chart1`…`chart8` theme keys, a palette checked for color-blind separation in light and dark mode.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focuses the plot, then the table button.' },
    { keys: 'Arrow keys / Home / End', action: 'Move between rings and read them.' },
    { keys: 'Escape', action: 'Hides the tooltip.' },
  ],
  responsive:
    'The rings fit the smaller of the width and height; ring names are cut when the chart is too narrow for them.',
  platformNotes: {
    web: 'SVG in the page. Hover a ring to show its tooltip; the arrow keys work once the plot has focus.',
    ios: 'Drawn with react-native-svg. Tap a ring to show its tooltip. VoiceOver and TalkBack read the title and description, without the arrow-key hint; Show table lists every value.',
    android: 'Same as iOS.',
  },
  related: ['pie-chart', 'progress', 'meter', 'kpi-card'],
})
