import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Icon Button',
  slug: 'icon-button',
  category: 'buttons',
  description: 'A square, icon-only button for compact toolbars and headers.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['IconButton'],
  files: ['components/icon-button/IconButton.tsx', 'components/icon-button/index.ts'],
  keywords: ['toolbar', 'icon', 'action'],
  usage: `import { IconButton } from '@adv-ui/core'
import { SearchIcon } from '@adv-ui/icons'

<IconButton aria-label="Search" icon={<SearchIcon />} />`,
  parts: [
    {
      name: 'IconButton',
      description: 'Accepts every Button prop except label/icon props.',
      props: [
        { name: 'icon', type: 'ReactElement', required: true, description: 'The icon to render.' },
        {
          name: 'aria-label',
          type: 'string',
          required: true,
          description: 'Accessible name — required because there is no visible label.',
        },
        {
          name: 'variant',
          type: 'ButtonVariant',
          default: "'ghost'",
          description: 'Same variants as Button.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: '32, 40 or 48px square.',
        },
        { name: 'circular', type: 'boolean', default: 'false', description: 'Fully rounded.' },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'variants', title: 'Variants' },
    { name: 'sizes', title: 'Sizes' },
  ],
  playground: {
    component: 'IconButton',
    staticProps: { 'aria-label': 'Settings' },
    controls: [
      {
        prop: 'variant',
        type: 'select',
        options: ['ghost', 'outline', 'secondary', 'default', 'destructive'],
        default: 'ghost',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'circular', type: 'boolean', default: false },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    '`aria-label` is required by the types so every icon button has an accessible name.',
    'Wrap in a Tooltip to show the same label visually on hover/focus.',
    'Touch targets are extended to 44pt on native via `hitSlop`.',
  ],
  keyboard: [{ keys: 'Enter / Space', action: 'Activates the button.' }],
  platformNotes: {
    web: 'Renders a native `<button>`.',
    ios: 'Use `size="lg"` in navigation bars for comfortable tapping.',
    android: 'Ripple is not emulated; press feedback uses the pressed background.',
  },
  related: ['button', 'tooltip'],
})
