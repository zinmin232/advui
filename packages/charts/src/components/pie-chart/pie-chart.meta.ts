import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Pie Chart',
  slug: 'pie-chart',
  category: 'charts',
  description: 'Part-to-whole at a glance, as a donut or pie with up to six slices.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['PieChart', 'PieChartProps', 'PieSlice'],
  files: ['components/pie-chart/PieChart.tsx', 'components/pie-chart/index.ts'],
  keywords: ['pie chart', 'donut chart', 'doughnut', 'share', 'proportion', 'part to whole'],
  usage: `import { PieChart } from '@advui/charts'

<PieChart
  title="Projects by sector"
  data={[{ label: 'Health', value: 412 }, { label: 'WASH', value: 298 }]}
/>`,
  parts: [
    {
      name: 'PieChart',
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
            'The parts. Zero and negative values are left out; slices are drawn largest first.',
        },
        {
          name: 'variant',
          type: "'donut' | 'pie'",
          default: "'donut'",
          description: 'A donut shows the total in the middle.',
        },
        {
          name: 'maxSlices',
          type: 'number',
          default: '6',
          description: 'More parts than this fold the smallest into "Other".',
        },
        {
          name: 'text',
          type: '{ label, value, share, other, total }',
          description: 'Table headings and the "Other" / "Total" words, for translation.',
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
    { name: 'basic', title: 'Donut' },
    { name: 'other', title: 'Pie, folding into Other' },
  ],
  accessibility: [
    'The chart is a `figure` named by its title. The plot is one focusable image whose name gives the title, description and a hint; the arrow keys (Home / End too) step through the values, which a polite live region reads out.',
    'Every chart has a table view ("Show table") with the same values, so nothing depends on seeing colors or hovering.',
    'Identity never relies on color alone: two or more series get a legend, and the tooltip names each value.',
    'Colors come from the `$chart1`…`$chart8` theme keys, a palette checked for color-blind separation in light and dark mode.',
    'The legend names every slice with its share, so the percentages are readable without the tooltip.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focuses the plot, then the table button.' },
    { keys: 'Arrow keys / Home / End', action: 'Move between values and read them.' },
    { keys: 'Escape', action: 'Hides the tooltip.' },
  ],
  responsive: 'The circle fits the smaller of the width and height.',
  platformNotes: {
    web: 'SVG in the page. Hover shows the tooltip; the arrow keys work once the plot has focus.',
    ios: 'Drawn with react-native-svg. Tap the plot to show the tooltip for that point.',
    android: 'Same as iOS.',
  },
  related: ['bar-chart', 'stat', 'table'],
})
