import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Accordion',
  slug: 'accordion',
  category: 'data-display',
  description:
    'Vertically stacked sections that expand to reveal their content, such as FAQs or grouped settings.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Accordion'],
  files: ['components/accordion/Accordion.tsx', 'components/accordion/index.ts'],
  keywords: ['collapse', 'expand', 'faq', 'disclosure', 'sections', 'details'],
  usage: `import { Accordion } from '@advui/core'

<Accordion type="single" collapsible>
  <Accordion.Item value="shipping">
    <Accordion.Trigger>How long does shipping take?</Accordion.Trigger>
    <Accordion.Content>Three to five working days.</Accordion.Content>
  </Accordion.Item>
</Accordion>`,
  parts: [
    {
      name: 'Accordion',
      props: [
        {
          name: 'type',
          type: "'single' | 'multiple'",
          required: true,
          description: 'Whether one or several sections can be open at once.',
        },
        {
          name: 'value / defaultValue',
          type: 'string (single) | string[] (multiple)',
          description: 'Open section(s).',
        },
        {
          name: 'onValueChange',
          type: '(value) => void',
          description: 'Called when sections open or close.',
        },
        {
          name: 'collapsible',
          type: 'boolean',
          default: 'false',
          description: 'Single mode: allow closing the open section.',
        },
        {
          name: 'variant',
          type: "'default' | 'card'",
          default: "'default'",
          description: 'Divided list or bordered surface.',
        },
        { name: 'disabled', type: 'boolean', description: 'Disable every section.' },
      ],
    },
    {
      name: 'Accordion.Item',
      props: [
        { name: 'value', type: 'string', required: true, description: 'Section id.' },
        { name: 'disabled', type: 'boolean', description: 'Prevent opening this section.' },
      ],
    },
    {
      name: 'Accordion.Trigger',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'Section title. Strings are styled for you.',
        },
        {
          name: 'level',
          type: '1 | 2 | 3 | 4 | 5 | 6',
          default: '3',
          description: 'Heading level around the trigger on web; match your page outline.',
        },
      ],
    },
    {
      name: 'Accordion.Content',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'Section body. Strings are styled for you.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'FAQ (single, collapsible)' },
    {
      name: 'card',
      title: 'Card (multiple, disabled item)',
      description: 'Several sections can be open; rich triggers and content.',
    },
  ],
  accessibility: [
    'WAI-ARIA accordion: each trigger is a button with `aria-expanded` inside a heading, and each panel is a `region` labelled by its trigger.',
    'Arrow keys move between triggers; disabled sections are skipped by the pointer and announced as disabled.',
    'The open/close animation is skipped when the user prefers reduced motion.',
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Opens or closes the focused section.' },
    { keys: '↓ / ↑', action: 'Moves focus to the next / previous trigger.' },
    { keys: 'Home / End', action: 'Moves focus to the first / last trigger.' },
  ],
  responsive: 'Fills its container; set `maxWidth` to keep long lines readable.',
  platformNotes: {
    web: 'Triggers are wrapped in `h3` headings by default (see `level`).',
    ios: 'Triggers are exposed as buttons with their expanded state; heading wrappers are web-only.',
    android: 'Same as iOS.',
  },
  related: ['collapsible', 'tabs', 'card'],
})
