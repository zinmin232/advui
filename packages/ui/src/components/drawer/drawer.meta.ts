import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Drawer',
  slug: 'drawer',
  category: 'overlay',
  description:
    'A modal panel that slides in from an edge of the screen, for navigation, filters or details.',
  status: 'beta',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Drawer'],
  files: ['components/drawer/Drawer.tsx', 'components/drawer/index.ts'],
  keywords: ['side panel', 'off-canvas', 'navigation drawer', 'slide over', 'side sheet'],
  usage: `import { Button, Drawer } from '@advui/core'

<Drawer>
  <Drawer.Trigger asChild>
    <Button variant="outline">Filters</Button>
  </Drawer.Trigger>
  <Drawer.Content side="right">
    <Drawer.Header>
      <Drawer.Title>Filters</Drawer.Title>
      <Drawer.Description>Narrow the product list.</Drawer.Description>
    </Drawer.Header>
    <Drawer.Body>…</Drawer.Body>
    <Drawer.Footer>
      <Drawer.Close asChild>
        <Button variant="outline">Cancel</Button>
      </Drawer.Close>
      <Button>Apply</Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer>`,
  parts: [
    {
      name: 'Drawer',
      props: [
        {
          name: 'open',
          type: 'boolean',
          description: 'Open state, when you control it.',
        },
        {
          name: 'defaultOpen',
          type: 'boolean',
          default: 'false',
          description: 'Open at first, when the drawer manages its state.',
        },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when opened or closed.',
        },
      ],
      children: { accepts: ['Drawer.Trigger', 'Drawer.Content'], max: 2 },
    },
    {
      name: 'Drawer.Trigger',
      description: 'Opens the drawer. Use `asChild` to render your Button.',
      props: [],
      children: { accepts: 'any', min: 1, max: 1 },
      within: 'Drawer',
    },
    {
      name: 'Drawer.Content',
      props: [
        {
          name: 'side',
          type: "'left' | 'right' | 'top' | 'bottom'",
          options: ['left', 'right', 'top', 'bottom'],
          default: "'right'",
          description: 'Edge the drawer is attached to.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Width of a left or right drawer ($72, $96, $128), up to 85% of the screen.',
        },
        {
          name: 'hideCloseButton',
          type: 'boolean',
          default: 'false',
          description: 'Hide the × button.',
        },
      ],
      children: { accepts: 'any' },
      within: 'Drawer',
    },
    {
      name: 'Drawer.Body',
      description: 'Scrolls long content between the header and the footer.',
      props: [],
      children: { accepts: 'any' },
      within: 'Drawer.Content',
    },
    {
      name: 'Drawer.Header',
      description: 'Stacks the title and description at the top.',
      props: [],
      children: { accepts: 'any' },
    },
    {
      name: 'Drawer.Footer',
      description: 'A row of actions at the bottom.',
      props: [],
      children: { accepts: 'any' },
    },
    {
      name: 'Drawer.Title',
      description: 'Names the drawer for screen readers.',
      props: [],
      children: { accepts: 'text' },
      within: 'Drawer.Content',
    },
    {
      name: 'Drawer.Description',
      description: 'Describes the drawer; read with the title.',
      props: [],
      children: { accepts: 'text' },
      within: 'Drawer.Content',
    },
    {
      name: 'Drawer.Close',
      description: 'Closes the drawer. Use `asChild` to render your Button.',
      props: [{ name: 'asChild', type: 'boolean', description: 'Wrap your own Button.' }],
      children: { accepts: 'any', min: 1, max: 1 },
      within: 'Drawer.Content',
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Navigation drawer',
      description: 'From the left, with a Menu that closes the drawer on choice.',
    },
    {
      name: 'filters',
      title: 'Filters',
      description: 'From the right, with a scrolling body and footer actions.',
    },
  ],
  accessibility: [
    '`role="dialog"` + `aria-modal`, labelled by `Drawer.Title` and described by `Drawer.Description`.',
    'Focus moves into the drawer on open, is trapped while open, and returns to the trigger on close.',
    'Escape, the overlay and the × button (labelled “Close”) close it.',
    'Drawer.Close keeps its child’s visible text as the accessible name.',
  ],
  keyboard: [
    { keys: 'Tab / Shift+Tab', action: 'Cycles focus inside the drawer.' },
    { keys: 'Escape', action: 'Closes the drawer.' },
  ],
  responsive:
    'Left and right drawers are at most 85% of the screen width, so the page stays visible behind them; top and bottom drawers fit their content up to 85% of the height. Footer buttons stack below `sm`.',
  platformNotes: {
    web: 'Rendered in a portal with the page scroll locked. Slides in unless reduced motion is on.',
    ios: 'Rendered in a native portal. Padding on the attached edges includes the safe-area insets passed to UniversalProvider.',
    android: 'The hardware back button closes the drawer.',
  },
  related: ['sheet', 'dialog', 'menu'],
})
