import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Alert Dialog',
  slug: 'alert-dialog',
  category: 'feedback',
  description:
    'Interrupts the user to confirm an important or destructive action before it happens.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['AlertDialog'],
  files: ['components/alert-dialog/AlertDialog.tsx', 'components/alert-dialog/index.ts'],
  keywords: ['confirm', 'confirmation', 'modal', 'destructive', 'delete', 'warning'],
  usage: `import { AlertDialog, Button } from '@advui/core'

<AlertDialog>
  <AlertDialog.Trigger asChild>
    <Button variant="destructive">Delete project</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete “Atlas”?</AlertDialog.Title>
      <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel asChild>
        <Button variant="outline">Cancel</Button>
      </AlertDialog.Cancel>
      <AlertDialog.Action asChild>
        <Button variant="destructive" onPress={deleteProject}>Delete</Button>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog>`,
  parts: [
    {
      name: 'AlertDialog',
      props: [
        { name: 'open / defaultOpen', type: 'boolean', description: 'Open state.' },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the dialog opens or closes.',
        },
      ],
    },
    {
      name: 'AlertDialog.Trigger',
      description: 'Opens the dialog. Use `asChild` to render your Button.',
      props: [],
    },
    {
      name: 'AlertDialog.Content',
      props: [
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg' | 'xl'",
          default: "'sm'",
          description: 'Max width.',
        },
      ],
    },
    {
      name: 'AlertDialog.Title',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'The question, e.g. “Delete this project?”. Names the dialog.',
        },
      ],
    },
    {
      name: 'AlertDialog.Description',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'The consequences. Announced with the title.',
        },
      ],
    },
    {
      name: 'AlertDialog.Cancel',
      description: 'Closes without acting. Receives focus when the dialog opens.',
      props: [{ name: 'asChild', type: 'boolean', description: 'Wrap your own Button.' }],
    },
    {
      name: 'AlertDialog.Action',
      description:
        'Confirms and closes. For work that takes time, use a plain Button and close when it finishes.',
      props: [{ name: 'asChild', type: 'boolean', description: 'Wrap your own Button.' }],
    },
    { name: 'AlertDialog.Header / Footer', props: [] },
  ],
  examples: [
    { name: 'basic', title: 'Destructive confirmation' },
    {
      name: 'async',
      title: 'Waits for the action',
      description: 'Stays open and busy until the request finishes.',
    },
  ],
  accessibility: [
    '`role="alertdialog"` with `aria-modal`, named by the Title and described by the Description, so screen readers announce the whole question.',
    'Focus starts on Cancel, the safe choice, is trapped while open and returns to the trigger on close.',
    'Presses outside do nothing; Escape cancels.',
    'Cancel and Action keep their visible text as the accessible name.',
  ],
  keyboard: [
    { keys: 'Tab / Shift + Tab', action: 'Moves between Cancel and the action.' },
    { keys: 'Enter / Space', action: 'Activates the focused button.' },
    { keys: 'Esc', action: 'Cancels and closes the dialog.' },
  ],
  responsive: 'Buttons stack full-width below the sm breakpoint, with the action on top.',
  platformNotes: {
    web: 'Rendered in a portal with the page scroll locked.',
    ios: 'Rendered in a native portal above navigation.',
    android: 'The back button cancels, like Escape.',
  },
  related: ['dialog', 'sheet', 'toast'],
})
