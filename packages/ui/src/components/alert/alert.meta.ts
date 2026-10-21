import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Alert',
  slug: 'alert',
  category: 'feedback',
  description:
    'An inline message that draws attention without interrupting the task, with optional actions and a dismiss button.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Alert'],
  files: ['components/alert/Alert.tsx', 'components/alert/index.ts'],
  keywords: ['callout', 'banner', 'notice', 'message', 'warning', 'error', 'dismissible', 'tip'],
  usage: `import { Alert, Button } from '@advui/core'

<Alert
  variant="warning"
  title="Trial ending"
  description="Upgrade to keep your projects."
  actions={<Button size="sm">Upgrade</Button>}
  dismissible
/>`,
  parts: [
    {
      name: 'Alert',
      props: [
        {
          name: 'variant',
          type: "'default' | 'info' | 'success' | 'warning' | 'error' | 'destructive'",
          options: ['default', 'info', 'success', 'warning', 'error', 'destructive'],
          default: "'default'",
          description:
            'Intent: colors, icon and role. `destructive` is a solid fill for an action that cannot be undone.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Padding, spacing, icon and text size.',
        },
        {
          name: 'title',
          type: 'ReactNode',
          description:
            'Shorthand for an `Alert.Title` before the children. Text is styled; an element is rendered as it is.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Shorthand for an `Alert.Description` after the title.',
        },
        {
          name: 'icon',
          type: 'ReactNode | null',
          default: 'from `variant`',
          description: 'Custom icon, or `null` to hide it.',
        },
        {
          name: 'actions',
          type: 'ReactNode',
          description:
            'Buttons or links under the text. They wrap onto new lines when space runs out.',
        },
        {
          name: 'dismissible',
          type: 'boolean',
          default: 'false',
          description: 'Shows a button that hides the alert.',
        },
        {
          name: 'onDismiss',
          type: '() => void',
          description: 'Called once each time the dismiss button is pressed.',
        },
        {
          name: 'open',
          type: 'boolean',
          description:
            'Controls whether the alert is shown. Omit it and a dismissed alert hides itself; pass it to decide in `onDismiss`, or to show the alert again.',
        },
        {
          name: 'dismissLabel',
          type: 'string',
          default: "'Dismiss'",
          description: 'Accessible name of the dismiss button.',
        },
        {
          name: 'role',
          type: "'status' | 'alert' | 'note' | 'region'",
          options: ['status', 'alert', 'note', 'region'],
          default: 'from `variant`',
          description:
            '`alert` for `warning`, `error` and `destructive`, otherwise `status`. Pass `note` for guidance that is part of the page, not news, or `region` with an `aria-label` for a landmark.',
        },
        {
          name: 'color',
          type: 'ColorTokens',
          token: 'color',
          default: 'from `variant`',
          description:
            'Color of the title, description and icons. Pair it with a background: `primaryForeground` on `primary`.',
        },
        {
          name: 'backgroundColor',
          type: 'ColorTokens',
          token: 'color',
          default: 'from `variant`',
          description: 'Overrides the variant background.',
        },
        {
          name: 'borderColor',
          type: 'ColorTokens',
          token: 'color',
          default: 'from `variant`',
          description: 'Overrides the variant border color.',
        },
        {
          name: 'borderWidth',
          type: 'number',
          default: '1',
          min: 0,
          max: 4,
          step: 1,
          description: '`0` for a borderless alert.',
        },
        {
          name: 'borderRadius',
          type: 'RadiusTokens | number',
          token: 'radius',
          default: "'lg'",
          description: 'Corner radius.',
        },
        {
          name: 'padding',
          type: 'SpaceTokens | number',
          token: 'space',
          default: 'from `size`',
          description: 'Inner padding.',
        },
        {
          name: 'gap',
          type: 'SpaceTokens | number',
          token: 'space',
          default: 'from `size`',
          description: 'Space between the icon, the text and the dismiss button.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'Alert.Title',
      description: 'Takes its size and color from the alert.',
      props: [],
      children: { accepts: 'text' },
      within: 'Alert',
    },
    {
      name: 'Alert.Description',
      description: 'Takes its size and color from the alert.',
      props: [],
      children: { accepts: 'any' },
      within: 'Alert',
    },
  ],
  examples: [
    { name: 'variants', title: 'Variants' },
    { name: 'sizes', title: 'Sizes' },
    {
      name: 'actions',
      title: 'Actions',
      description: 'Buttons under the text; on a narrow screen they wrap.',
    },
    {
      name: 'dismissible',
      title: 'Dismissible',
      description:
        'With `open` and `onDismiss` the app decides when it shows. Without `open`, it hides itself.',
    },
    {
      name: 'custom',
      title: 'Custom icon, colors and radius',
      description:
        'Style props and `color` take precedence over the variant and size; everything else keeps their values.',
    },
    {
      name: 'composition',
      title: 'Composition',
      description: 'Compose `Alert.Title`, `Alert.Description` and any content as children.',
    },
  ],
  playground: {
    component: 'Alert',
    controls: [
      {
        prop: 'variant',
        type: 'select',
        options: ['default', 'info', 'success', 'warning', 'error', 'destructive'],
        default: 'default',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'title', type: 'text', default: 'Heads up' },
      { prop: 'description', type: 'text', default: 'You can add components using the CLI.' },
      { prop: 'icon', type: 'boolean', default: true },
      { prop: 'actions', type: 'boolean', default: false },
      { prop: 'dismissible', type: 'boolean', default: false },
      { prop: 'borderWidth', type: 'number', default: 1, min: 0, max: 4, step: 1 },
      { prop: 'backgroundColor', type: 'text', default: '' },
      { prop: 'color', type: 'text', default: '' },
      { prop: 'borderColor', type: 'text', default: '' },
      { prop: 'borderRadius', type: 'text', default: '' },
      { prop: 'padding', type: 'text', default: '' },
    ],
  },
  responsive:
    'Fills the width of its container; pass `alignSelf="flex-start"` to fit the content instead. The text wraps, the icon and dismiss button stay on the first line, and actions wrap onto new lines.',
  accessibility: [
    '`warning`, `error` and `destructive` use `role="alert"`, which screen readers announce at once; other variants use `role="status"`, announced politely. Pass `role` to change it.',
    'Only render an `alert` when something just happened. For guidance that is part of the page, pass `role="note"` so it is not announced.',
    'The dismiss button is a real button with an accessible name (`dismissLabel`), reachable with Tab and pressed with Enter or Space. It does not pass the press on to a pressable around the alert.',
    'When the alert hides, focus is not moved for you. If it held focus, move focus to a sensible place in `onDismiss`.',
    'Color is paired with an icon and text, never used alone. With `color` or `backgroundColor`, pick a surface and foreground pair from the theme.',
  ],
  platformNotes: {
    web: 'The frame carries the role, so a live region announces the text and the actions.',
    ios: 'Without actions or a dismiss button the whole alert is one accessible element. With them, the text is one element and each button is its own.',
    android:
      'Same as iOS. With `androidRipple` (on in `material()`), the dismiss button shows the native ripple.',
  },
  related: ['toast', 'snackbar', 'badge', 'empty-state'],
})
