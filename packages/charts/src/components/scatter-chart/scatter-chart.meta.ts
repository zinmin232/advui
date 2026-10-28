import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Scatter Chart',
  slug: 'scatter-chart',
  category: 'charts',
  description:
    'Shows how two measures relate, one point per row, grouped by color or sized as bubbles.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ScatterChart', 'ScatterChartProps'],
  files: ['components/scatter-chart/ScatterChart.tsx', 'components/scatter-chart/index.ts'],
  keywords: ['scatter plot', 'scatter chart', 'bubble chart', 'correlation', 'xy chart', 'points'],
  usage: `import { ScatterChart } from '@advui/charts'

<ScatterChart
  title="Budget and reach"
  data={[{ project: 'Clinics', budget: 420, reached: 38 }, { project: 'Wells', budget: 310, reached: 52 }]}
  x="budget"
  y="reached"
  index="project"
/>`,
  parts: [
    {
      name: 'ScatterChart',
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
            'One object per point. Its type `T` (an interface works) is inferred, and the field props must name its fields. Rows missing `x` or `y` are left out of the plot and keep a row in the table.',
        },
        {
          name: 'x',
          type: 'keyof T & string',
          required: true,
          description: 'Numeric field for the horizontal position.',
        },
        {
          name: 'y',
          type: 'keyof T & string',
          required: true,
          description: 'Numeric field for the vertical position.',
        },
        {
          name: 'xLabel',
          type: 'string',
          default: '`x`',
          description: 'Names the x axis in the plot, the tooltip and the table.',
        },
        {
          name: 'yLabel',
          type: 'string',
          default: '`y`',
          description: 'Names the y axis in the plot, the tooltip and the table.',
        },
        {
          name: 'index',
          type: 'keyof T & string',
          description: 'Field naming each point, for the tooltip and the table.',
        },
        {
          name: 'indexLabel',
          type: 'string',
          default: '`index`',
          description: 'Heading of the name column in the table view.',
        },
        {
          name: 'category',
          type: 'keyof T & string',
          description:
            'Field that groups the points. Each group gets a color (`chart1`…`chart8`, in order of appearance) and a legend entry.',
        },
        {
          name: 'categoryLabel',
          type: 'string',
          default: '`category`',
          description: 'Heading of the group column in the table view.',
        },
        {
          name: 'size',
          type: 'keyof T & string',
          description:
            'Numeric field that sizes each point by its area, from 4 to 20px across: a bubble chart.',
        },
        {
          name: 'sizeLabel',
          type: 'string',
          default: '`size`',
          description: 'Names the size field in the tooltip and the table.',
        },
        {
          name: 'startAtZero',
          type: 'boolean',
          default: 'false',
          description: 'Both axes start at zero instead of near the smallest value.',
        },
        {
          name: 'valueFormatter',
          type: "(value: number, field: 'x' | 'y' | 'size') => string",
          description:
            'Formats tooltip and table values; `field` says which, as the axes often have different units. Axis ticks are compact (1.2K).',
        },
        {
          name: 'height',
          type: 'number',
          default: '280',
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
            'The color behind the chart, for the ring around points. Use `card` inside a Card.',
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
    { name: 'basic', title: 'Grouped points' },
    { name: 'bubble', title: 'Bubbles' },
  ],
  accessibility: [
    'The chart is a `figure` named by its title. The plot is one focusable image whose name gives the title, description and a hint; the arrow keys (Home / End too) step through the points from left to right, and a polite live region reads each one out.',
    'Every chart has a table view ("Show table") with the same values, in the order of `data`, so nothing depends on seeing colors or hovering.',
    'Identity never relies on color alone: two or more groups get a legend, and the tooltip names each point, its group and its values.',
    'Colors come from the `chart1`…`chart8` theme keys, a palette checked for color-blind separation in light and dark mode.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focuses the plot, then the table button.' },
    { keys: 'Arrow keys / Home / End', action: 'Move between points, left to right.' },
    { keys: 'Escape', action: 'Hides the tooltip.' },
  ],
  responsive:
    'Fills its container; the axes keep their ticks and the points move closer together on narrow screens.',
  platformNotes: {
    web: 'SVG in the page. Hover near a point to show its tooltip; the arrow keys work once the plot has focus.',
    ios: 'Drawn with react-native-svg. Tap near a point to show its tooltip. VoiceOver and TalkBack read the title and description, without the arrow-key hint; Show table lists every point.',
    android: 'Same as iOS.',
  },
  related: ['line-chart', 'bar-chart', 'table'],
})
