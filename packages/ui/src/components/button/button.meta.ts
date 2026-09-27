import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Button',
  slug: 'button',
  category: 'buttons',
  description: 'Triggers an action or event, such as submitting a form or opening a dialog.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Button', 'ButtonText', 'ButtonFrame', 'ButtonContext'],
  files: ['components/button/Button.tsx', 'components/button/index.ts'],
  keywords: ['action', 'submit', 'cta', 'click', 'press'],
  usage: `import { Button } from '@advui/core'

export function SaveButton() {
  return <Button onPress={() => save()}>Save</Button>
}`,
  parts: [
    {
      name: 'Button',
      props: [
        {
          name: 'variant',
          type: "'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'",
          default: "'default'",
          description: 'Visual style. Use one `default` button per view for the primary action.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg' | 'icon'",
          default: "'md'",
          description: 'Height and padding.',
        },
        {
          name: 'loading',
          type: 'boolean',
          default: 'false',
          description: 'Shows a spinner, sets `aria-busy` and blocks presses.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables interaction and removes it from the tab order.',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Icon before the label. Inherits size and color.',
        },
        { name: 'iconAfter', type: 'ReactNode', description: 'Icon after the label.' },
        {
          name: 'fullWidth',
          type: 'boolean',
          default: 'false',
          description: 'Stretch to the container width.',
        },
        {
          name: 'onPress',
          type: '(event) => void',
          description: 'Called on click, tap, Enter or Space.',
        },
        {
          name: 'render',
          type: "'button' | 'a' | ReactElement",
          default: "'button'",
          description: 'Render as a different element, e.g. `<a href>` for links.',
        },
      ],
    },
    {
      name: 'Button.Text',
      description:
        'Styled label for custom compositions. Plain string children are wrapped automatically.',
      props: [],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    {
      name: 'variants',
      title: 'Variants',
      description: 'Six variants for different levels of emphasis.',
    },
    { name: 'sizes', title: 'Sizes' },
    { name: 'with-icon', title: 'With icon' },
    {
      name: 'loading',
      title: 'Loading',
      description: 'Keeps its width, announces busy state and ignores presses.',
    },
    { name: 'disabled', title: 'Disabled' },
    {
      name: 'full-width',
      title: 'Full width (mobile)',
      description: 'Common for primary actions on small screens.',
    },
  ],
  playground: {
    component: 'Button',
    children: 'Get started',
    controls: [
      {
        prop: 'variant',
        type: 'select',
        options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
        default: 'default',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'disabled', type: 'boolean', default: false },
      { prop: 'loading', type: 'boolean', default: false },
      { prop: 'fullWidth', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'Renders a native `<button type="button">` on web and a pressable with `role="button"` on iOS/Android.',
    'The visible label is the accessible name. Icons are decorative (`aria-hidden`).',
    'Disabled buttons use the native `disabled` attribute, so they are skipped by Tab and announced as dimmed.',
    'Loading sets `aria-busy="true"` and renders a `progressbar` named “Loading”.',
    'Focus is shown with a 2px ring in the theme `ring` color (≥3:1 contrast).',
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Activates the button.' },
    { keys: 'Tab', action: 'Moves focus to the next focusable element.' },
  ],
  responsive:
    'Use `fullWidth` (or `$max-sm={{ width: "100%" }}`) for primary actions on phones. Sizes can change per breakpoint via media props.',
  platformNotes: {
    web: 'Hover and press states use CSS; `render={<a href="/pricing" />}` turns it into a link.',
    ios: 'Pressable area is extended with `hitSlop` to meet the 44pt minimum touch target.',
    android:
      'Same touch-target extension as iOS (48dp recommended; use `lg` for primary actions). With `androidRipple` (on in `material()`), presses show the native ripple.',
  },
  related: ['icon-button', 'button-group', 'toggle'],
})
