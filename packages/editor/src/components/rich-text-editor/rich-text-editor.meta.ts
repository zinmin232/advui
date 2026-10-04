import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Rich Text Editor',
  slug: 'rich-text-editor',
  category: 'advanced',
  description:
    'A Markdown editor with a formatting toolbar and a preview, plus Rich Text Content to show what was written.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'RichTextEditor',
    'RichTextEditorProps',
    'RichTextEditorLabels',
    'RichTextContent',
    'RichTextContentProps',
    'RichTextTool',
    'defaultRichTextTools',
    'applyFormat',
    'parseMarkdown',
    'FormatResult',
    'TextSelection',
  ],
  files: [
    'components/rich-text-editor/RichTextEditor.tsx',
    'components/rich-text-editor/RichTextContent.tsx',
    'components/rich-text-editor/markdown.ts',
    'components/rich-text-editor/index.ts',
  ],
  keywords: ['rich text', 'editor', 'markdown', 'wysiwyg', 'formatting', 'toolbar', 'comment'],
  usage: `import { RichTextContent, RichTextEditor } from '@advui/editor'

<RichTextEditor aria-label="Report" value={markdown} onValueChange={setMarkdown} />

// Show saved text:
<RichTextContent>{markdown}</RichTextContent>`,
  parts: [
    {
      name: 'RichTextEditor',
      props: [
        { name: 'value', type: 'string', description: 'The text, as Markdown.' },
        {
          name: 'defaultValue',
          type: 'string',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called with the new `value`.',
        },
        { name: 'placeholder', type: 'string', description: 'Shown while empty.' },
        {
          name: 'tools',
          type: 'RichTextTool[]',
          default: 'all nine',
          description:
            "Toolbar buttons, in order: 'bold', 'italic', 'strikethrough', 'heading', 'bulletList', 'orderedList', 'quote', 'link', 'code'.",
        },
        {
          name: 'minHeight',
          type: 'number | SizeTokens',
          token: 'size',
          default: "'$32'",
          description: 'Height of the text area before it grows.',
        },
        {
          name: 'maxLength',
          type: 'number',
          description: 'Limit, with a character count read as the field’s description.',
        },
        { name: 'invalid', type: 'boolean', description: 'Error styling and `aria-invalid`.' },
        { name: 'disabled', type: 'boolean', description: 'Not focusable or editable.' },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the editor when there is no visible label. A Field sets it for you.',
        },
        {
          name: 'id',
          type: 'string',
          description: 'Links the text area to a Label’s `htmlFor`. A Field sets it for you.',
        },
        {
          name: 'aria-describedby',
          type: 'string',
          description: 'Ids of help or error text. A Field sets it for you.',
        },
        {
          name: 'labels',
          type: 'Partial<RichTextEditorLabels>',
          description: 'Toolbar, tool, preview and count text, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'RichTextContent',
      description: 'Shows Markdown with the same styles. Also takes View props.',
      props: [
        { name: 'children', type: 'string', required: true, description: 'The Markdown.' },
        {
          name: 'headingOffset',
          type: 'number',
          default: '1',
          min: 0,
          max: 5,
          step: 1,
          description: 'Added to heading levels, so `#` is an h2 under the page’s h1.',
        },
      ],
      children: { accepts: 'text' },
    },
  ],
  examples: [
    { name: 'basic', title: 'In a form field, with a limit' },
    { name: 'minimal', title: 'Fewer tools, for comments' },
    { name: 'content', title: 'Showing saved text' },
  ],
  accessibility: [
    'The text area is a normal multi-line field, named by `aria-label` or a Field.',
    'The toolbar is a WAI-ARIA `toolbar` with one tab stop; each tool is a named button (with its shortcut in the tooltip).',
    'After a tool is used, focus returns to the text with the new text selected, so you can keep typing.',
    'Preview is a toggle button (`aria-pressed`); the preview is a named region with real headings and lists.',
    'Links in Rich Text Content only follow `http(s)` and `mailto` addresses and open in a new tab on web.',
  ],
  keyboard: [
    { keys: '⌘ / Ctrl + B', action: 'Bold.' },
    { keys: '⌘ / Ctrl + I', action: 'Italic.' },
    { keys: '⌘ / Ctrl + K', action: 'Link.' },
    { keys: 'Tab', action: 'Toolbar, Preview, then the text.' },
    { keys: 'Arrow keys', action: 'Move between tools in the toolbar.' },
  ],
  responsive: 'The toolbar wraps on narrow screens.',
  platformNotes: {
    web: 'The value is Markdown, not HTML, so saved text cannot carry scripts. Tools keep the text selected.',
    ios: 'The same editor on a native text field; tools act on the selection.',
    android: 'Same as iOS.',
  },
  related: ['textarea', 'field'],
})
