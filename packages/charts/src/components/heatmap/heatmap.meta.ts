import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Heatmap',
  slug: 'heatmap',
  category: 'charts',
  description:
    'Values across two categories as a grid of shaded cells, darker for more: by place and sector, or by day and hour.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Heatmap', 'HeatmapProps', 'HeatmapColor'],
  files: ['components/heatmap/Heatmap.tsx', 'components/heatmap/index.ts'],
  keywords: ['heatmap', 'heat map', 'matrix', 'grid chart', 'density', 'punch card'],
  usage: `import { Heatmap } from '@advui/charts'

<Heatmap
  title="Active projects"
  data={[{ state: 'Kachin', health: 34, wash: 21 }, { state: 'Shan', health: 41, wash: 28 }]}
  index="state"
  series={[{ key: 'health', label: 'Health' }, { key: 'wash', label: 'WASH' }]}
/>`,
  parts: [
    {
      name: 'Heatmap',
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
            'One object per row of cells. Its type `T` (an interface works) is inferred, and `index` and `series` must name its fields. A missing value leaves its cell gray.',
        },
        {
          name: 'index',
          type: 'keyof T & string',
          required: true,
          description: 'Field holding each row’s name.',
        },
        {
          name: 'indexLabel',
          type: 'string',
          default: '`index`',
          description: 'Heading of the row-name column in the table view.',
        },
        {
          name: 'series',
          type: '{ key: keyof T & string; label: string }[]',
          required: true,
          description:
            'Numeric fields, one column of cells each. An array declared apart from the chart needs `as const` to keep its keys literal.',
        },
        {
          name: 'color',
          type: "'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5' | 'chart6' | 'chart7' | 'chart8'",
          options: ['chart1', 'chart2', 'chart3', 'chart4', 'chart5', 'chart6', 'chart7', 'chart8'],
          default: "'chart1'",
          description:
            'The palette color whose shades fill the cells. They step at round values (0–10, 10–20…), four to six of them, from the smallest value or zero to the largest. On a diverging scale, the color above `midpoint`.',
        },
        {
          name: 'scale',
          type: "'sequential' | 'diverging'",
          options: ['sequential', 'diverging'],
          default: "'sequential'",
          description:
            '`diverging` shades `negativeColor` below `midpoint` and `color` above it, darker further away, in two to four round steps on each side: for changes, or values around a target.',
        },
        {
          name: 'midpoint',
          type: 'number',
          default: '0',
          description: 'Diverging: the value where the two colors meet. It takes the color above it.',
        },
        {
          name: 'negativeColor',
          type: "'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5' | 'chart6' | 'chart7' | 'chart8'",
          options: ['chart1', 'chart2', 'chart3', 'chart4', 'chart5', 'chart6', 'chart7', 'chart8'],
          default: "'chart2'",
          description:
            'Diverging: the palette color below `midpoint`. `chart1` and `chart2` stay apart for color-blind readers.',
        },
        {
          name: 'text',
          type: '{ noData }',
          description: 'The legend entry for empty cells ("No data"), for translation.',
        },
        {
          name: 'valueFormatter',
          type: '(value: number) => string',
          description: 'Formats tooltip and table values. Legend ranges are compact (1.2K).',
        },
        {
          name: 'height',
          type: 'number',
          min: 0,
          description: 'Pixels. By default 32 per row, plus the column labels.',
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
    { name: 'basic', title: 'Places and sectors' },
    { name: 'schedule', title: 'Days and hours, with a gap' },
    { name: 'change', title: 'Change, on a diverging scale' },
  ],
  accessibility: [
    'The chart is a `figure` named by its title. The plot is one focusable image whose name gives the title, description and a hint; the arrow keys move between cells (Left and Right along a row, Up and Down along a column, Home and End to the first and last), and a polite live region reads the row, column and value.',
    'Every chart has a table view ("Show table") with the same values, so nothing depends on telling shades apart or hovering.',
    'The legend gives each shade’s range, and empty cells have their own entry, so a cell can be read without the tooltip.',
    'Shades are one palette color (`chart1`…`chart8`) at rising opacity over the background, checked in light and dark mode.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focuses the plot, then the table button.' },
    { keys: 'Left / Right arrow', action: 'Move along a row.' },
    { keys: 'Up / Down arrow', action: 'Move along a column.' },
    { keys: 'Home / End', action: 'Move to the first or last cell.' },
    { keys: 'Escape', action: 'Hides the tooltip.' },
  ],
  responsive:
    'Cells share the width; row names longer than 160px are cut, and column labels thin out when they would overlap.',
  platformNotes: {
    web: 'SVG in the page. Hover a cell to show its tooltip; the arrow keys work once the plot has focus.',
    ios: 'Drawn with react-native-svg. Tap a cell to show its tooltip. VoiceOver and TalkBack read the title and description, without the arrow-key hint; Show table lists every value.',
    android: 'Same as iOS.',
  },
  related: ['bar-chart', 'table', 'data-grid'],
})
