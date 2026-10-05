import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Section',
  slug: 'section',
  category: 'layout',
  description:
    'A band of a page: a `<section>` with vertical spacing, a surface and a Container, for heroes, feature lists and calls to action.',
  status: 'beta',
  since: '0.10.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Section',
    'SectionProps',
    'SectionSpacing',
    'SectionBackground',
    'SectionContainer',
    'sectionPadding',
  ],
  files: ['components/section/Section.tsx', 'components/section/index.ts'],
  keywords: ['band', 'hero', 'landing', 'page section', 'cta', 'landmark', 'region', 'anchor'],
  usage: `import { Heading, Section } from '@advui/core'

<Section spacing="lg" background="muted" container="lg" aria-labelledby="features-title" id="features">
  <Heading id="features-title" level={2}>Features</Heading>
  …
</Section>`,
  parts: [
    {
      name: 'Section',
      description:
        'A `<section>` on web and a View on iOS and Android. It passes `id`, `aria-label`, `aria-labelledby` and View style props through.',
      props: [
        {
          name: 'spacing',
          type: "'none' | 'sm' | 'md' | 'lg' | 'xl'",
          options: ['none', 'sm', 'md', 'lg', 'xl'],
          responsive: true,
          default: "'md'",
          description:
            'Vertical padding, larger from md: `sm` 24 → 32px, `md` 48 → 64px, `lg` 64 → 96px, `xl` 96 → 128px.',
        },
        {
          name: 'background',
          type: "'none' | 'background' | 'card' | 'muted' | 'primary' | 'primarySoft' | 'inverse'",
          options: ['none', 'background', 'card', 'muted', 'primary', 'primarySoft', 'inverse'],
          default: "'none'",
          description:
            'The surface. `primary` and `inverse` switch the content to the `primary` or `inverse` sub-theme, so text, muted text, cards and buttons stay readable in light and dark mode.',
        },
        {
          name: 'container',
          type: "'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full'",
          options: ['none', 'sm', 'md', 'lg', 'xl', 'xxl', 'full'],
          default: "'xl'",
          description:
            'Wraps the children in a Container of this size (centered, with side padding); `none` does not.',
        },
        {
          name: 'id',
          type: 'string',
          description: 'For anchor links such as `#features`.',
          platforms: ['web'],
        },
        {
          name: 'aria-labelledby',
          type: 'string',
          description:
            'The id of the section’s heading. Names it, which makes it a region landmark.',
          platforms: ['web'],
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the section when it has no visible heading.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'sectionPadding(spacing)',
      kind: 'function',
      description:
        'The vertical padding of a spacing value or map, as style props with media props, for your own bands.',
      props: [],
    },
  ],
  examples: [
    { name: 'hero', title: 'Hero', description: 'Large spacing and a narrower container.' },
    {
      name: 'features',
      title: 'Features',
      description: 'A muted band with an anchor (`id="features"`) and spacing that grows from md.',
    },
    {
      name: 'call-to-action',
      title: 'Call to action',
      description: 'An inverse band (dark in light mode, light in dark mode) and a primary one.',
    },
  ],
  accessibility: [
    'Renders `<section>` on web. Give it `aria-labelledby` (its heading’s id) or `aria-label`: a named section is a region landmark that screen reader users can jump to; an unnamed one is not a landmark.',
    'Keep one heading per section, at the level its place in the page outline calls for.',
    '`primary` and `inverse` change the text colors with the surface, so contrast stays at WCAG AA in both modes (checked by the theme tests).',
  ],
  responsive:
    'Spacing grows at md for every step, and `spacing` also takes a map, such as `{ base: "sm", lg: "xl" }`. Only the breakpoints where the padding changes are emitted, as CSS media queries on web.',
  platformNotes: {
    web: 'A `<section>` element; `id`, `aria-label` and `aria-labelledby` pass through, so `#features` links jump to it.',
    ios: 'A View. `aria-label` names it for VoiceOver; there is no landmark role.',
    android: 'A View. `aria-label` names it for TalkBack; there is no landmark role.',
  },
  related: ['container', 'stack', 'show-hide'],
})
