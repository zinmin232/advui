import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Hover Card',
  slug: 'hover-card',
  category: 'overlay',
  description:
    'A preview card that appears when a pointer rests on a link or keyboard focus reaches it.',
  status: 'beta',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['HoverCard'],
  files: [
    'components/hover-card/HoverCard.tsx',
    'components/hover-card/HoverCard.native.tsx',
    'components/hover-card/types.ts',
    'components/hover-card/index.ts',
  ],
  keywords: ['preview', 'profile card', 'link preview', 'hovercard', 'peek'],
  usage: `import { HoverCard, Text } from '@advui/core'

<HoverCard>
  <HoverCard.Trigger>
    <Text render="a" {...{ href: '/ada' }}>@ada</Text>
  </HoverCard.Trigger>
  <HoverCard.Content>
    <Text>Ada Lovelace — writes the first algorithms.</Text>
  </HoverCard.Content>
</HoverCard>`,
  parts: [
    {
      name: 'HoverCard',
      props: [
        { name: 'open', type: 'boolean', description: 'Open state.' },
        { name: 'defaultOpen', type: 'boolean', description: 'Starting `open` when uncontrolled.' },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the card opens or closes.',
        },
        {
          name: 'openDelay',
          type: 'number',
          default: '700',
          description: 'Delay before opening on hover, in ms.',
        },
        {
          name: 'closeDelay',
          type: 'number',
          default: '300',
          description: 'Delay before closing once the pointer leaves, in ms.',
        },
        {
          name: 'side',
          type: "'top' | 'right' | 'bottom' | 'left'",
          options: ['top', 'right', 'bottom', 'left'],
          default: "'bottom'",
          description: 'Side of the trigger to open on.',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end'",
          options: ['start', 'center', 'end'],
          default: "'center'",
          description: 'Alignment along that side.',
        },
      ],
      children: { accepts: ['HoverCard.Trigger', 'HoverCard.Content'], max: 2 },
    },
    {
      name: 'HoverCard.Trigger',
      props: [
        {
          name: 'children',
          type: 'ReactElement',
          required: true,
          description: 'One focusable element, usually a link to the full page.',
        },
      ],
      children: { accepts: 'any', min: 1, max: 1 },
      within: 'HoverCard',
    },
    {
      name: 'HoverCard.Content',
      description: 'Takes View props to style the card; its width defaults to `$72`.',
      props: [],
      children: { accepts: 'any' },
      within: 'HoverCard',
    },
  ],
  examples: [{ name: 'basic', title: 'Profile preview' }],
  accessibility: [
    'The card is extra: everything in it must also be reachable by following the link, because touch screens have no hover and focus never moves into the card.',
    'The trigger stays a plain link (no `aria-expanded`); while the card is open it describes the link (`aria-describedby`), so screen readers read it after the link name.',
    'Keyboard focus on the trigger opens the card, and Escape closes it without moving focus (WCAG 1.4.13).',
    'The card stays open while the pointer moves into it, so its text can be selected.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Focusing the trigger opens the card; moving on closes it.' },
    { keys: 'Esc', action: 'Closes the card.' },
  ],
  responsive: 'The card flips to stay inside the viewport.',
  platformNotes: {
    web: 'Opens on hover after `openDelay` and on keyboard focus; a click follows the link.',
    ios: 'Not rendered — touch has no hover and a press follows the link. Only the trigger is shown.',
    android: 'Same as iOS.',
  },
  related: ['tooltip', 'popover', 'avatar'],
})
