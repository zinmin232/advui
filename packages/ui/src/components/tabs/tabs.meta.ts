import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Tabs',
  slug: 'tabs',
  category: 'navigation',
  description: 'Switch between related panels of content within the same view.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Tabs'],
  files: ['components/tabs/Tabs.tsx', 'components/tabs/index.ts'],
  keywords: ['tab bar', 'segmented', 'panels', 'sections'],
  usage: `import { Tabs } from '@advui/core'

<Tabs defaultValue="account">
  <Tabs.List aria-label="Settings">
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">…</Tabs.Content>
  <Tabs.Content value="password">…</Tabs.Content>
</Tabs>`,
  parts: [
    {
      name: 'Tabs',
      props: [
        { name: 'value', type: 'string', description: 'Active tab.' },
        {
          name: 'defaultValue',
          type: 'string',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called when the tab changes.',
        },
        {
          name: 'variant',
          type: "'pills' | 'underline'",
          options: ['pills', 'underline'],
          default: "'pills'",
          description: 'Visual style.',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          options: ['horizontal', 'vertical'],
          default: "'horizontal'",
          description: 'Arrow-key direction.',
        },
        {
          name: 'activationMode',
          type: "'automatic' | 'manual'",
          options: ['automatic', 'manual'],
          default: "'automatic'",
          description: 'Select on focus, or on Enter/Space.',
        },
      ],
      children: { accepts: ['Tabs.List', 'Tabs.Content'] },
    },
    {
      name: 'Tabs.List',
      props: [
        { name: 'loop', type: 'boolean', default: 'true', description: 'Wrap focus at the ends.' },
      ],
      children: { accepts: ['Tabs.Trigger'] },
      within: 'Tabs',
    },
    {
      name: 'Tabs.Trigger',
      props: [
        { name: 'value', type: 'string', required: true, description: 'Tab id.' },
        { name: 'icon', type: 'ReactNode', description: 'Leading icon.' },
        { name: 'disabled', type: 'boolean', description: 'Skip this tab.' },
      ],
      children: { accepts: 'text' },
      within: 'Tabs.List',
    },
    {
      name: 'Tabs.Content',
      props: [{ name: 'value', type: 'string', required: true, description: 'Matching tab id.' }],
      children: { accepts: 'any' },
      within: 'Tabs',
    },
  ],
  examples: [
    { name: 'basic', title: 'Pills' },
    { name: 'underline', title: 'Underline with icons' },
  ],
  accessibility: [
    'WAI-ARIA tabs: `tablist`, `tab` (with `aria-selected` / `aria-controls`) and `tabpanel` (`aria-labelledby`).',
    'Roving focus: only the active tab is in the tab order.',
  ],
  keyboard: [
    { keys: '← → (↑ ↓ vertical)', action: 'Moves between tabs.' },
    { keys: 'Home / End', action: 'First / last tab.' },
    { keys: 'Tab', action: 'Moves from the tab list into the active panel.' },
  ],
  responsive: 'The list scrolls horizontally when tabs overflow on small screens.',
  platformNotes: {
    web: 'Keyboard navigation follows the WAI-ARIA Authoring Practices.',
    ios: 'For app-level navigation prefer a native tab bar (expo-router Tabs).',
    android:
      'Same as iOS. With `androidRipple` (on in `material()`), presses show the native ripple.',
  },
  related: ['navigation-bar', 'toggle-group'],
})
