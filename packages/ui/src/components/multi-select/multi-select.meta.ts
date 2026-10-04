import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Multi Select',
  slug: 'multi-select',
  category: 'forms',
  description: 'Pick several options from a searchable list; picks show as chips.',
  status: 'beta',
  since: '0.5.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['MultiSelect'],
  files: [
    'components/multi-select/MultiSelect.tsx',
    'components/multi-select/index.ts',
    'components/combobox/ComboboxField.tsx',
    'components/combobox/ComboboxField.native.tsx',
    'components/combobox/options.ts',
    'components/chip/Chip.tsx',
  ],
  keywords: ['multi select', 'tags', 'multiple', 'chips', 'labels', 'filter'],
  usage: `import { Field, MultiSelect } from '@advui/core'

<Field label="Labels">
  <MultiSelect options={labels} value={picked} onValueChange={setPicked} />
</Field>`,
  parts: [
    {
      name: 'MultiSelect',
      description:
        'Takes Combobox’s `options`, `filter`, `placeholder`, `title`, `size` and states.',
      props: [
        { name: 'value', type: 'string[]', description: 'Picked values, in order.' },
        {
          name: 'defaultValue',
          type: 'string[]',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string[]) => void',
          description: 'Called when an option is picked, unpicked or removed.',
        },
        {
          name: 'removeLabel',
          type: '(label: string) => string',
          default: '(label) => `Remove ${label}`',
          description: 'Accessible name of each chip’s remove button (web).',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'On web the listbox has `aria-multiselectable`, stays open while you pick, and each option’s `aria-selected` says whether it is picked.',
    'Chips have named remove buttons; Backspace in the empty text box removes the last one.',
    'On phones the sheet shows checkbox rows, and the field announces how many are selected.',
  ],
  keyboard: [
    { keys: 'ArrowDown / ArrowUp', action: 'Moves between options.' },
    { keys: 'Enter', action: 'Picks or unpicks the highlighted option.' },
    { keys: 'Backspace', action: 'Removes the last chip when the text box is empty.' },
    { keys: 'Escape', action: 'Closes the list.' },
  ],
  platformNotes: {
    ios: 'Opens a bottom sheet of checkbox rows; unpick there to remove a chip.',
    android: 'Opens a bottom sheet of checkbox rows; the back button closes it.',
  },
  related: ['combobox', 'chip', 'select'],
})
