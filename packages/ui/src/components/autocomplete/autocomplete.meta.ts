import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Autocomplete',
  slug: 'autocomplete',
  category: 'forms',
  description: 'A text field with suggestions; any text is a valid value.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Autocomplete'],
  files: [
    'components/autocomplete/Autocomplete.tsx',
    'components/autocomplete/index.ts',
    'components/combobox/ComboboxField.tsx',
    'components/combobox/ComboboxField.native.tsx',
    'components/combobox/options.ts',
  ],
  keywords: ['autocomplete', 'suggestions', 'typeahead', 'search box', 'address'],
  usage: `import { Autocomplete, FormField } from '@advui/core'

<FormField label="City">
  <Autocomplete options={suggestions} value={city} onValueChange={setCity} />
</FormField>`,
  parts: [
    {
      name: 'Autocomplete',
      description: 'Takes Combobox’s `options`, `filter`, `placeholder`, `size` and states.',
      props: [
        { name: 'value / defaultValue', type: 'string', description: 'The text.' },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called as the text changes and when a suggestion is picked.',
        },
        {
          name: 'options',
          type: 'ComboboxOption[]',
          description: 'Suggestions. Pass new ones as the text changes to load them.',
        },
        {
          name: 'emptyText',
          type: 'string | null',
          default: 'null',
          description: 'By default the list hides when nothing matches.',
        },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'The same combobox pattern as Combobox; picking a suggestion fills the text, and Escape closes the list without changing it.',
  ],
  keyboard: [
    { keys: 'ArrowDown / ArrowUp', action: 'Moves through the suggestions.' },
    { keys: 'Enter', action: 'Fills in the highlighted suggestion.' },
    { keys: 'Escape', action: 'Closes the suggestions.' },
  ],
  platformNotes: {
    ios: 'Opens a bottom sheet where the text is typed, with the suggestions under it.',
    android: 'Opens a bottom sheet; the back button closes it and keeps the text.',
  },
  related: ['combobox', 'input'],
})
