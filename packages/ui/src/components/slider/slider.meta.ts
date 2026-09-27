import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Slider',
  slug: 'slider',
  category: 'forms',
  description: 'Pick a number, or a range, by dragging a thumb along a track.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Slider'],
  files: ['components/slider/Slider.tsx', 'components/slider/index.ts'],
  keywords: ['range', 'volume', 'price', 'input range', 'track', 'thumb'],
  usage: `import { Slider } from '@advui/core'

<Slider aria-label="Volume" defaultValue={40} />
<Slider aria-label="Price" defaultValue={[20, 80]} />`,
  parts: [
    {
      name: 'Slider',
      props: [
        {
          name: 'value / defaultValue',
          type: 'number | number[]',
          description: 'A number for one thumb, or an array for a range.',
        },
        {
          name: 'onValueChange',
          type: '(value: number | number[]) => void',
          description: 'Called while the value changes, in the same shape you passed.',
        },
        {
          name: 'onValueCommit',
          type: '(value: number | number[]) => void',
          description: 'Called when a drag ends.',
        },
        { name: 'min', type: 'number', default: '0', description: 'Lowest value.' },
        { name: 'max', type: 'number', default: '100', description: 'Highest value.' },
        { name: 'step', type: 'number', default: '1', description: 'Increment.' },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Thumb and track size.',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          default: "'horizontal'",
          description: 'Direction of the track.',
        },
        { name: 'disabled', type: 'boolean', description: 'Prevent interaction.' },
        {
          name: 'aria-label / aria-labelledby',
          type: 'string',
          description: 'Accessible name. Required when there is no visible label.',
        },
        {
          name: 'getValueText',
          type: '(value: number) => string',
          description: 'Readable value for screen readers, e.g. a currency.',
        },
        {
          name: 'thumbLabels',
          type: 'string[]',
          description: 'Names for range thumbs. Default: “Minimum” / “Maximum”.',
        },
      ],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Single value',
      description: 'Controlled, with a visible label and value.',
    },
    { name: 'range', title: 'Range', description: 'Two thumbs with currency value text.' },
  ],
  playground: {
    component: 'Slider',
    staticProps: { 'aria-label': 'Playground slider', defaultValue: 40 },
    controls: [
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'step', type: 'number', default: 1, min: 1, max: 25, step: 1 },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'Each thumb has `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and optional `aria-valuetext`.',
    'Range thumbs are named separately (“Price, Minimum” / “Price, Maximum”).',
    'On iOS and Android, VoiceOver and TalkBack adjust the value with swipe gestures (increment / decrement actions), and thumbs have a 44pt touch target.',
    'Disabled sliders leave the tab order and are announced as disabled.',
  ],
  keyboard: [
    { keys: '← → / ↑ ↓', action: 'Decrease / increase by one step.' },
    { keys: 'Page Up / Page Down, Shift + arrow', action: 'Change by ten steps.' },
    { keys: 'Home / End', action: 'Jump to the minimum / maximum.' },
  ],
  responsive:
    'Fills its container horizontally; vertical sliders take their height from the parent.',
  platformNotes: {
    web: 'Pointer, touch and keyboard input.',
    ios: 'Drag the thumb, or swipe up / down with VoiceOver.',
    android: 'Drag the thumb, or use TalkBack volume-key / swipe adjustments.',
  },
  related: ['input', 'progress', 'switch'],
})
