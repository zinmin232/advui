import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Chip',
  slug: 'chip',
  category: 'data-display',
  description:
    'A compact element for a filter, an entered value such as a recipient, or a suggested action.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Chip'],
  files: ['components/chip/Chip.tsx', 'components/chip/index.ts'],
  keywords: ['tag', 'filter', 'pill', 'token', 'material', 'input chip', 'suggestion'],
  usage: `import { Chip } from '@advui/core'

<Chip selected={vegan} onSelectedChange={setVegan}>Vegan</Chip>   // filter chip
<Chip onRemove={() => remove(name)}>{name}</Chip>                 // input chip
<Chip icon={<CalendarIcon />} onPress={schedule}>Schedule</Chip>  // action chip`,
  parts: [
    {
      name: 'Chip',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: 'The label.' },
        { name: 'icon', type: 'ReactNode', description: 'Leading icon or avatar.' },
        {
          name: 'selected',
          type: 'boolean',
          description:
            'Makes it a filter chip that turns on and off; shows a check when on. Set it when you control the state.',
        },
        {
          name: 'defaultSelected',
          type: 'boolean',
          description: 'A filter chip that manages its own state, and whether it starts on.',
        },
        {
          name: 'onSelectedChange',
          type: '(selected: boolean) => void',
          description: 'Called when a filter chip is turned on or off.',
        },
        {
          name: 'onRemove',
          type: '() => void',
          description: 'Makes it an input chip with a remove (×) button.',
        },
        {
          name: 'removeLabel',
          type: 'string',
          default: '“Remove {children}”',
          description: 'Accessible name of the remove button.',
        },
        {
          name: 'onPress',
          type: '() => void',
          description: 'Makes it an action (assist) chip.',
        },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Not interactive.' },
      ],
      children: { accepts: 'text' },
    },
  ],
  examples: [
    { name: 'filter', title: 'Filter chips' },
    {
      name: 'input',
      title: 'Input and action chips',
      description: 'Removable recipients, and suggested actions.',
    },
  ],
  accessibility: [
    'Filter chips are toggle buttons: `aria-pressed` on web, a toggle button with a checked state on iOS and Android. Group them with a labelled `role="group"`.',
    'The selected state is shown by color and a check mark, not color alone.',
    'Input chips keep their text and a separate remove button named “Remove Ada Lovelace”, so the action is clear and has its own focus stop.',
    'Action chips are buttons. Chips without an action are plain text.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between chips and remove buttons.' },
    { keys: 'Enter / Space', action: 'Toggles a filter chip or runs the action.' },
  ],
  responsive: 'Chips keep one line; put them in a wrapping row (`flexWrap="wrap"`).',
  platformNotes: {
    web: 'Pressable chips are native `<button>` elements.',
    ios: 'Touch targets are extended to 44pt with hit slop.',
    android:
      'Filter chips are announced as toggle buttons. With `androidRipple` (on in `material()`), presses show the native ripple.',
  },
  related: ['badge', 'toggle-group', 'button'],
})
