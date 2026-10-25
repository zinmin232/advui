import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Visually Hidden',
  slug: 'visually-hidden',
  category: 'foundations',
  description:
    'Text that screen readers read but the screen does not show, such as the rest of a link’s name or what a strikethrough means.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['VisuallyHidden'],
  files: ['components/visually-hidden/VisuallyHidden.tsx', 'components/visually-hidden/index.ts'],
  keywords: [
    'sr-only',
    'screen reader only',
    'screen reader text',
    'hidden text',
    'accessible name',
    'assistive text',
  ],
  usage: `import { VisuallyHidden } from '@advui/core'

<Link href="/pricing">
  Read more<VisuallyHidden> about pricing</VisuallyHidden>
</Link>

<Text textDecorationLine="line-through">
  <VisuallyHidden>Was </VisuallyHidden>$120
</Text>`,
  parts: [
    {
      name: 'VisuallyHidden',
      description:
        'A Text kept in a 1px box with a trace of opacity, so screen readers still find it. A `span` on web. Takes Text props, such as `role` or `aria-live`.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'The words to read. Start them with a space when they follow other text: “Read more<VisuallyHidden> about pricing</VisuallyHidden>”.',
        },
      ],
      children: { accepts: 'text' },
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Complete a link’s name',
      description:
        'Each “Read more” link is read with its post’s name, so a list of links still says where each goes.',
    },
    {
      name: 'sale-price',
      title: 'Say what a strikethrough means',
      description: 'The prices read as “Was $120” and “Now $84”.',
    },
  ],
  accessibility: [
    'It stays in the accessibility tree: no `display: none`, `visibility: hidden` or `aria-hidden`, and a trace of opacity, since Android leaves views with no opacity out of the tree.',
    'Inside a Link or a Heading its words join that element’s name. On its own it is read where it stands: on iOS and Android as a separate stop.',
    'Do not hide words that sighted users also need. A status shown only by color needs visible text or an icon, not just hidden text (WCAG 1.4.1).',
    'With `role="status"` it is a polite live region on web. iOS and Android do not read live regions: announce changes there with `AccessibilityInfo.announceForAccessibility`.',
  ],
  platformNotes: {
    web: 'A `span` in a 1px box with `overflow: hidden` and `white-space: nowrap`, so VoiceOver on macOS does not read its words one at a time.',
    ios: 'A 1pt box with a trace of opacity, its words drawn transparent at almost no size. Inside another Text the box does nothing, but the words stay invisible, and they stay in that text, which VoiceOver reads.',
    android:
      'Same as iOS; TalkBack reads it as part of the text or link around it. The color is the background at no opacity, as Android reads `transparent` as no color and the words took the color of the text around them. Android rounds the font size up to 1px, so hidden words still take a few pixels, unseen.',
  },
  related: ['typography', 'link'],
})
