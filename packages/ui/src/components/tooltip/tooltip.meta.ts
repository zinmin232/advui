import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Tooltip',
  slug: 'tooltip',
  category: 'overlay',
  description: 'A short hint shown when an element is hovered or focused.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web'],
  exports: ['Tooltip'],
  files: ['components/tooltip/Tooltip.tsx', 'components/tooltip/index.ts'],
  keywords: ['hint', 'popover', 'title', 'help'],
  usage: `import { IconButton, Tooltip } from '@advui/core'
import { TrashIcon } from '@advui/icons'

<Tooltip content="Delete file">
  <IconButton aria-label="Delete file" icon={<TrashIcon />} />
</Tooltip>`,
  parts: [
    {
      name: 'Tooltip',
      props: [
        {
          name: 'content',
          type: 'ReactNode',
          required: true,
          description: 'The hint. Keep it short.',
        },
        {
          name: 'side',
          type: "'top' | 'right' | 'bottom' | 'left'",
          default: "'top'",
          description: 'Preferred placement (flips to fit).',
        },
        { name: 'delay', type: 'number', default: '300', description: 'Hover delay in ms.' },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Render only the trigger.',
        },
        {
          name: 'open / defaultOpen / onOpenChange',
          type: 'boolean / boolean / fn',
          description: 'Control visibility.',
        },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Toolbar' }],
  accessibility: [
    'Opens on hover and keyboard focus; Escape dismisses it (WCAG 1.4.13).',
    'The trigger is described by the tooltip via `aria-describedby` while visible.',
    'Tooltips are supplementary: essential info must be visible elsewhere, and icon buttons still need `aria-label`.',
  ],
  keyboard: [
    { keys: 'Tab (focus)', action: 'Shows the tooltip.' },
    { keys: 'Escape', action: 'Hides the tooltip.' },
  ],
  platformNotes: {
    web: 'Positioned with Floating UI; flips and shifts to stay on screen.',
    ios: 'Not rendered — touch has no hover. Only the trigger is shown.',
    android: 'Not rendered — use a visible label or long-press hint instead.',
  },
  related: ['icon-button', 'popover', 'hover-card'],
})
