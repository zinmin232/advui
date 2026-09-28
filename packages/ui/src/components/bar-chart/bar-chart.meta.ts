import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Bar Chart',
  slug: 'bar-chart',
  category: 'charts',
  description: 'Compares values across categories as columns or bars, grouped or stacked.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['BarChart', 'BarChartProps'],
  files: ['components/bar-chart/BarChart.tsx', 'components/bar-chart/index.ts'],
  keywords: ['bar chart', 'column chart', 'histogram', 'stacked bar', 'grouped bar', 'compare'],
  usage: `import { BarChart } from '@advui/core'

<BarChart
  title="People reached by state"
  data={[{ state: 'Kachin', reached: 182000 }, { state: 'Shan', reached: 246000 }]}
  index="state"
  series={[{ key: 'reached', label: 'People reached' }]}
/>`,
  parts: [
    {
      name: 'BarChart',
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
          type: 'Record<string, unknown>[]',
          required: true,
          description: 'One object per category or x position.',
        },
        {
          name: 'index',
          type: 'string',
          required: true,
          description: 'Field holding each row’s label.',
        },
        {
          name: 'indexLabel',
          type: 'string',
          default: '`index`',
          description: 'Heading of the label column in the table view.',
        },
        {
          name: 'series',
          type: '{ key: string; label: string }[]',
          required: true,
          description:
            'Numeric fields to plot. Colors follow this order (`$chart1`…`$chart8`), never the values.',
        },
        {
          name: 'layout',
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: '`horizontal` bars suit long category names.',
        },
        {
          name: 'stacked',
          type: 'boolean',
          default: 'false',
          description: 'One bar per category, split by series (part-to-whole).',
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: 'Formats tooltip and table values. Axis ticks are compact (1.2K).',
        },
        {
          name: 'height',
          type: 'number',
          default: '240',
          description: 'Pixels, including the axes.',
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
    },
  ],
  examples: [
    { name: 'basic', title: 'One series' },
    { name: 'grouped', title: 'Grouped' },
    { name: 'stacked', title: 'Stacked, horizontal' },
  ],
  accessibility: [
    'The chart is a `figure` named by its title. The plot is one focusable image whose name gives the title, description and a hint; the arrow keys (Home / End too) step through the values, which a polite live region reads out.',
    'Every chart has a table view ("Show table") with the same values, so nothing depends on seeing colors or hovering.',
    'Identity never relies on color alone: two or more series get a legend, and the tooltip names each value.',
    'Colors come from the `$chart1`…`$chart8` theme keys, a palette checked for color-blind separation in light and dark mode.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focuses the plot, then the table button.' },
    { keys: 'Arrow keys / Home / End', action: 'Move between values and read them.' },
    { keys: 'Escape', action: 'Hides the tooltip.' },
  ],
  responsive:
    'Fills its container; category labels thin out when they would overlap. Use `horizontal` for long names on phones.',
  platformNotes: {
    web: 'SVG in the page. Hover shows the tooltip; the arrow keys work once the plot has focus.',
    ios: 'Drawn with react-native-svg. Tap the plot to show the tooltip for that point.',
    android: 'Same as iOS.',
  },
  related: ['line-chart', 'pie-chart', 'table', 'kpi-card'],
})
