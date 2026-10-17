import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Tags Input',
  slug: 'tags-input',
  category: 'forms',
  description:
    'A text field that turns typed or pasted text into removable tags, for free-form values such as topics or email addresses.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['TagsInput', 'TagsInputFrame'],
  files: [
    'components/tags-input/TagsInput.tsx',
    'components/tags-input/index.ts',
    'components/chip/Chip.tsx',
  ],
  keywords: ['tags', 'tag input', 'chips', 'keywords', 'labels', 'emails', 'recipients', 'token'],
  usage: `import { Field, TagsInput } from '@advui/core'

<Field label="Topics">
  <TagsInput value={topics} onValueChange={setTopics} placeholder="Add a topic" />
</Field>`,
  parts: [
    {
      name: 'TagsInput',
      description:
        'A field box that wraps its chips and text box onto more lines as needed. Style and layout props go to the box; `id`, `aria-*` and the Field’s wiring go to the text box.',
      props: [
        {
          name: 'value',
          type: 'string[]',
          description: 'The tags, in order, when you control it.',
        },
        {
          name: 'defaultValue',
          type: 'string[]',
          default: '[]',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string[]) => void',
          description: 'Called with the new list when tags are added or removed.',
        },
        { name: 'placeholder', type: 'string', description: 'Text in the empty text box.' },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Height of a one-line field, matching Input: 32, 40 or 48px.',
        },
        {
          name: 'separators',
          type: 'string[]',
          default: "[',']",
          description:
            'Characters that end a tag as you type them, besides Enter. Pasted text is split at them and every part is added. `[]` leaves only Enter.',
        },
        {
          name: 'max',
          type: 'number',
          min: 1,
          step: 1,
          description: 'Most tags allowed. More are refused and stay in the text box.',
        },
        {
          name: 'allowDuplicates',
          type: 'boolean',
          default: 'false',
          description: 'Allow the same tag twice. Otherwise a repeat stays in the text box.',
        },
        {
          name: 'validate',
          type: '(tag: string, value: string[]) => boolean',
          description:
            'Return false to refuse a tag; it stays in the text box to be fixed. Tags are trimmed first.',
        },
        {
          name: 'addOnBlur',
          type: 'boolean',
          default: 'true',
          description: 'Add the typed text when the field loses focus, so a form does not lose it.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description:
            'Disables the text box and the remove buttons. Also on inside a disabled Field or Form.',
        },
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description: 'Error border and `aria-invalid`. On inside a Field with an `error`.',
        },
        {
          name: 'name',
          type: 'string',
          platforms: ['web'],
          description: 'Field name for a native form: each tag submits under it.',
        },
        {
          name: 'labels',
          type: 'Partial<TagsInputLabels>',
          description:
            'Remove-button names (`remove(tag)`) and the announcements (`added(tags)`, `removed(tag)`), for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  playground: {
    component: 'TagsInput',
    staticProps: { 'aria-label': 'Tags' },
    controls: [
      { prop: 'placeholder', type: 'text', default: 'Add a tag' },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'allowDuplicates', type: 'boolean', default: false },
      { prop: 'addOnBlur', type: 'boolean', default: true },
      { prop: 'invalid', type: 'boolean', default: false },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  examples: [
    {
      name: 'basic',
      title: 'In a Field',
      description: 'Enter or a comma adds a topic; the field’s label names the text box.',
    },
    {
      name: 'validation',
      title: 'Validation',
      description:
        'Email addresses separated by commas or spaces, up to five. A refused address stays in the text box and the field shows why.',
    },
    { name: 'sizes', title: 'Sizes', description: 'Small, medium and large, as tall as an Input.' },
  ],
  accessibility: [
    'The text box is a plain textbox named by `aria-label` or the Field’s label, with the Field’s help and error text as its description.',
    'Each tag is a chip with a remove button named “Remove {tag}”. After the button removes its tag, focus moves to the text box.',
    'Added and removed tags are announced: through a polite live region on web, and with `AccessibilityInfo.announceForAccessibility` on iOS and Android.',
    'Enter in an empty text box is not taken, so it still submits a form.',
  ],
  keyboard: [
    { keys: 'Enter', action: 'Adds the typed text as a tag.' },
    { keys: ', (separators)', action: 'Adds the typed text as a tag.' },
    { keys: 'Backspace', action: 'Removes the last tag when the text box is empty (web).' },
    { keys: 'Tab', action: 'Moves through the remove buttons and the text box.' },
  ],
  platformNotes: {
    web: 'Presses on the box and on remove buttons keep focus in the text box, so half-typed text is not added by a blur.',
    ios: 'The return key adds a tag and keeps the keyboard open. Backspace does not remove tags (Tamagui does not pass key presses to the text box); use the remove buttons.',
    android:
      'The return key adds a tag and keeps the keyboard open. Backspace does not remove tags (Tamagui does not pass key presses to the text box); use the remove buttons.',
  },
  related: ['multi-select', 'chip', 'input', 'field'],
})
