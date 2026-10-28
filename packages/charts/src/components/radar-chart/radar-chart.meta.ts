import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Radar Chart',
  slug: 'radar-chart',
  category: 'charts',
  description:
    'Compares a few items across several measures at once, one spoke per measure from a shared zero.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['RadarChart', 'RadarChartProps'],
  files: ['components/radar-chart/RadarChart.tsx', 'components/radar-chart/index.ts'],
  keywords: ['radar chart', 'spider chart', 'web chart', 'star plot', 'polar chart', 'profile'],
  usage: `import { RadarChart } from '@advui/charts'

<RadarChart
  title="Coverage by sector"
  data={[{ sector: 'Health', kachin: 82 }, { sector: 'WASH', kachin: 71 }, { sector: 'Food', kachin: 74 }]}
  index="sector"
  series={[{ key: 'kachin', label: 'Kachin' }]}
  max={100}
/>`,
  parts: [
    {
      name: 'RadarChart',
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
            'One object per spoke, three or more. Its type `T` (an interface works) is inferred, and `index` and `series` must name its fields.',
        },
        {
          name: 'index',
          type: 'keyof T & string',
          required: true,
          description: 'Field holding each spoke’s name.',
        },
        {
          name: 'indexLabel',
          type: 'string',
          default: '`index`',
          description: 'Heading of the spoke column in the table view.',
        },
        {
          name: 'series',
          type: '{ key: keyof T & string; label: string }[]',
          required: true,
          description:
            'Numeric fields to draw, one shape each. Colors follow this order (`chart1`…`chart8`); more than three shapes get hard to read. A missing value leaves its spoke out of that shape.',
        },
        {
          name: 'max',
          type: 'number',
          min: 0,
          description:
            'The value at the edge, such as 100 for percentages. By default the largest value, rounded up. Negative values sit at the center and larger ones at the edge.',
        },
        {
          name: 'grid',
          type: "'polygon' | 'circle'",
          options: ['polygon', 'circle'],
          default: "'polygon'",
          description: 'Shape of the rings behind the data.',
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: 'Formats tooltip and table values. Ring labels are compact (1.2K).',
        },
        {
          name: 'height',
          type: 'number',
          default: '300',
          min: 0,
          description: 'Pixels, including the spoke labels.',
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
            'The color behind the chart, for the ring around markers. Use `card` inside a Card.',
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
    { name: 'basic', title: 'Two shapes' },
    { name: 'circle', title: 'Round grid' },
  ],
  accessibility: [
    'The chart is a `figure` named by its title. The plot is one focusable image whose name gives the title, description and a hint; the arrow keys (Home / End too) step through the spokes clockwise from the top, and a polite live region reads every series’ value there.',
    'Every chart has a table view ("Show table") with the same values, so nothing depends on seeing colors or hovering.',
    'Identity never relies on color alone: two or more series get a legend, and the tooltip names each value.',
    'Colors come from the `chart1`…`chart8` theme keys, a palette checked for color-blind separation in light and dark mode.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focuses the plot, then the table button.' },
    { keys: 'Arrow keys / Home / End', action: 'Move between spokes and read them.' },
    { keys: 'Escape', action: 'Hides the tooltip.' },
  ],
  responsive:
    'The web fits the smaller of the width and height, leaving room for the spoke labels; labels longer than 96px are cut.',
  platformNotes: {
    web: 'SVG in the page. Hover near a spoke to show its tooltip; the arrow keys work once the plot has focus.',
    ios: 'Drawn with react-native-svg. Tap near a spoke to show its tooltip. VoiceOver and TalkBack read the title and description, without the arrow-key hint; Show table lists every value.',
    android: 'Same as iOS.',
  },
  related: ['bar-chart', 'radial-chart', 'table'],
})
