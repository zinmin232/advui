import { type PropDoc, defineMeta } from '../../meta/types'

/** The flex props every stack takes, with that stack's defaults. */
function flexProps(direction: string, align: string, justify = "'flex-start'"): PropDoc[] {
  return [
    {
      name: 'flexDirection',
      type: "'row' | 'column' | 'row-reverse' | 'column-reverse'",
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
      default: direction,
      description: 'Main axis.',
    },
    {
      name: 'alignItems',
      type: "'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'",
      options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
      default: align,
      description: 'Alignment on the cross axis (shorthand `items`).',
    },
    {
      name: 'justifyContent',
      type: "'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'",
      options: [
        'flex-start',
        'center',
        'flex-end',
        'space-between',
        'space-around',
        'space-evenly',
      ],
      default: justify,
      description: 'Distribution on the main axis (shorthand `justify`).',
    },
    {
      name: 'flexWrap',
      type: "'nowrap' | 'wrap' | 'wrap-reverse'",
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      default: "'nowrap'",
      description: 'Whether children wrap onto new lines.',
    },
    {
      name: 'gap',
      type: 'SpaceTokens',
      token: 'space',
      description: 'Space between children, e.g. `$2`.',
    },
  ]
}

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
    {
      name: 'Box',
      description: 'A `View` with every style prop and token.',
      props: [],
      children: { accepts: 'any' },
    },
    {
      name: 'Stack',
      description:
        'Flex column. Style it with standard props — no custom API to learn. Every style prop also takes media props for responsive changes: `$md={{ flexDirection: "row" }}`.',
      props: flexProps("'column'", "'stretch'"),
      children: { accepts: 'any' },
    },
    {
      name: 'HStack',
      description: 'A Stack laid out as a row, with its children centered on the cross axis.',
      props: flexProps("'row'", "'center'"),
      children: { accepts: 'any' },
    },
    {
      name: 'VStack',
      description: 'A Stack laid out as a column.',
      props: flexProps("'column'", "'stretch'"),
      children: { accepts: 'any' },
    },
    {
      name: 'Center',
      description: 'Centers its children on both axes.',
      props: [],
      children: { accepts: 'any' },
    },
    {
      name: 'Spacer',
      description: 'Flexible empty space that pushes its siblings apart inside a stack.',
      props: [],
      children: { accepts: 'none' },
    },
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
