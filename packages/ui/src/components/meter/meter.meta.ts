import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Meter',
  slug: 'meter',
  category: 'feedback',
  description:
    'A value inside a known range, such as storage used, battery left or a score, colored by which part of the range it is in.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Meter'],
  files: ['components/meter/Meter.tsx', 'components/meter/index.ts'],
  keywords: ['meter', 'gauge', 'level', 'usage', 'quota', 'battery', 'capacity'],
  usage: `import { Meter } from '@advui/core'

<Meter value={7.2} max={10} high={8} optimum={0} label="Storage" valueText="7.2 of 10 GB used" />`,
  parts: [
    {
      name: 'Meter',
      props: [
        {
          name: 'value',
          type: 'number',
          description: 'The measured value, clamped between `min` and `max`.',
        },
        { name: 'min', type: 'number', default: '0', description: 'Lowest value.' },
        { name: 'max', type: 'number', default: '100', description: 'Highest value.' },
        {
          name: 'low',
          type: 'number',
          description: 'Values below it are in the low range.',
        },
        {
          name: 'high',
          type: 'number',
          description: 'Values above it are in the high range.',
        },
        {
          name: 'optimum',
          type: 'number',
          description:
            'The best value. Its range is `success`, the middle next to it `warning` and the far end `error`. Defaults to the middle of the range when `low` or `high` is given.',
        },
        {
          name: 'tone',
          type: "'primary' | 'success' | 'warning' | 'error'",
          options: ['primary', 'success', 'warning', 'error'],
          description: 'Fill color, in place of the one the ranges give. `primary` without ranges.',
        },
        { name: 'label', type: 'string', description: 'Accessible name.' },
        {
          name: 'valueText',
          type: 'string',
          description:
            'What screen readers read for the value, such as “7.2 of 10 GB used”. Without it, web reads the number and iOS and Android the percentage.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: '4, 8 or 12px tall.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'ranges', title: 'Colored by range' },
  ],
  playground: {
    component: 'Meter',
    staticProps: { label: 'Battery', low: 20, high: 50, optimum: 100 },
    controls: [
      { prop: 'value', type: 'number', default: 70, min: 0, max: 100, step: 5 },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    ],
  },
  accessibility: [
    '`role="meter"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`; `valueText` becomes `aria-valuetext`.',
    'Use Meter for a measurement and Progress for work that finishes: a meter is not read as busy or loading.',
    'Color is not the only sign of a bad value: give it in `valueText` or in visible text too.',
  ],
  platformNotes: {
    android:
      'TalkBack reads a value only as text, so the meter always sends `aria-valuetext`: `valueText`, or the percentage.',
    ios: 'Sends the percentage as its value when `valueText` is not given.',
  },
  related: ['progress', 'circular-progress', 'slider'],
})
