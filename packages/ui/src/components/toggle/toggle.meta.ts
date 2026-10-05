import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Toggle',
  slug: 'toggle',
  category: 'buttons',
  description: 'A button that stays on or off, such as Bold in a text toolbar.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Toggle'],
  files: ['components/toggle/Toggle.tsx', 'components/toggle/index.ts'],
  keywords: ['toggle button', 'pressed', 'on off', 'formatting', 'toolbar', 'switch'],
  usage: `import { Toggle } from '@advui/core'
import { BoldIcon } from '@advui/icons'

<Toggle aria-label="Bold" icon={<BoldIcon />} />
<Toggle pressed={muted} onPressedChange={setMuted}>Mute</Toggle>`,
  parts: [
    {
      name: 'Toggle',
      props: [
        { name: 'pressed', type: 'boolean', description: 'On or off, when you control it.' },
        {
          name: 'defaultPressed',
          type: 'boolean',
          default: 'false',
          description: 'Starting `pressed` when uncontrolled.',
        },
        {
          name: 'onPressedChange',
          type: '(pressed: boolean) => void',
          description: 'Called when the user turns it on or off.',
        },
        {
          name: 'variant',
          type: "'default' | 'outline'",
          options: ['default', 'outline'],
          default: "'default'",
          description: 'Transparent, or with a border.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Height.',
        },
        { name: 'icon', type: 'ReactNode', description: 'Icon before the label.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Not interactive.' },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Required for icon-only toggles. Keep it the same in both states.',
        },
      ],
      children: { accepts: 'text' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Icon, text and disabled' },
    {
      name: 'controlled',
      title: 'Controlled',
      description: 'The label stays the same; the state is announced as pressed.',
    },
  ],
  playground: {
    component: 'Toggle',
    children: 'Italic',
    controls: [
      { prop: 'variant', type: 'select', options: ['default', 'outline'], default: 'default' },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'defaultPressed', type: 'boolean', default: false },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'On web it is a `<button>` with `aria-pressed`; on iOS and Android a toggle button whose state is read as on or off.',
    'Keep the label the same in both states: the pressed state already says whether it is on. Use Switch for settings that apply at once.',
    'The on state changes the background color, not only a small detail, so it is easy to see.',
    'Touch targets are at least 44pt on native.',
  ],
  keyboard: [{ keys: 'Space / Enter', action: 'Turns the toggle on or off.' }],
  platformNotes: {
    web: 'A native `<button type="button">`.',
    ios: 'VoiceOver reads “toggle button”, then on or off.',
    android:
      'TalkBack reads “toggle button”, then on or off. With `androidRipple` (on in `material()`), presses show the native ripple.',
  },
  related: ['toggle-group', 'switch', 'button'],
})
