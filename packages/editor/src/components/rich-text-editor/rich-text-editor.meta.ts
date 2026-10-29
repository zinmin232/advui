import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Rich Text Editor',
  slug: 'rich-text-editor',
  category: 'advanced',
  description:
    'A WYSIWYG editor that shows formatting as you write and saves HTML, plus Rich Text Content to show what was written.',
  status: 'experimental',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'RichTextEditor',
    'RichTextEditorProps',
    'RichTextEditorLabels',
    'RichTextContent',
    'RichTextContentProps',
    'RichTextTool',
    'defaultRichTextTools',
    'parseHtml',
  ],
  files: [
    'components/rich-text-editor/RichTextEditor.tsx',
    'components/rich-text-editor/RichTextEditor.native.tsx',
    'components/rich-text-editor/RichTextContent.tsx',
    'components/rich-text-editor/parts.tsx',
    'components/rich-text-editor/html.ts',
    'components/rich-text-editor/index.ts',
  ],
  keywords: [
    'rich text',
    'wysiwyg',
    'editor',
    'html',
    'formatting',
    'toolbar',
    'tiptap',
    'contenteditable',
  ],
  usage: `import { RichTextContent, RichTextEditor } from '@advui/editor'

<RichTextEditor aria-label="Report" value={html} onValueChange={setHtml} />

// Show saved text:
<RichTextContent>{html}</RichTextContent>`,
  parts: [
    {
      name: 'RichTextEditor',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'The text, as HTML. An empty document is an empty string.',
        },
        {
          name: 'defaultValue',
          type: 'string',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called with the new `value` as the text changes.',
        },
        { name: 'placeholder', type: 'string', description: 'Shown while empty.' },
        {
          name: 'tools',
          type: 'RichTextTool[]',
          default: 'all ten',
          description:
            "Toolbar buttons, in order: 'bold', 'italic', 'underline', 'strikethrough', 'heading', 'bulletList', 'orderedList', 'quote', 'link', 'code'.",
        },
        {
          name: 'minHeight',
          type: 'number | SizeTokens',
          token: 'size',
          default: "'32'",
          description: 'Height of the text before it grows.',
        },
        { name: 'invalid', type: 'boolean', description: 'Error styling and `aria-invalid`.' },
        { name: 'disabled', type: 'boolean', description: 'Not editable; the tools are disabled.' },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the editor when there is no visible label. A Field sets it for you.',
        },
        {
          name: 'id',
          type: 'string',
          description: 'The text’s id. A Field sets it, and names the text with its label.',
        },
        {
          name: 'aria-describedby',
          type: 'string',
          description: 'Ids of help or error text. A Field sets it for you.',
        },
        {
          name: 'labels',
          type: 'Partial<RichTextEditorLabels>',
          description: 'Toolbar, tool and link field text, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'RichTextContent',
      description:
        'Shows the HTML with the same styles as Markdown Content. Also takes View props.',
      props: [
        { name: 'children', type: 'string', required: true, description: 'The HTML.' },
        {
          name: 'headingOffset',
          type: 'number',
          default: '0',
          min: 0,
          max: 5,
          step: 1,
          description: 'Added to heading levels, for text shown under a deeper heading.',
        },
      ],
      children: { accepts: 'text' },
    },
  ],
  examples: [
    { name: 'basic', title: 'In a form field' },
    { name: 'minimal', title: 'Fewer tools, for comments' },
    { name: 'content', title: 'Showing saved text' },
  ],
  accessibility: [
    'The text is a multi-line `textbox`, named by `aria-label` or a Field’s label (`aria-labelledby` on web).',
    'The toolbar is a WAI-ARIA `toolbar` with one tab stop; each tool is a toggle button that shows whether the selection has it (`aria-pressed` on web, a checked toggle button on iOS and Android), with its shortcut in `aria-keyshortcuts` and the tooltip.',
    'After a tool is used, focus returns to the text. Link opens an address field under the toolbar; Enter applies it and Escape returns to the text.',
    'Tab leaves the text, also in lists: lists are not nested with Tab, so the keyboard never stays trapped.',
    'Rich Text Content draws the HTML as views with real headings and lists; scripts and styles in it never run, and links only follow `http(s)` and `mailto` addresses.',
  ],
  keyboard: [
    { keys: '⌘ / Ctrl + B, I, U', action: 'Bold, italic, underline.' },
    { keys: '⌘ / Ctrl + Shift + S', action: 'Strikethrough.' },
    { keys: '⌘ / Ctrl + E', action: 'Code.' },
    { keys: '⌘ / Ctrl + K', action: 'Link: opens the address field.' },
    { keys: '⌘ / Ctrl + Alt + 2', action: 'Heading.' },
    { keys: '⌘ / Ctrl + Shift + 8, 7', action: 'Bulleted, numbered list.' },
    { keys: '⌘ / Ctrl + Shift + B', action: 'Quote.' },
    { keys: '⌘ / Ctrl + Z, Shift + Z', action: 'Undo, redo.' },
    { keys: 'Tab', action: 'Toolbar, then the text.' },
    { keys: 'Arrow keys', action: 'Move between tools in the toolbar.' },
  ],
  responsive: 'The toolbar wraps on narrow screens.',
  platformNotes: {
    web: 'TipTap edits the text in the page. Typing Markdown shortcuts (`## `, `- `, `**bold**`) formats as you go. The value is HTML: show it with Rich Text Content, not as markup.',
    ios: 'TipTap runs in a WebView (TenTap, with `react-native-webview`, which Expo Go includes), under the same toolbar; the WebView grows with the text. App fonts are not loaded in it, so it uses the system font. Not yet checked on a device.',
    android: 'Same as iOS. Not yet checked on a device.',
  },
  related: ['markdown-editor', 'textarea', 'field'],
})
