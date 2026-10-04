import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Button Group',
  slug: 'button-group',
  category: 'buttons',
  description:
    'Groups related buttons, joined into one control or spaced apart, such as a split button or a set of actions.',
  status: 'beta',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ButtonGroup'],
  files: ['components/button-group/ButtonGroup.tsx', 'components/button-group/index.ts'],
  keywords: ['split button', 'segmented', 'toolbar', 'actions', 'group'],
  usage: `import { Button, ButtonGroup } from '@advui/core'

<ButtonGroup aria-label="Message actions" variant="outline">
  <Button>Archive</Button>
  <Button>Report</Button>
</ButtonGroup>`,
  parts: [
    {
      name: 'ButtonGroup',
      props: [
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the group, e.g. "Message actions". Recommended.',
        },
        {
          name: 'attached',
          type: 'boolean',
          default: 'true',
          description: 'Join the buttons into one control; `false` spaces them apart.',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          options: ['horizontal', 'vertical'],
          default: "'horizontal'",
          description: 'Lay the buttons out in a row or a column.',
        },
        {
          name: 'variant',
          type: "'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'",
          options: ['default', 'secondary', 'outline', 'ghost', 'destructive'],
          description: 'Variant for buttons that do not set their own.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          description: 'Size for buttons and icon buttons that do not set their own.',
        },
      ],
      children: { accepts: ['Button', 'IconButton', 'LoadingButton'], min: 1 },
    },
  ],
  examples: [
    { name: 'basic', title: 'Joined actions' },
    { name: 'split', title: 'Split button', description: 'A main action plus a menu of options.' },
    {
      name: 'orientation',
      title: 'Vertical and spaced',
      description: 'A vertical zoom control, and `attached={false}` for spaced actions.',
    },
  ],
  accessibility: [
    '`role="group"` with an `aria-label`, so screen readers announce the buttons as one set.',
    'Each button keeps its own name, state and place in the tab order. For one choice among options, use Toggle Group.',
    'A focused button is raised above its neighbours, so its focus ring is never covered.',
  ],
  keyboard: [{ keys: 'Tab', action: 'Moves through the buttons one by one.' }],
  platformNotes: {
    web: 'A `div` with `role="group"`.',
    ios: 'Buttons keep their own touch targets; VoiceOver reads each one.',
    android: 'Same as iOS.',
  },
  related: ['button', 'icon-button', 'toggle-group'],
})
