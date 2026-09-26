import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Switch',
  slug: 'switch',
  category: 'forms',
  description: 'An on/off toggle for settings that take effect immediately.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Switch'],
  files: ['components/switch/Switch.tsx', 'components/switch/index.ts'],
  keywords: ['toggle', 'on off', 'setting', 'preference'],
  usage: `import { HStack, Label, Switch } from '@adv-ui/core'

<HStack gap="$3">
  <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
  <Label htmlFor="notifications">Notifications</Label>
</HStack>`,
  parts: [
    {
      name: 'Switch',
      props: [
        {
          name: 'checked / defaultChecked',
          type: 'boolean',
          description: 'Controlled / uncontrolled state.',
        },
        {
          name: 'onCheckedChange',
          type: '(checked: boolean) => void',
          description: 'Called when toggled.',
        },
        { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '36×20 or 44×24.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents toggling.' },
      ],
    },
  ],
  examples: [{ name: 'settings', title: 'Settings list' }],
  playground: {
    component: 'Switch',
    staticProps: { 'aria-label': 'Airplane mode' },
    controls: [
      { prop: 'size', type: 'select', options: ['sm', 'md'], default: 'md' },
      { prop: 'defaultChecked', type: 'boolean', default: true },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'Exposes `role="switch"` with `aria-checked`.',
    'Use a Switch for immediate effects; use a Checkbox inside forms that need a submit.',
    'The thumb animation is removed when reduced motion is requested.',
  ],
  keyboard: [{ keys: 'Space / Enter', action: 'Toggles the switch.' }],
  platformNotes: {
    web: 'Rendered as a `<button role="switch">` with a hidden checkbox for forms.',
    ios: 'Custom drawn for visual consistency across platforms.',
    android: 'Custom drawn; TalkBack announces “switch, on/off”.',
  },
  related: ['checkbox', 'label'],
})
