# @advui/editor

Rich text editing for [Adv UI](https://github.com/zinmin232/advui), on web,
iOS and Android. `RichTextEditor` is a Markdown editor with a formatting
toolbar (bold, italic, strikethrough, heading, lists, quote, link, code),
keyboard shortcuts, a preview and a character count. `RichTextContent` shows
the same Markdown with the same styles; only `http(s)` and `mailto` links are
kept.

```bash
pnpm add @advui/editor @advui/core @advui/theme @advui/icons tamagui
```

```tsx
import { RichTextContent, RichTextEditor } from '@advui/editor'

<RichTextEditor aria-label="Report" value={markdown} onValueChange={setMarkdown} />

// Show saved text:
<RichTextContent>{markdown}</RichTextContent>
```

The editor works the same on every platform and uses no editor engine: it
edits Markdown text in core's Textarea. It renders inside the app's
`UniversalProvider` from `@advui/core`, which is a peer dependency, as are
`react`, `react-native` and `tamagui`.

**Exports:** RichTextEditor, RichTextContent, `defaultRichTextTools`,
`applyFormat`, `parseMarkdown` and their types.

Docs: https://zinmin232.github.io/advui/docs/components/rich-text-editor. License: MIT.
