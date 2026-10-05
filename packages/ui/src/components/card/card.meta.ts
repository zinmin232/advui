import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Card',
  slug: 'card',
  category: 'data-display',
  description: 'A surface that groups related content and actions.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Card'],
  files: ['components/card/Card.tsx', 'components/card/index.ts'],
  keywords: ['panel', 'surface', 'container', 'tile'],
  usage: `import { Button, Card } from '@advui/core'

<Card>
  <Card.Header>
    <Card.Title>Profile</Card.Title>
    <Card.Description>How others see you.</Card.Description>
  </Card.Header>
  <Card.Content>…</Card.Content>
  <Card.Footer>
    <Button>Save</Button>
  </Card.Footer>
</Card>`,
  parts: [
    {
      name: 'Card',
      props: [
        {
          name: 'variant',
          type: "'outline' | 'elevated' | 'filled' | 'ghost'",
          options: ['outline', 'elevated', 'filled', 'ghost'],
          default: "'outline'",
          description: 'Surface style.',
        },
        {
          name: 'interactive',
          type: 'boolean',
          default: 'false',
          description: 'Hover/press feedback and focus ring. Add `onPress` + `role`/label.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'Card.Header',
      description: 'Vertical stack with title and description.',
      props: [],
      children: { accepts: 'any' },
    },
    {
      name: 'Card.Title',
      description: 'Heading text (`role="heading"`).',
      props: [],
      children: { accepts: 'text' },
    },
    {
      name: 'Card.Description',
      description: 'Muted supporting text.',
      props: [],
      children: { accepts: 'text' },
    },
    {
      name: 'Card.Content',
      description: 'Main body with consistent padding.',
      props: [],
      children: { accepts: 'any' },
    },
    {
      name: 'Card.Footer',
      description: 'Row for actions.',
      props: [],
      children: { accepts: 'any' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Form card' },
    { name: 'variants', title: 'Variants' },
    { name: 'interactive', title: 'Interactive' },
  ],
  playground: {
    component: 'Card',
    controls: [
      {
        prop: 'variant',
        type: 'select',
        options: ['outline', 'elevated', 'filled', 'ghost'],
        default: 'outline',
      },
      { prop: 'interactive', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'Card.Title exposes the `heading` role so screen-reader users can jump between cards.',
    'Interactive cards need `role="button"` or `role="link"` and an accessible name; avoid nesting other buttons inside.',
  ],
  responsive: 'Padding shrinks from 24px to 16px below the `sm` breakpoint.',
  related: ['separator', 'button'],
})
