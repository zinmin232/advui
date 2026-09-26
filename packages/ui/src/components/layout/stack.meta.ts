import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Stack',
  slug: 'stack',
  category: 'layout',
  description: 'Flexbox primitives: Box, Stack, HStack, VStack, Center and Spacer.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Box', 'Stack', 'HStack', 'VStack', 'Center', 'Spacer'],
  files: ['components/layout/Stack.tsx'],
  keywords: [
    'flex',
    'row',
    'column',
    'box',
    'layout',
    'gap',
    'hstack',
    'vstack',
    'center',
    'spacer',
  ],
  usage: `import { HStack, Spacer, Text, VStack } from '@advui/core'

<VStack gap="$3">
  <HStack gap="$2">
    <Text>Left</Text>
    <Spacer />
    <Text>Right</Text>
  </HStack>
</VStack>`,
  parts: [
    { name: 'Box', description: 'A `View` with every style prop and token.', props: [] },
    {
      name: 'Stack',
      description: 'Flex column. Style it with standard props — no custom API to learn.',
      props: [
        {
          name: 'flexDirection',
          type: "'row' | 'column' | …",
          default: "'column'",
          description: 'Main axis.',
        },
        {
          name: 'alignItems / justifyContent',
          type: 'FlexAlign',
          description: 'Alignment (shorthands: `items`, `justify`).',
        },
        { name: 'gap', type: 'SpaceTokens', description: 'Space between children, e.g. `$2`.' },
        {
          name: '$sm / $md / $lg …',
          type: 'style object',
          description: 'Responsive overrides per breakpoint.',
        },
      ],
    },
    {
      name: 'HStack / VStack',
      description: 'Row (centered) / column presets of Stack.',
      props: [],
    },
    { name: 'Center / Spacer', description: 'Center children; push siblings apart.', props: [] },
  ],
  examples: [
    { name: 'basic', title: 'Stacks and spacer' },
    { name: 'responsive', title: 'Responsive direction' },
  ],
  accessibility: [
    'Layout primitives add no roles; use semantic components (Heading, Button…) inside.',
  ],
  responsive: 'Every style prop accepts media keys: `<Stack $md={{ flexDirection: "row" }}>`.',
  related: ['grid', 'container'],
})
