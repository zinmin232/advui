import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Progress',
  slug: 'progress',
  category: 'feedback',
  description: 'Shows how much of a task is complete.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Progress'],
  files: ['components/progress/Progress.tsx', 'components/progress/index.ts'],
  keywords: ['progress bar', 'upload', 'loading', 'percentage'],
  usage: `import { Progress } from '@advui/core'

<Progress value={uploaded} max={total} label="Uploading photos" />`,
  parts: [
    {
      name: 'Progress',
      props: [
        {
          name: 'value',
          type: 'number | null',
          description: 'Current value; `null` shows an indeterminate bar.',
        },
        { name: 'max', type: 'number', default: '100', description: 'Maximum value.' },
        { name: 'label', type: 'string', description: 'Accessible name.' },
        {
          name: 'tone',
          type: "'primary' | 'success' | 'warning' | 'error'",
          default: "'primary'",
          description: 'Indicator color.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: '4, 8 or 12px tall.',
        },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Animated upload' }],
  playground: {
    component: 'Progress',
    staticProps: { label: 'Upload progress' },
    controls: [
      { prop: 'value', type: 'number', default: 60, min: 0, max: 100, step: 5 },
      {
        prop: 'tone',
        type: 'select',
        options: ['primary', 'success', 'warning', 'error'],
        default: 'primary',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    ],
  },
  accessibility: [
    '`role="progressbar"` with `aria-valuemin/max/now` so assistive tech reads the percentage.',
    'Values are clamped between 0 and `max`.',
  ],
  related: ['spinner', 'skeleton'],
})
