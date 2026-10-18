import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Confirm Dialog',
  slug: 'confirm-dialog',
  category: 'feedback',
  description:
    'Asks the user to confirm one action, in one element. An async action keeps it open and busy until it finishes.',
  status: 'stable',
  since: '0.13.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ConfirmDialog'],
  files: ['components/confirm-dialog/ConfirmDialog.tsx', 'components/confirm-dialog/index.ts'],
  keywords: ['confirm', 'confirmation', 'are you sure', 'modal', 'destructive', 'delete', 'prompt'],
  usage: `import { Button, ConfirmDialog } from '@advui/core'

<ConfirmDialog
  trigger={<Button variant="destructive">Delete project</Button>}
  title="Delete “Atlas”?"
  description="This cannot be undone."
  confirmLabel="Delete"
  tone="destructive"
  onConfirm={async () => {
    await deleteProject()
  }}
/>`,
  parts: [
    {
      name: 'ConfirmDialog',
      description:
        'Built on Alert Dialog. Compose Alert Dialog instead when the dialog needs more content, such as a field.',
      props: [
        {
          name: 'title',
          type: 'ReactNode',
          required: true,
          description: 'The question, e.g. “Delete this project?”. Names the dialog.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'The consequences. Announced with the title.',
        },
        {
          name: 'confirmLabel',
          type: 'ReactNode',
          default: "'Confirm'",
          description: 'Label of the confirm button. Name the action, e.g. “Delete”.',
        },
        {
          name: 'cancelLabel',
          type: 'ReactNode',
          default: "'Cancel'",
          description: 'Label of the cancel button.',
        },
        {
          name: 'tone',
          type: "'default' | 'destructive'",
          options: ['default', 'destructive'],
          default: "'default'",
          description: '`destructive` gives the confirm button the destructive fill.',
        },
        {
          name: 'onConfirm',
          type: '() => void | Promise<unknown>',
          description:
            'Called when the user confirms. A returned Promise keeps the dialog open and busy: it closes when the Promise resolves and stays open when it rejects, so the user can retry. Show the error yourself, e.g. with a toast.',
        },
        {
          name: 'onCancel',
          type: '() => void',
          description: 'Called when the user cancels: Cancel, Escape or the Android back button.',
        },
        {
          name: 'trigger',
          type: 'ReactElement',
          description: 'Opens the dialog, such as a Button. Leave it out and open it with `open`.',
        },
        { name: 'open', type: 'boolean', description: 'Open state, when you control it.' },
        {
          name: 'defaultOpen',
          type: 'boolean',
          default: 'false',
          description: 'Open at first, when the dialog manages its state.',
        },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the dialog opens or closes.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  playground: {
    component: 'ConfirmDialog',
    controls: [
      { prop: 'title', type: 'text', default: 'Publish “Atlas”?' },
      { prop: 'description', type: 'text', default: 'Anyone with the link can see it.' },
      { prop: 'confirmLabel', type: 'text', default: 'Publish' },
      { prop: 'cancelLabel', type: 'text', default: 'Cancel' },
      { prop: 'tone', type: 'select', options: ['default', 'destructive'], default: 'default' },
    ],
  },
  examples: [
    { name: 'basic', title: 'Destructive confirmation' },
    {
      name: 'async',
      title: 'Waits for the action',
      description:
        'onConfirm returns a Promise, so the dialog stays open and busy until it resolves.',
    },
    {
      name: 'menu',
      title: 'Opened from a menu',
      description: 'Controlled with `open`: a menu item opens it, since the menu closes on select.',
    },
  ],
  accessibility: [
    '`role="alertdialog"` with `aria-modal`, named by the title and described by the description, so screen readers announce the whole question.',
    'Focus starts on Cancel, the safe choice, is trapped while open and returns to the trigger on close.',
    'Presses outside do nothing; Escape cancels.',
    'While an async `onConfirm` runs, the confirm button is busy (`aria-busy`) and Cancel is disabled; Escape and the Android back button do nothing until it settles.',
  ],
  keyboard: [
    { keys: 'Tab / Shift + Tab', action: 'Moves between Cancel and the confirm button.' },
    { keys: 'Enter / Space', action: 'Activates the focused button.' },
    { keys: 'Esc', action: 'Cancels and closes the dialog, unless the action is running.' },
  ],
  responsive: 'Buttons stack full-width below the sm breakpoint, with the confirm button on top.',
  platformNotes: {
    web: 'Rendered in a portal with the page scroll locked.',
    ios: 'Rendered in a native portal above navigation.',
    android: 'The back button cancels, like Escape.',
  },
  related: ['alert-dialog', 'dialog', 'loading-button'],
})
