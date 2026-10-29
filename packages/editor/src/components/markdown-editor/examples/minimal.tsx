import { MarkdownEditor } from '@advui/editor'

export default function MarkdownEditorMinimal() {
  return (
    <MarkdownEditor
      aria-label="Comment"
      placeholder="Write a comment…"
      tools={['bold', 'italic', 'link', 'bulletList']}
      minHeight="20"
    />
  )
}
