import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Composed Chart',
  slug: 'composed-chart',
  category: 'charts',
  description: 'Bars and lines on one value axis, such as results against a target.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ComposedChart', 'ComposedChartProps', 'ComposedSeries'],
  files: ['components/composed-chart/ComposedChart.tsx', 'components/composed-chart/index.ts'],
  keywords: [
    'composed chart',
    'combo chart',
    'combination chart',
    'bar and line',
    'target line',
    'mixed chart',
  ],
  usage: `import { ComposedChart } from '@advui/charts'

<ComposedChart
  title="Reached against the target"
  data={[{ month: 'Jan', reached: 18, target: 20 }, { month: 'Feb', reached: 21, target: 20 }]}
  index="month"
  series={[
    { key: 'reached', label: 'Reached' },
    { key: 'target', label: 'Target', type: 'line', dashed: true },
  ]}
/>`,
  parts: [
    {
      name: 'ComposedChart',
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
          type: 'T[]',
          required: true,
          description:
            'One object per category. Its type `T` (an interface works) is inferred, and `index` and `series` must name its fields.',
        },
        {
          name: 'index',
          type: 'keyof T & string',
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
          type: "{ key: keyof T & string; label: string; type?: 'bar' | 'line'; dashed?: boolean }[]",
          required: true,
          description:
            'Numeric fields to plot, drawn as bars unless `type` is `line`; `dashed` suits a target or forecast. Colors follow this order (`chart1`…`chart8`). An array declared apart from the chart needs `as const` to keep its keys literal.',
        },
        {
          name: 'stacked',
          type: 'boolean',
          default: 'false',
          description: 'Stacks the bar series in one bar per category. Lines are never stacked.',
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
          name: 'surface',
          type: 'ColorTokens',
          token: 'color',
          default: "'background'",
          description:
            'The color behind the chart, for the ring around line markers. Use `card` inside a Card.',
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
    { name: 'basic', title: 'Bars and a target line' },
    { name: 'stacked', title: 'Stacked bars and a total' },
  ],
  accessibility: [
    'The chart is a `figure` named by its title. The plot is one focusable image whose name gives the title, description and a hint; the arrow keys (Home / End too) step through the categories, and a polite live region reads every series’ value there.',
    'Every chart has a table view ("Show table") with the same values, so nothing depends on seeing colors or hovering.',
    'Identity never relies on color alone: two or more series get a legend whose marks match the drawing (a square for bars, a line for lines), and the tooltip names each value.',
    'Colors come from the `chart1`…`chart8` theme keys, a palette checked for color-blind separation in light and dark mode.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focuses the plot, then the table button.' },
    { keys: 'Arrow keys / Home / End', action: 'Move between categories and read them.' },
    { keys: 'Escape', action: 'Hides the tooltip.' },
  ],
  responsive: 'Fills its container; category labels thin out when they would overlap.',
  platformNotes: {
    web: 'SVG in the page. Hover shows the tooltip; the arrow keys work once the plot has focus.',
    ios: 'Drawn with react-native-svg. Tap the plot to show the tooltip for that category. VoiceOver and TalkBack read the title and description, without the arrow-key hint; Show table lists every value.',
    android: 'Same as iOS.',
  },
  related: ['bar-chart', 'line-chart', 'area-chart'],
})
