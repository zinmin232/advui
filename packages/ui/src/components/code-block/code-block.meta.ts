import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Code Block',
  slug: 'code-block',
  category: 'data-display',
  description:
    'Shows code or terminal commands in a monospace block with a copy button, and optionally a title, line numbers, marked lines and syntax colors.',
  status: 'stable',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['CodeBlock', 'CodeBlockFrame'],
  files: ['components/code-block/CodeBlock.tsx', 'components/code-block/index.ts'],
  keywords: ['code', 'snippet', 'pre', 'syntax highlighting', 'terminal', 'command', 'shiki'],
  usage: `import { CodeBlock } from '@advui/core'

<CodeBlock code="pnpm add @advui/core" />
<CodeBlock title="app/providers.tsx" language="tsx" code={source} lineNumbers />`,
  parts: [
    {
      name: 'CodeBlock',
      description:
        'A bordered block on `muted`. With a `title` or `language` it has a header with the copy button; without, the button sits at the top right. Layout and box props go to the block.',
      props: [
        {
          name: 'code',
          type: 'string',
          required: true,
          description: 'The code, as the copy button copies it. One final newline is not shown.',
        },
        {
          name: 'language',
          type: 'string',
          description: 'Shown in the header, e.g. `tsx` or `bash`. It does not color the code.',
        },
        {
          name: 'title',
          type: 'string',
          description:
            'A file name or caption in the header. It also names the code for screen readers.',
        },
        {
          name: 'tokens',
          type: 'CodeToken[][]',
          description:
            'The same code as lines of `{ content, color?, italic?, bold? }`, from your highlighter. From Shiki’s `codeToTokensBase`: `({ content, color, fontStyle = 0 }) => ({ content, color, italic: (fontStyle & 1) > 0, bold: (fontStyle & 2) > 0 })`. Theme colors (`infoSoftForeground`) follow dark mode; check a highlighter theme’s contrast on `muted`.',
        },
        {
          name: 'lineNumbers',
          type: 'boolean',
          default: 'false',
          description: 'Numbers each line. The numbers are not selected or read aloud.',
        },
        {
          name: 'firstLineNumber',
          type: 'number',
          default: '1',
          min: 0,
          step: 1,
          description: 'The first line’s number, for an excerpt of a longer file.',
        },
        {
          name: 'highlightLines',
          type: 'number[]',
          description:
            'Line numbers to mark with a tint and a bar, counting from `firstLineNumber`. Say why in the text around it too: screen readers do not hear the mark.',
        },
        {
          name: 'wrap',
          type: 'boolean',
          default: 'false',
          description: 'Wraps long lines. Without it they scroll sideways.',
        },
        {
          name: 'maxHeight',
          type: 'SizeTokens | number',
          token: 'size',
          description: 'Scrolls the code beyond this height; the header stays in place.',
        },
        {
          name: 'copyable',
          type: 'boolean',
          default: 'true',
          description: 'Shows the copy button.',
        },
        {
          name: 'onCopy',
          type: '(code: string) => void',
          description: 'Called with the code once it is copied.',
        },
        {
          name: 'labels',
          type: 'Partial<CodeBlockLabels>',
          description:
            '`code` (names the code without a title, “Code”), `copy` (“Copy code”), `copied` and `failed`, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic', description: 'A one-line command with its copy button.' },
    {
      name: 'title',
      title: 'Title and language',
      description: 'A file name and language in the header, with the copy button.',
    },
    {
      name: 'line-numbers',
      title: 'Line numbers and marked lines',
      description: 'Lines 4 and 5 are marked with a tint and a bar.',
    },
    {
      name: 'colors',
      title: 'Syntax colors',
      description: 'Tokens from a highlighter, here written by hand in theme colors.',
    },
    {
      name: 'long-lines',
      title: 'Long lines',
      description:
        'A command that scrolls sideways, the same command wrapped, and a log that scrolls within 192px.',
    },
  ],
  playground: {
    component: 'CodeBlock',
    staticProps: {
      code: 'import { CodeBlock } from \'@advui/core\'\n\nexport function Install() {\n  return <CodeBlock code="pnpm add @advui/core" />\n}',
      width: '100%',
    },
    controls: [
      { prop: 'title', type: 'text', default: 'install.tsx' },
      { prop: 'language', type: 'text', default: 'tsx' },
      { prop: 'lineNumbers', type: 'boolean', default: false },
      { prop: 'wrap', type: 'boolean', default: false },
      { prop: 'copyable', type: 'boolean', default: true },
    ],
  },
  accessibility: [
    'On web the code is a `<pre><code>` that takes focus (Tab), so keyboard users can scroll it with the arrow keys. It is a group named by `title`, or “Code” (`labels.code`).',
    'The copy button is named “Copy code” and announces “Copied”, as in Copy Button.',
    'Line numbers are hidden from screen readers and from selection, so selected code copies as written. Marked lines are a visual cue only.',
    'On iOS and Android each line is read on its own, and long lines scroll sideways in a scroll view.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the copy button, then to the code (web).' },
    { keys: 'Arrow keys', action: 'Scroll the focused code (web).' },
  ],
  platformNotes: {
    web: 'Long lines scroll sideways inside the block; `maxHeight` scrolls both ways in one box.',
    ios: 'Lines are selectable text. Copying needs `setClipboard` (see Copy Button).',
    android:
      'Lines are selectable text. Copying needs `setClipboard` (see Copy Button). The code scrolls inside a scrolling screen (`nestedScrollEnabled`).',
  },
  related: ['copy-button', 'typography', 'scroll-area'],
})
