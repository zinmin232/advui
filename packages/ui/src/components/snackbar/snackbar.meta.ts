import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Snackbar',
  slug: 'snackbar',
  category: 'feedback',
  description:
    'A brief message at the bottom of the screen about something the app did, with an optional action like Undo.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Snackbar'],
  files: ['components/snackbar/Snackbar.tsx', 'components/snackbar/index.ts'],
  keywords: ['toast', 'notification', 'message', 'undo', 'material', 'status'],
  usage: `import { Snackbar } from '@advui/core'

<Snackbar
  open={open}
  onOpenChange={setOpen}
  action={{ label: 'Undo', onPress: undo }}
>
  Conversation archived
</Snackbar>`,
  parts: [
    {
      name: 'Snackbar',
      props: [
        { name: 'open', type: 'boolean', required: true, description: 'Whether it is shown.' },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          required: true,
          description: 'Called when it closes by itself, from the action or the close button.',
        },
        { name: 'children', type: 'ReactNode', required: true, description: 'The message.' },
        {
          name: 'action',
          type: '{ label: string; onPress: () => void }',
          description: 'One action, such as Undo. Pressing it also closes the snackbar.',
        },
        {
          name: 'duration',
          type: 'number | null',
          default: '4000, or 8000 with an action',
          description: 'Milliseconds before it closes by itself; `null` keeps it open.',
        },
        {
          name: 'showClose',
          type: 'boolean',
          default: 'duration === null',
          description: 'Show a close (×) button.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'With Undo' },
    {
      name: 'persistent',
      title: 'Stays until dismissed',
      description: 'For states that last, like being offline.',
    },
  ],
  accessibility: [
    'The message sits in a polite live region (`role="status"`) that stays mounted, so screen readers announce it without moving focus. On iOS it is announced with `AccessibilityInfo`.',
    'The timer pauses while the pointer or keyboard focus is on the snackbar, and it runs longer when there is an action, so people have time to reach it.',
    'Actions are optional shortcuts: never put the only way to do something in a snackbar. Use `duration={null}` for messages that must stay.',
    'Colors use the inverse surface with `$inversePrimary` for the action, checked for WCAG AA contrast.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Reaches the action and the close button (it does not take focus).' },
    { keys: 'Enter / Space', action: 'Runs the focused action.' },
  ],
  responsive:
    'Full width minus 16px margins on phones; centered and at most 576px wide on larger screens.',
  platformNotes: {
    web: 'Rendered in a portal above the page, like toasts.',
    ios: 'Rendered in a native portal; keep it above the home indicator by giving the app safe-area insets.',
    android:
      'Announced through a polite live region. With `androidRipple` (on in `material()`), presses show the native ripple.',
  },
  related: ['toast', 'alert', 'alert-dialog'],
})
