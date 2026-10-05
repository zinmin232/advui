import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Combobox',
  slug: 'combobox',
  category: 'forms',
  description: 'A select you can type in to filter long lists of options.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Combobox', 'ComboboxOption', 'ComboboxFilter'],
  files: [
    'components/combobox/Combobox.tsx',
    'components/combobox/ComboboxField.tsx',
    'components/combobox/ComboboxField.native.tsx',
    'components/combobox/options.ts',
    'components/combobox/index.ts',
  ],
  keywords: ['combobox', 'searchable select', 'filter', 'typeahead', 'picker'],
  usage: `import { Combobox, Field } from '@advui/core'

<Field label="Country">
  <Combobox options={countries} value={country} onValueChange={setCountry} />
</Field>`,
  parts: [
    {
      name: 'Combobox',
      props: [
        {
          name: 'options',
          type: '{ value: string; label: string; description?: string; disabled?: boolean }[]',
          description: 'The options.',
        },
        {
          name: 'value',
          type: 'string | null',
          description: 'The picked option’s value, when you control it.',
        },
        {
          name: 'defaultValue',
          type: 'string | null',
          description: 'The picked option’s value at first, when the field manages it.',
        },
        {
          name: 'onValueChange',
          type: '(value: string | null) => void',
          description: 'Called on a pick, and with null when the text is cleared.',
        },
        {
          name: 'filter',
          type: '(option, query) => boolean',
          description: 'Default: the label contains the text, ignoring case and accents.',
        },
        {
          name: 'emptyText',
          type: 'string | null',
          default: "'No results'",
          description: 'Shown when nothing matches; null hides the list instead.',
        },
        { name: 'placeholder', type: 'string', description: 'Shown while empty.' },
        {
          name: 'title',
          type: 'string',
          description: 'Title of the bottom sheet on phones.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'As Input.',
        },
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description: 'Error styling and `aria-invalid`, as Input.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Not focusable or editable, as Input.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'On web the text box has `role="combobox"` with `aria-expanded`, `aria-controls` and `aria-autocomplete="list"`; focus stays in it and `aria-activedescendant` points at the highlighted option.',
    'Options have `role="option"` and `aria-selected`; the picked one also shows a check.',
    'On phones the field is a button that opens a bottom sheet with a search box and large, labelled rows.',
  ],
  keyboard: [
    { keys: 'ArrowDown / ArrowUp', action: 'Opens the list, then moves between options.' },
    { keys: 'Enter', action: 'Picks the highlighted option.' },
    { keys: 'Escape', action: 'Closes the list and restores the picked label.' },
  ],
  platformNotes: {
    web: 'The list renders in a portal and flips above the field when there is no room below.',
    ios: 'Opens a bottom sheet that moves up with the keyboard.',
    android: 'Opens a bottom sheet; the back button closes it.',
  },
  related: ['select', 'autocomplete', 'multi-select'],
})
