import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Sheet',
  slug: 'sheet',
  category: 'overlay',
  description:
    'A panel that slides up from the bottom of the screen for extra actions, details or a short form.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Sheet'],
  files: ['components/sheet/Sheet.tsx', 'components/sheet/index.ts'],
  keywords: ['bottom sheet', 'drawer', 'modal', 'action sheet', 'panel', 'overlay'],
  usage: `import { Button, Sheet } from '@advui/core'

<Sheet>
  <Sheet.Trigger>
    <Button variant="outline">Edit profile</Button>
  </Sheet.Trigger>
  <Sheet.Content>
    <Sheet.Header>
      <Sheet.Title>Edit profile</Sheet.Title>
      <Sheet.Description>Visible to your team.</Sheet.Description>
    </Sheet.Header>
    …
    <Sheet.Footer>
      <Sheet.Close>
        <Button variant="outline">Cancel</Button>
      </Sheet.Close>
      <Button>Save</Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet>`,
  parts: [
    {
      name: 'Sheet',
      props: [
        { name: 'open / defaultOpen', type: 'boolean', description: 'Open state.' },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the sheet opens or closes.',
        },
      ],
    },
    {
      name: 'Sheet.Trigger',
      props: [
        {
          name: 'children',
          type: 'ReactElement',
          required: true,
          description: 'One pressable element, usually a Button. It toggles the sheet.',
        },
      ],
    },
    {
      name: 'Sheet.Content',
      props: [
        {
          name: 'snapPoints',
          type: 'number[]',
          description:
            'Heights in % of the screen, largest first (e.g. `[85, 50]`). Default: fit the content.',
        },
        {
          name: 'dismissible',
          type: 'boolean',
          default: 'true',
          description: 'Close on swipe down and on a press outside. Escape always closes on web.',
        },
        {
          name: 'hideCloseButton',
          type: 'boolean',
          default: 'false',
          description: 'Hide the × button. Keep another way to close.',
        },
      ],
    },
    {
      name: 'Sheet.Title',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'Heading that names the sheet for screen readers.',
        },
      ],
    },
    {
      name: 'Sheet.Description',
      props: [{ name: 'children', type: 'ReactNode', description: 'Supporting text.' }],
    },
    {
      name: 'Sheet.Close',
      props: [
        {
          name: 'children',
          type: 'ReactElement',
          required: true,
          description: 'One pressable element that closes the sheet.',
        },
      ],
    },
    {
      name: 'Sheet.ScrollView',
      description: 'Scrolls long content; use it with `snapPoints`.',
      props: [],
    },
    { name: 'Sheet.Header / Footer', props: [] },
  ],
  examples: [
    { name: 'basic', title: 'Short form' },
    {
      name: 'scroll',
      title: 'Snap points and scrolling',
      description: 'Opens at 85% of the screen and snaps to half height when dragged down.',
    },
  ],
  accessibility: [
    'The panel is a modal `dialog` named by `Sheet.Title` and described by `Sheet.Description`; the trigger exposes `aria-haspopup="dialog"` and `aria-expanded`.',
    'On web focus moves into the sheet, stays inside while it is open and returns to the trigger when it closes.',
    'A labelled × button closes it, so nobody has to swipe. Escape closes it on web.',
    'On iOS the sheet is a modal view for VoiceOver, which keeps focus inside it.',
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Opens the sheet from its trigger.' },
    { keys: 'Tab / Shift + Tab', action: 'Moves focus through the sheet.' },
    { keys: 'Esc', action: 'Closes the sheet and returns focus to the trigger.' },
  ],
  responsive:
    'Full width on phones. On wider screens the content is centred and capped at $168 (672px). Footer buttons stack below the sm breakpoint.',
  platformNotes: {
    web: 'Slides up over a dimmed page and locks page scroll.',
    ios: 'Swipe down on the handle or content to close.',
    android: 'Swipe down or use the back gesture to close.',
  },
  related: ['dialog', 'popover', 'dropdown-menu'],
})
