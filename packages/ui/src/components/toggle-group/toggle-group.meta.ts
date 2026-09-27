import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Toggle Group',
  slug: 'toggle-group',
  category: 'buttons',
  description:
    'A set of toggle buttons: pick one, like text alignment, or turn on several, like bold and italic.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ToggleGroup'],
  files: ['components/toggle-group/ToggleGroup.tsx', 'components/toggle-group/index.ts'],
  keywords: ['segmented control', 'button group', 'toolbar', 'radio', 'toggle', 'formatting'],
  usage: `import { ToggleGroup } from '@advui/core'

<ToggleGroup type="single" defaultValue="left" aria-label="Text alignment">
  <ToggleGroup.Item value="left" aria-label="Align left" icon={<AlignLeftIcon />} />
  <ToggleGroup.Item value="center" aria-label="Align center" icon={<AlignCenterIcon />} />
  <ToggleGroup.Item value="right" aria-label="Align right" icon={<AlignRightIcon />} />
</ToggleGroup>`,
  parts: [
    {
      name: 'ToggleGroup',
      props: [
        {
          name: 'type',
          type: "'single' | 'multiple'",
          required: true,
          description:
            '`single`: one choice at a time (it stays chosen when pressed again). `multiple`: any number on.',
        },
        {
          name: 'value / defaultValue',
          type: 'string (single) | string[] (multiple)',
          description: 'The chosen item values.',
        },
        {
          name: 'onValueChange',
          type: '(value) => void',
          description: 'Called with a string (single) or an array (multiple).',
        },
        {
          name: 'variant',
          type: "'default' | 'outline'",
          default: "'default'",
          description: 'Applies to every item.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Applies to every item.',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          default: "'horizontal'",
          description: 'Layout direction.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables every item.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the group for screen readers, e.g. “Text alignment”.',
        },
      ],
    },
    {
      name: 'ToggleGroup.Item',
      props: [
        { name: 'value', type: 'string', required: true, description: 'Unique value.' },
        { name: 'icon', type: 'ReactNode', description: 'Icon before the label.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Not selectable.' },
        { name: 'aria-label', type: 'string', description: 'Required for icon-only items.' },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Single choice' },
    {
      name: 'multiple',
      title: 'Multiple and with labels',
      description: 'Formatting buttons that combine, and a view switcher with text.',
    },
  ],
  accessibility: [
    '`type="single"` is a `radiogroup` of `radio` items with `aria-checked`, so screen readers say “1 of 3, selected”.',
    '`type="multiple"` is a `group` of toggle buttons with `aria-pressed`.',
    'Name the group with `aria-label` and every icon-only item with its own `aria-label`.',
    'On iOS and Android items are radio buttons or toggle buttons with a checked state, and touch targets are at least 44pt.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves focus into the group (to the chosen item) and out again.' },
    {
      keys: 'Arrow keys',
      action: 'Move between items; in a single-choice group they also choose.',
    },
    { keys: 'Home / End', action: 'First / last item.' },
    { keys: 'Space / Enter', action: 'Turns the focused item on or off.' },
  ],
  responsive: 'Items wrap to the next line when there is not enough room.',
  platformNotes: {
    web: 'One Tab stop for the whole group (roving tabindex).',
    ios: 'VoiceOver reads each item as a radio button or toggle button.',
    android:
      'TalkBack reads each item as a radio button or toggle button. With `androidRipple` (on in `material()`), presses show the native ripple.',
  },
  related: ['toggle', 'radio-group', 'tabs'],
})
