import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'Indicator',
  slug: 'indicator',
  category: 'foundations',
  description:
    'A dot or count pinned to the corner of an avatar, icon or button, such as unread messages or someone’s status.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Indicator'],
  files: ['components/indicator/Indicator.tsx', 'components/indicator/index.ts'],
  keywords: ['badge', 'dot', 'notification', 'count', 'unread', 'status', 'presence', 'online'],
  usage: `import { Indicator } from '@advui/core'

<Indicator tone="success" placement="bottom-end" overlap="circle" label="Online">
  <Avatar src={user.photoUrl} alt={user.name} />
</Indicator>

<IconButton
  aria-label="Notifications, 3 unread"
  icon={
    <Indicator count={3} size="sm">
      <BellIcon />
    </Indicator>
  }
/>`,
  parts: [
    {
      name: 'Indicator',
      description:
        'Wraps what it is pinned to and keeps its place in the layout. Takes View props, such as a margin.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'What it is pinned to: an avatar, an icon or a button.',
        },
        {
          name: 'count',
          type: 'number',
          min: 0,
          description: 'A number to show. Without it the indicator is a dot.',
        },
        {
          name: 'max',
          type: 'number',
          default: '99',
          min: 1,
          description: 'Counts above it show as `99+`.',
        },
        {
          name: 'showZero',
          type: 'boolean',
          default: 'false',
          description: 'Show a count of 0, which otherwise hides the indicator.',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'What screen readers read, such as “3 unread messages” or “Online”. Leave it out when the name of what it is pinned to already says it.',
        },
        {
          name: 'visible',
          type: 'boolean',
          default: 'true',
          description: 'False hides the indicator and keeps the children in place.',
        },
        {
          name: 'tone',
          type: "'primary' | 'success' | 'warning' | 'error'",
          options: ['primary', 'success', 'warning', 'error'],
          default: "'primary'",
          description: 'Fill color. Counts use the matching foreground.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          options: ['sm', 'md'],
          default: "'md'",
          description: 'Dots of 8 or 10px and counts 16 or 20px tall, inside a 2px ring.',
        },
        {
          name: 'placement',
          type: "'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'",
          options: ['top-end', 'top-start', 'bottom-end', 'bottom-start'],
          default: "'top-end'",
          description: 'The corner it is centered on. `end` is the right.',
        },
        {
          name: 'overlap',
          type: "'circle' | 'square'",
          options: ['circle', 'square'],
          default: "'square'",
          description:
            'The shape of what it is pinned to. `circle` moves it in to the circle’s edge, for round avatars.',
        },
      ],
      children: { accepts: 'any' },
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Who is online',
      description: 'Each avatar reads as its name, then “Online”. Sam is offline: no dot.',
    },
    {
      name: 'counts',
      title: 'Counts on icon buttons',
      description:
        'Each count is in its button’s name. Press Notifications to mark them read; Messages stops at 9+.',
    },
  ],
  playground: {
    component: 'Indicator',
    staticProps: { label: 'Online' },
    controls: [
      {
        prop: 'tone',
        type: 'select',
        options: ['primary', 'success', 'warning', 'error'],
        default: 'primary',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md'], default: 'md' },
      {
        prop: 'placement',
        type: 'select',
        options: ['top-end', 'top-start', 'bottom-end', 'bottom-start'],
        default: 'top-end',
      },
      { prop: 'overlap', type: 'select', options: ['circle', 'square'], default: 'square' },
      { prop: 'visible', type: 'boolean', default: true },
    ],
  },
  accessibility: [
    'The dot or count is hidden from screen readers, so “99+” is never read. `label` is read instead, as hidden text after the children: an avatar reads as its name, then “Online”.',
    'On a button, put the count in the button’s name (`aria-label="Notifications, 3 unread"`) and leave out `label`: the name replaces everything inside the button.',
    'Color alone does not say what a dot means (WCAG 1.4.1). A dot that is there or not, such as Online, is fine; when tones tell statuses apart, show the status as text too.',
    'A new count is not announced. When it needs attention, show a toast, or call `AccessibilityInfo.announceForAccessibility` on iOS and Android.',
    'The mark takes no presses or clicks, so it never blocks the corner of a button.',
  ],
  platformNotes: {
    web: 'Spans throughout, so it fits inside buttons and links. The mark is centered on a zero-size point at the corner by flex layout, with no transform.',
    ios: 'The same layout through Yoga. The label is a separate VoiceOver stop after the child.',
    android:
      'Same as iOS; the label keeps a trace of opacity, so TalkBack finds it. With `androidRipple` a button clips its content for the ripple, so keep counts on its icon short with `max`.',
  },
  related: ['badge', 'avatar', 'icon-button', 'visually-hidden'],
})
