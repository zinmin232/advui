import { RichTextEditor } from '@advui/editor'

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
