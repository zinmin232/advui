import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Dialog',
  slug: 'dialog',
  category: 'overlay',
  description: 'A modal window for focused tasks that require the user’s attention.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Dialog'],
  files: [
    'components/dialog/Dialog.tsx',
    'components/dialog/styles.ts',
    'components/dialog/index.ts',
  ],
  keywords: ['modal', 'popup', 'lightbox', 'overlay'],
  usage: `import { Button, Dialog } from '@advui/core'

<Dialog>
  <Dialog.Trigger asChild>
    <Button>Edit profile</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Changes are saved to your account.</Dialog.Description>
    </Dialog.Header>
    …
    <Dialog.Footer>
      <Dialog.Close asChild>
        <Button variant="outline">Cancel</Button>
      </Dialog.Close>
      <Button>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>`,
  parts: [
    {
      name: 'Dialog',
      props: [
        {
          name: 'open / defaultOpen',
          type: 'boolean',
          description: 'Controlled / uncontrolled open state.',
        },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when opened or closed.',
        },
      ],
    },
    {
      name: 'Dialog.Trigger',
      description: 'Opens the dialog. Use `asChild` to render your Button.',
      props: [],
    },
    {
      name: 'Dialog.Content',
      props: [
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg' | 'xl'",
          default: "'md'",
          description: 'Max width.',
        },
        {
          name: 'hideCloseButton',
          type: 'boolean',
          default: 'false',
          description: 'Hide the × button.',
        },
      ],
    },
    { name: 'Dialog.Header / Footer / Title / Description / Close', props: [] },
  ],
  examples: [
    { name: 'basic', title: 'Edit form' },
    { name: 'confirm', title: 'Controlled confirmation' },
  ],
  accessibility: [
    '`role="dialog"` + `aria-modal`, labelled by `Dialog.Title` and described by `Dialog.Description`.',
    'Focus moves into the dialog on open, is trapped while open, and returns to the trigger on close.',
    'Escape and the overlay close the dialog; the × button has the label “Close”.',
    'Dialog.Close keeps its child’s visible text as the accessible name.',
  ],
  keyboard: [
    { keys: 'Tab / Shift+Tab', action: 'Cycles focus inside the dialog.' },
    { keys: 'Escape', action: 'Closes the dialog.' },
  ],
  responsive:
    'Width is 92% of the viewport up to the size cap, and footer buttons stack vertically below `sm`.',
  platformNotes: {
    web: 'Rendered in a portal with the page scroll locked.',
    ios: 'Rendered in a native portal above navigation. Consider a Sheet for long forms.',
    android: 'The hardware back button closes the dialog.',
  },
  related: ['alert-dialog', 'sheet', 'drawer'],
})
