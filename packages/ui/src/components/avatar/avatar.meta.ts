import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Avatar',
  slug: 'avatar',
  category: 'foundations',
  description: 'A profile image with an automatic initials fallback.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Avatar', 'getInitials'],
  files: ['components/avatar/Avatar.tsx', 'components/avatar/index.ts'],
  keywords: ['profile', 'user', 'picture', 'image', 'initials'],
  usage: `import { Avatar } from '@advui/core'

<Avatar src={user.photoUrl} alt={user.name} />`,
  parts: [
    {
      name: 'Avatar',
      props: [
        {
          name: 'src',
          type: 'string',
          description: 'Image URL. The fallback shows until it loads or if it fails.',
        },
        {
          name: 'alt',
          type: 'string',
          description: 'Accessible name — usually the person’s name.',
        },
        {
          name: 'fallback',
          type: 'string',
          description: 'Custom fallback text. Defaults to initials derived from `alt`.',
        },
        {
          name: 'size',
          type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
          options: ['xs', 'sm', 'md', 'lg', 'xl'],
          default: "'md'",
          description: '24–64px.',
        },
        {
          name: 'shape',
          type: "'circle' | 'square'",
          options: ['circle', 'square'],
          default: "'circle'",
          description: 'Outline shape.',
        },
      ],
      children: { accepts: ['Avatar.Image', 'Avatar.Fallback'], max: 2 },
    },
    {
      name: 'Avatar.Image',
      description: 'The picture, when you compose the avatar yourself.',
      props: [{ name: 'src', type: 'string', required: true, description: 'Image URL.' }],
      children: { accepts: 'none' },
      within: 'Avatar',
    },
    {
      name: 'Avatar.Fallback',
      description: 'Shown until the image loads, or if it fails. Holds initials or an icon.',
      props: [],
      children: { accepts: 'any' },
      within: 'Avatar',
    },
  ],
  examples: [
    { name: 'basic', title: 'Image with fallback' },
    { name: 'sizes', title: 'Sizes' },
    { name: 'group', title: 'Stacked group' },
  ],
  playground: {
    component: 'Avatar',
    staticProps: { alt: 'Ada Lovelace' },
    controls: [
      { prop: 'size', type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md' },
      { prop: 'shape', type: 'select', options: ['circle', 'square'], default: 'circle' },
    ],
  },
  accessibility: [
    'The avatar is a single `img` whose name is `alt`; the inner image and initials are hidden to avoid double announcements.',
    'Omit `alt` (decorative) when the name is already visible next to the avatar.',
  ],
  platformNotes: {
    web: 'Uses a regular `<img>` with lazy decoding.',
    ios: 'Remote images are cached by React Native’s image loader.',
    android: 'Same as iOS; use HTTPS URLs.',
  },
  related: ['badge'],
})
