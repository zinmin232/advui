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
        {
          name: 'value / defaultValue / onValueChange',
          type: 'string',
          description: 'The text, as Markdown.',
        },
        { name: 'placeholder', type: 'string', description: 'Shown while empty.' },
        {
          name: 'tools',
          type: 'RichTextTool[]',
          default: 'all nine',
          description:
            "Toolbar buttons, in order: 'bold', 'italic', 'strikethrough', 'heading', 'bulletList', 'orderedList', 'quote', 'link', 'code'.",
        },
        { name: 'minHeight', type: 'number | token', default: "'$32'", description: 'Height.' },
        {
          name: 'maxLength',
          type: 'number',
          description: 'Limit, with a character count read as the field’s description.',
        },
        { name: 'disabled / invalid', type: 'boolean', description: 'States, as on Textarea.' },
        {
          name: 'aria-label / id / aria-describedby',
          type: 'string',
          description: 'Name and help. Form Field sets these for you.',
        },
        {
          name: 'labels',
          type: 'Partial<RichTextEditorLabels>',
          description: 'Toolbar, tool, preview and count text, for translation.',
        },
      ],
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
          description: 'Added to heading levels, so `#` is an h2 under the page’s h1.',
        },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'In a form field, with a limit' },
    { name: 'minimal', title: 'Fewer tools, for comments' },
    { name: 'content', title: 'Showing saved text' },
  ],
  accessibility: [
    'The text area is a normal multi-line field, named by `aria-label` or Form Field.',
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
  related: ['textarea', 'form-field'],
})
