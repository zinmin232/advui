import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Area Chart',
  slug: 'area-chart',
  category: 'charts',
  description:
    'A line chart with a light wash under each line, for totals and stacked parts over time.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['AreaChart', 'AreaChartProps'],
  files: ['components/area-chart/AreaChart.tsx', 'components/area-chart/index.ts'],
  keywords: ['area chart', 'stacked area', 'trend', 'volume', 'over time'],
  usage: `import { AreaChart } from '@advui/charts'

<AreaChart
  title="People displaced"
  data={[{ month: 'Mar', displaced: 1.21 }, { month: 'Apr', displaced: 1.34 }]}
  index="month"
  series={[{ key: 'displaced', label: 'Displaced (millions)' }]}
/>`,
  parts: [
    {
      name: 'AreaChart',
      description: 'Takes every Line Chart prop, plus:',
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
          name: 'stacked',
          type: 'boolean',
          default: 'false',
          description:
            'Stacks the series, so the top edge is their total. The tooltip and table keep each series’ own value.',
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
          min: 0,
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
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'One series' },
    { name: 'stacked', title: 'Stacked' },
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
  responsive: 'Fills its container; x labels thin out when they would overlap.',
  platformNotes: {
    web: 'SVG in the page. Hover shows the tooltip; the arrow keys work once the plot has focus.',
    ios: 'Drawn with react-native-svg. Tap the plot to show the tooltip for that point.',
    android: 'Same as iOS.',
  },
  related: ['line-chart', 'bar-chart', 'table'],
})
