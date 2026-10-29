# @advui/editor

Text editing for [Adv UI](https://github.com/zinmin232/advui), on web, iOS
and Android, with two editors:

- **`RichTextEditor`** is a WYSIWYG editor: the text shows bold, headings,
  lists, quotes and links as it is written. It saves HTML. On web it is
  [TipTap](https://tiptap.dev); on iOS and Android TipTap runs in a WebView
  ([TenTap](https://github.com/10play/10tap-editor)), under the same
  toolbar. `RichTextContent` shows the saved HTML with Adv UI's styles,
  drawing it as views, so nothing in it runs.
- **`MarkdownEditor`** edits Markdown in core's Textarea, with a formatting
  toolbar, keyboard shortcuts, a preview and a character count. It needs no
  editor engine. `MarkdownContent` shows the Markdown with the same styles.

Both viewers keep only `http(s)` and `mailto` links.

```bash
pnpm add @advui/editor @advui/core @advui/theme @advui/icons tamagui
# iOS and Android, for Rich Text Editor (Expo Go includes it):
npx expo install react-native-webview
```

```tsx
import { MarkdownEditor, RichTextContent, RichTextEditor } from '@advui/editor'

<RichTextEditor aria-label="Report" value={html} onValueChange={setHtml} />
<RichTextContent>{html}</RichTextContent>

<MarkdownEditor aria-label="Comment" value={markdown} onValueChange={setMarkdown} />
```

The editors render inside the app's `UniversalProvider` from `@advui/core`,
which is a peer dependency, as are `react`, `react-native` and `tamagui`.
`react-native-webview` is an optional peer dependency: only Rich Text Editor
on iOS and Android needs it.

**Exports:** RichTextEditor, RichTextContent, `defaultRichTextTools`,
`parseHtml`, MarkdownEditor, MarkdownContent, `defaultMarkdownTools`,
`applyFormat`, `parseMarkdown` and their types.

**Metadata:** `@advui/editor/meta` exports `components`, the metadata of these
components (types in `@advui/core/meta`), for tools such as the AdvUI Builder.

Docs: https://zinmin232.github.io/advui/docs/components/rich-text-editor and
https://zinmin232.github.io/advui/docs/components/markdown-editor. License: MIT.
