import { RichTextEditor } from '@advui/core'

export default function RichTextEditorMinimal() {
  return (
    <RichTextEditor
      aria-label="Comment"
      placeholder="Write a comment…"
      tools={['bold', 'italic', 'link', 'bulletList']}
      minHeight="$20"
    />
  )
}
