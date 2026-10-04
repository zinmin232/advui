import { type PropDoc, defineMeta } from '../../meta/types'

interface StackDefaults {
  direction: string
  align: string
  alignItems: string
}

/** The props every stack takes, with that stack's defaults. */
function stackProps({ direction, align, alignItems }: StackDefaults): PropDoc[] {
  return [
    {
      name: 'direction',
      type: "'row' | 'column' | 'row-reverse' | 'column-reverse'",
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
      responsive: true,
      default: direction,
      description: 'Main axis. Sets `flexDirection`.',
    },
    {
      name: 'wrap',
      type: "'nowrap' | 'wrap' | 'wrap-reverse'",
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      responsive: true,
      default: "'nowrap'",
      description: 'Whether children wrap onto new lines. Sets `flexWrap`.',
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      responsive: true,
      default: align,
      description: 'Alignment on the cross axis. Sets `alignItems`.',
    },
    {
      name: 'distribute',
      type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
      responsive: true,
      default: "'start'",
      description:
        'Distribution on the main axis: `between` is `space-between`. Sets `justifyContent`.',
    },
    {
      name: 'gap',
      type: 'SpaceTokens',
      token: 'space',
      description: 'Space between children, e.g. `$2`. Responsive with media props.',
    },
    { name: 'rowGap', type: 'SpaceTokens', token: 'space', description: 'Space between rows.' },
    {
      name: 'columnGap',
      type: 'SpaceTokens',
      token: 'space',
      description: 'Space between columns.',
    },
    {
      name: 'flexDirection',
      type: "'row' | 'column' | 'row-reverse' | 'column-reverse'",
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
      default: direction,
      description: 'Raw style prop. Wins over `direction` when both are given.',
    },
    {
      name: 'alignItems',
      type: "'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'",
      options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
      default: alignItems,
      description: 'Raw style prop (shorthand `items`). Wins over `align`.',
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
      default: "'flex-start'",
      description: 'Raw style prop (shorthand `justify`). Wins over `distribute`.',
    },
    {
      name: 'flexWrap',
      type: "'nowrap' | 'wrap' | 'wrap-reverse'",
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      default: "'nowrap'",
      description: 'Raw style prop. Wins over `wrap`.',
    },
  ]
}

export default defineMeta({
  name: 'Stack',
  slug: 'stack',
  category: 'layout',
  description:
    'Flexbox primitives: Box, Stack, HStack, VStack, Center and Spacer, with responsive direction and alignment.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Box',
    'Stack',
    'HStack',
    'VStack',
    'Center',
    'Spacer',
    'StackDirection',
    'StackWrap',
    'StackAlign',
    'StackDistribute',
    'Responsive',
    'responsiveStyle',
  ],
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
    'responsive',
    'direction',
    'justify',
    'align',
  ],
  usage: `import { HStack, Spacer, Stack, Text } from '@advui/core'

// A column on phones, a row from md
<Stack direction={{ base: 'column', md: 'row' }} align="center" distribute="between" gap="$4">
  <Text>Left</Text>
  <Text>Right</Text>
</Stack>

<HStack gap="$2">
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</HStack>`,
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
        'Flex column. `direction`, `wrap`, `align` and `distribute` take a value or a mobile-first map (0.9.0). The regular style props work too, with media props such as `$md={{ flexDirection: "row" }}`, and win when both set the same style.',
      props: stackProps({ direction: "'column'", align: "'stretch'", alignItems: "'stretch'" }),
      children: { accepts: 'any' },
    },
    {
      name: 'HStack',
      description: 'A Stack laid out as a row, with its children centered on the cross axis.',
      props: stackProps({ direction: "'row'", align: "'center'", alignItems: "'center'" }),
      children: { accepts: 'any' },
    },
    {
      name: 'VStack',
      description: 'A Stack laid out as a column.',
      props: stackProps({ direction: "'column'", align: "'stretch'", alignItems: "'stretch'" }),
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
    {
      name: 'responsiveStyle(prop, value, map?)',
      kind: 'function',
      description:
        'The helper behind these props, for your own components: `responsiveStyle("flexDirection", { base: "column", md: "row" })` returns `{ flexDirection: "column", $md: { flexDirection: "row" } }`. Only the breakpoints given are emitted; `map` (a record or a function) converts each value. `Responsive<T>` is the type of such a value.',
      props: [],
    },
  ],
  examples: [
    { name: 'basic', title: 'Stacks and spacer' },
    {
      name: 'responsive-direction',
      title: 'Responsive direction',
      description:
        'A column on phones and a row from md, with `direction={{ base: "column", md: "row" }}`.',
    },
    {
      name: 'toolbar',
      title: 'Toolbar',
      description:
        'A title and actions pushed apart with `distribute="between"`, stacked on phones.',
    },
    {
      name: 'wrap',
      title: 'Wrapping row',
      description:
        '`direction="row"` with `wrap="wrap"`. For chips and tags, Wrap does this for you.',
    },
    {
      name: 'responsive',
      title: 'Media props',
      description: 'The same layout with the raw style prop: `$md={{ flexDirection: "row" }}`.',
    },
  ],
  accessibility: [
    'Layout primitives add no roles; use semantic components (Heading, Button…) inside.',
    'Changing `direction` changes only the visual order’s axis; reading order still follows the source, so keep the source order meaningful. `row-reverse` and `column-reverse` show children in the opposite order from how screen readers read them.',
  ],
  responsive:
    '`direction`, `wrap`, `align` and `distribute` take a value or a mobile-first map `{ base, xs, sm, md, lg, xl, xxl }` (from 460, 640, 768, 1024, 1280 and 1536 px). Only the breakpoints you give are emitted, as media props, so on web they are CSS media queries (no flash during SSR) and on native they follow the window size. A raw style prop wins over its responsive prop: `flexDirection` (or `$md={{ flexDirection }}`) beats `direction` at the base (or at md), whichever comes first. A raw value equal to the stack’s own default, such as `flexDirection="column"` on a Stack, does not count. Responsive `gap` is not a prop: use media props, `$md={{ gap: "$6" }}`.',
  tables: [
    {
      id: 'values',
      title: 'Prop values',
      description: 'The short values map to the flexbox ones.',
      columns: ['Prop', 'Value', 'Style'],
      rows: [
        ['`align`', '`start` / `end`', '`alignItems: flex-start` / `flex-end`'],
        ['`distribute`', '`start` / `end`', '`justifyContent: flex-start` / `flex-end`'],
        [
          '`distribute`',
          '`between` / `around` / `evenly`',
          '`space-between` / `space-around` / `space-evenly`',
        ],
        ['`direction`, `wrap`', 'any', 'The same value, as `flexDirection` / `flexWrap`'],
      ],
    },
  ],
  related: ['wrap', 'grid', 'container'],
})
