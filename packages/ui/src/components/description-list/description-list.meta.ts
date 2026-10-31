import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'Description List',
  slug: 'description-list',
  category: 'data-display',
  description:
    'Terms and their details, such as the fields of an order, a profile or a file: a `dl` on web.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['DescriptionList'],
  files: [
    'components/description-list/DescriptionList.tsx',
    'components/description-list/index.ts',
  ],
  keywords: ['key value', 'definition list', 'details', 'properties', 'dl', 'data list', 'summary'],
  usage: `import { DescriptionList } from '@advui/core'

<DescriptionList>
  <DescriptionList.Item term="Order">#4021</DescriptionList.Item>
  <DescriptionList.Item term="Status">Paid</DescriptionList.Item>
</DescriptionList>`,
  parts: [
    {
      name: 'DescriptionList',
      description: 'A `dl`. Also takes layout props, such as `width`.',
      props: [
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          options: ['horizontal', 'vertical'],
          default: "'horizontal'",
          description: 'Each term beside its details, or above them.',
        },
        {
          name: 'divided',
          type: 'boolean',
          default: 'false',
          description: 'Draws a line between items.',
        },
        {
          name: 'termWidth',
          type: 'SizeTokens | number',
          default: "'40'",
          token: 'size',
          description: 'Width of the term column when horizontal (160px by default).',
        },
      ],
      children: { accepts: ['DescriptionList.Item'] },
    },
    {
      name: 'DescriptionList.Item',
      description: 'A `div` holding a `dt` and a `dd`.',
      props: [
        {
          name: 'term',
          type: 'ReactNode',
          description: 'What is described, such as “Status”. Usually a string.',
        },
      ],
      children: { accepts: 'any' },
      parents: ['DescriptionList'],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'divided', title: 'Vertical, with lines' },
  ],
  playground: {
    component: 'DescriptionList',
    controls: [
      {
        prop: 'orientation',
        type: 'select',
        options: ['horizontal', 'vertical'],
        default: 'horizontal',
      },
      { prop: 'divided', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'On web, a `dl` with a `dt` (role `term`) and a `dd` (role `definition`) for each item, wrapped in a `div` as HTML allows.',
    'On iOS and Android, an item whose details are text is one stop, read as “Status, Paid”. Details with other elements stay apart, so a link or a button in them can be reached.',
  ],
  platformNotes: {
    ios: 'VoiceOver reads a term and its text details together.',
    android: 'TalkBack reads a term and its text details together.',
  },
  related: ['list', 'card', 'typography'],
})
