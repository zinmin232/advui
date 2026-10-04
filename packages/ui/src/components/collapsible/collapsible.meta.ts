import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Collapsible',
  slug: 'collapsible',
  category: 'data-display',
  description:
    'Shows and hides a section with one trigger, such as "Show 3 more" or "Advanced options".',
  status: 'beta',
  since: '0.3.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Collapsible'],
  files: ['components/collapsible/Collapsible.tsx', 'components/collapsible/index.ts'],
  keywords: ['expand', 'show more', 'disclosure', 'toggle section', 'details'],
  usage: `import { Button, Collapsible } from '@advui/core'

<Collapsible>
  <Collapsible.Trigger>
    <Button variant="ghost">Advanced options</Button>
  </Collapsible.Trigger>
  <Collapsible.Content>…</Collapsible.Content>
</Collapsible>`,
  parts: [
    {
      name: 'Collapsible',
      description: 'The root; accepts layout props such as `gap`.',
      props: [
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        {
          name: 'defaultOpen',
          type: 'boolean',
          default: 'false',
          description: 'Initial state when uncontrolled.',
        },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called on toggle.' },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'The trigger does nothing and is announced as unavailable.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'Collapsible.Trigger',
      description:
        'Wraps one pressable, usually a Button, and adds `aria-expanded` and `aria-controls`.',
      props: [
        { name: 'children', type: 'ReactElement', required: true, description: 'The pressable.' },
      ],
      children: { accepts: 'any', min: 1, max: 1 },
      within: 'Collapsible',
    },
    {
      name: 'Collapsible.Content',
      description: 'The section. It stays mounted while closed, so text typed inside survives.',
      props: [],
      children: { accepts: 'any' },
      within: 'Collapsible',
    },
  ],
  examples: [
    { name: 'basic', title: 'Show more' },
    {
      name: 'settings',
      title: 'Advanced options',
      description: 'Controlled, with a chevron that follows the state.',
    },
  ],
  accessibility: [
    'The trigger keeps its own role and name, and gets `aria-expanded` and `aria-controls` pointing at the content (the disclosure pattern).',
    'Closed content is hidden from screen readers and the tab order.',
    'An icon-only trigger needs an `aria-label` that says what it reveals.',
  ],
  keyboard: [{ keys: 'Enter / Space', action: 'Toggles the section from the trigger.' }],
  platformNotes: {
    web: 'The trigger is whatever element you pass, usually a `<button>`.',
    ios: 'VoiceOver reads the trigger as expanded or collapsed.',
    android: 'TalkBack reads the trigger as expanded or collapsed.',
  },
  related: ['accordion', 'tabs'],
})
