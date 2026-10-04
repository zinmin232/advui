import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Resizable Panel',
  slug: 'resizable-panel',
  category: 'advanced',
  description:
    'Panels side by side or stacked, with handles to drag, or move with the arrow keys, to resize them.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Resizable',
    'ResizableProps',
    'ResizablePanelProps',
    'ResizableHandleProps',
    'ResizableDirection',
    'ResizableLabels',
    'resizePanels',
  ],
  files: ['components/resizable-panel/ResizablePanel.tsx', 'components/resizable-panel/index.ts'],
  keywords: ['resizable', 'split view', 'splitter', 'panes', 'panel group', 'drag to resize'],
  usage: `import { Resizable } from '@advui/core'

<Resizable height={320}>
  <Resizable.Panel defaultSize={30} minSize={20}>…</Resizable.Panel>
  <Resizable.Handle withHandle aria-label="Resize sidebar" />
  <Resizable.Panel>…</Resizable.Panel>
</Resizable>`,
  parts: [
    {
      name: 'Resizable',
      description: 'The group. Also takes View props; give it a height for side-by-side panels.',
      props: [
        {
          name: 'direction',
          type: "'horizontal' | 'vertical'",
          options: ['horizontal', 'vertical'],
          default: "'horizontal'",
          description: 'Side by side, or stacked.',
        },
        {
          name: 'sizes',
          type: 'number[]',
          description: 'Panel sizes in percent (controlled). They add up to 100.',
        },
        {
          name: 'onSizesChange',
          type: '(sizes: number[]) => void',
          description: 'Called with the new `sizes`.',
        },
        {
          name: 'onSizesCommit',
          type: '(sizes: number[]) => void',
          description: 'A drag or key press ended. Save the layout here.',
        },
        {
          name: 'keyboardStep',
          type: 'number',
          default: '5',
          min: 1,
          description: 'Percent moved by one arrow key press.',
        },
        {
          name: 'labels',
          type: 'Partial<ResizableLabels>',
          description: 'Default handle name ("Resize"), for translation.',
        },
      ],
      children: { accepts: ['Resizable.Panel', 'Resizable.Handle'] },
    },
    {
      name: 'Resizable.Panel',
      description: 'Also takes View props.',
      props: [
        {
          name: 'defaultSize',
          type: 'number',
          description: 'Starting size in percent. Default: an equal share of what is left.',
        },
        {
          name: 'minSize',
          type: 'number',
          min: 0,
          max: 100,
          description: 'Smallest size, in percent of the group.',
        },
        {
          name: 'maxSize',
          type: 'number',
          min: 0,
          max: 100,
          description: 'Largest size, in percent of the group.',
        },
        {
          name: 'collapsible',
          type: 'boolean',
          default: 'false',
          description:
            'Dragging below half of `minSize` closes it; Enter on the handle closes and reopens it.',
        },
        {
          name: 'collapsedSize',
          type: 'number',
          default: '0',
          description: 'Size when collapsed, in percent.',
        },
      ],
      children: { accepts: 'any' },
      parents: ['Resizable'],
    },
    {
      name: 'Resizable.Handle',
      description: 'Place one between each pair of panels.',
      props: [
        {
          name: 'aria-label',
          type: 'string',
          description: 'Say what it resizes: "Resize sidebar".',
        },
        {
          name: 'withHandle',
          type: 'boolean',
          default: 'false',
          description: 'Shows a grip on the line.',
        },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Fixes the sizes.' },
      ],
      children: { accepts: 'none' },
      parents: ['Resizable'],
    },
  ],
  examples: [
    { name: 'basic', title: 'Side by side' },
    { name: 'vertical', title: 'Stacked' },
    {
      name: 'collapsible',
      title: 'Three panels, collapsible',
      description:
        'Controlled sizes. Focus a handle and press Enter to close or reopen a side panel.',
    },
  ],
  accessibility: [
    'Each handle is a focusable `separator` (the WAI-ARIA window splitter) with `aria-valuenow` as the size of the panel before it, its limits, and `aria-controls` pointing at that panel.',
    'Name every handle by what it resizes ("Resize filters").',
    'On iOS and Android the handle is an adjustable element: swipe up or down with VoiceOver or TalkBack to resize, and double-tap to close or reopen a collapsible panel.',
    'A panel collapsed to 0 is hidden, so its content leaves the tab order.',
  ],
  keyboard: [
    {
      keys: 'Arrow keys',
      action: 'Move the focused handle (left/right, or up/down when stacked).',
    },
    { keys: 'Home / End', action: 'Make the panel before it as small or as large as it can be.' },
    { keys: 'Enter', action: 'Close or reopen a collapsible panel.' },
  ],
  responsive:
    'Sizes are percentages, so panels keep their shares as the window changes. On phones prefer `direction="vertical"` or a Tabs layout.',
  platformNotes: {
    web: 'Drag with a mouse, pen or finger (pointer capture), or use the keyboard.',
    ios: 'Drag the line; its touch area is wider than it looks.',
    android: 'Same as iOS.',
  },
  related: ['sidebar', 'scroll-area', 'separator'],
})
