import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Popover',
  slug: 'popover',
  category: 'overlay',
  description:
    'Rich, interactive content anchored to a trigger, such as quick settings, filters or a short form.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Popover'],
  files: ['components/popover/Popover.tsx', 'components/popover/index.ts'],
  keywords: ['popup', 'flyout', 'overlay', 'floating', 'panel', 'menu'],
  usage: `import { Button, Popover } from '@advui/core'

<Popover>
  <Popover.Trigger asChild>
    <Button variant="outline">Dimensions</Button>
  </Popover.Trigger>
  <Popover.Content>
    <Popover.Title>Dimensions</Popover.Title>
    …
  </Popover.Content>
</Popover>`,
  parts: [
    {
      name: 'Popover',
      props: [
        { name: 'open / defaultOpen', type: 'boolean', description: 'Open state.' },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the popover opens or closes.',
        },
        {
          name: 'side',
          type: "'top' | 'right' | 'bottom' | 'left'",
          default: "'bottom'",
          description: 'Where to open relative to the trigger (flips when there is no room).',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end'",
          default: "'center'",
          description: 'Alignment along that side.',
        },
        { name: 'offset', type: 'number', default: '8', description: 'Gap to the trigger in px.' },
      ],
    },
    {
      name: 'Popover.Trigger',
      props: [
        {
          name: 'asChild',
          type: 'boolean',
          description: 'Use your own element (e.g. a Button) as the trigger.',
        },
      ],
    },
    {
      name: 'Popover.Content',
      props: [
        {
          name: '…ViewProps',
          type: 'StackProps',
          description: 'Style the panel (width defaults to $72).',
        },
      ],
    },
    {
      name: 'Popover.Title',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'Heading that names the dialog for screen readers.',
        },
      ],
    },
    {
      name: 'Popover.Description',
      props: [{ name: 'children', type: 'ReactNode', description: 'Supporting text.' }],
    },
    {
      name: 'Popover.Close',
      props: [
        {
          name: 'asChild',
          type: 'boolean',
          description: 'Wrap a button that closes the popover.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Form fields' },
    {
      name: 'filter',
      title: 'Controlled filter',
      description: 'Closes itself when the user applies the selection.',
    },
  ],
  accessibility: [
    'The trigger exposes `aria-haspopup="dialog"` and `aria-expanded`; the panel is a `dialog` named by `Popover.Title`.',
    'Focus moves into the panel when it opens and returns to the trigger when it closes.',
    'Escape and a press outside close it.',
    'Prefer Dialog for tasks that must block the page, and Tooltip for short non-interactive hints.',
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Opens the popover from its trigger.' },
    { keys: 'Tab / Shift + Tab', action: 'Moves focus through the panel.' },
    { keys: 'Esc', action: 'Closes the popover and returns focus to the trigger.' },
  ],
  responsive:
    'On phones and other touch screens narrower than the md breakpoint, the content opens in a bottom sheet instead.',
  platformNotes: {
    web: 'Floating panel positioned next to the trigger; flips and stays inside the viewport.',
    ios: 'Opens as a bottom sheet that can be swiped away.',
    android: 'Opens as a bottom sheet; the back gesture closes it.',
  },
  related: ['dialog', 'tooltip', 'dropdown-menu'],
})
