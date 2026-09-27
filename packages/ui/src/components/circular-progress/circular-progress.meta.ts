import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Circular Progress',
  slug: 'circular-progress',
  category: 'feedback',
  description:
    'A ring that fills as a task completes, for tight spaces and dashboards. Without a value it spins.',
  status: 'beta',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['CircularProgress'],
  files: [
    'components/circular-progress/CircularProgress.tsx',
    'components/circular-progress/CircularProgress.native.tsx',
    'components/circular-progress/geometry.ts',
    'components/circular-progress/index.ts',
  ],
  keywords: ['progress ring', 'radial', 'donut', 'loading', 'percentage', 'gauge'],
  usage: `import { CircularProgress } from '@advui/core'

<CircularProgress value={used} max={quota} label="Storage used" showValue />`,
  parts: [
    {
      name: 'CircularProgress',
      props: [
        {
          name: 'value',
          type: 'number | null',
          description: 'Current value; `null` shows a spinning, indeterminate ring.',
        },
        { name: 'max', type: 'number', default: '100', description: 'Maximum value.' },
        { name: 'label', type: 'string', description: 'Accessible name.' },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: '24, 40 or 64px across.',
        },
        {
          name: 'tone',
          type: "'primary' | 'success' | 'warning' | 'error'",
          default: "'primary'",
          description: 'Ring color.',
        },
        {
          name: 'showValue',
          type: 'boolean',
          default: 'false',
          description: 'Show the percentage in the middle (`md` and `lg`).',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Storage used' },
    {
      name: 'sizes',
      title: 'Sizes and indeterminate',
      description: 'Without a value the ring spins, for work of unknown length.',
    },
  ],
  playground: {
    component: 'CircularProgress',
    staticProps: { label: 'Upload progress' },
    controls: [
      { prop: 'value', type: 'number', default: 60, min: 0, max: 100, step: 5 },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'lg' },
      {
        prop: 'tone',
        type: 'select',
        options: ['primary', 'success', 'warning', 'error'],
        default: 'primary',
      },
      { prop: 'showValue', type: 'boolean', default: true },
    ],
  },
  accessibility: [
    '`role="progressbar"` with `aria-valuemin/max/now`, so screen readers read the percentage; give it a `label`.',
    'The percentage text is hidden from assistive technology, which already gets the value.',
    'An indeterminate ring has no value and sets `aria-busy`. It keeps spinning, more slowly, when reduced motion is on.',
    'Colors come from the theme, and the ring is never the only way a state is shown: pair it with text.',
  ],
  platformNotes: {
    web: 'An inline SVG; the value animates with a CSS transition.',
    ios: 'Drawn with react-native-svg; the indeterminate ring spins on the native driver.',
    android: 'Same as iOS.',
  },
  related: ['progress', 'spinner'],
})
