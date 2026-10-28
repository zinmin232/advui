import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Spoiler',
  slug: 'spoiler',
  category: 'data-display',
  description:
    'Shows the start of long content, such as a description or a review, with a “Show more” button for the rest. The button appears only when the content is taller than `maxHeight`.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Spoiler'],
  files: ['components/spoiler/Spoiler.tsx', 'components/spoiler/index.ts'],
  keywords: ['show more', 'read more', 'see more', 'truncate', 'clamp', 'expand text'],
  usage: `import { Spoiler, Text } from '@advui/core'

<Spoiler maxHeight="24">
  <Text>{description}</Text>
</Spoiler>`,
  parts: [
    {
      name: 'Spoiler',
      description:
        'Also takes layout props, such as `width`, for the whole component. A string child is wrapped in Text.',
      props: [
        {
          name: 'maxHeight',
          type: 'SizeTokens | number',
          default: "'24'",
          token: 'size',
          description:
            'Height of the content while collapsed: a size token or pixels (96px by default).',
        },
        { name: 'expanded', type: 'boolean', description: 'Controlled expanded state.' },
        {
          name: 'defaultExpanded',
          type: 'boolean',
          default: 'false',
          description: 'Starting state when uncontrolled.',
        },
        {
          name: 'onExpandedChange',
          type: '(expanded: boolean) => void',
          description:
            'Called when the button is pressed, or when focus moves to content that is cut off.',
        },
        {
          name: 'showLabel',
          type: 'string',
          default: "'Show more'",
          description: 'Button label while collapsed.',
        },
        {
          name: 'hideLabel',
          type: 'string',
          default: "'Show less'",
          description: 'Button label while expanded.',
        },
      ],
      children: { accepts: 'any' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'labels', title: 'Own labels and height' },
  ],
  accessibility: [
    'The button has `aria-expanded` and `aria-controls` pointing at the content.',
    'The content stays in the page while cut off, so screen readers that read past the cut still get all of it.',
    'On web, tabbing to a link or button below the cut shows the rest, so focus never lands on something hidden.',
  ],
  platformNotes: {
    web: 'Watches the content’s size, so the button appears or goes when content grows or shrinks, such as an image that loads.',
    ios: 'Measures the content with `onLayout`. VoiceOver may skip words that are cut off; the button shows them.',
    android:
      'Measures the content with `onLayout`. TalkBack may skip words that are cut off; the button shows them.',
  },
  related: ['collapsible', 'accordion', 'typography'],
})
