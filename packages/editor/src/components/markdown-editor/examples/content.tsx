import { MarkdownContent } from '@advui/editor'

const note = `### Distribution plan

1. Register households with the village tract leader
2. Hand out _hygiene kits_ at the monastery
3. Record every distribution in the **5W** form

> Keep ~~paper lists~~ digital records only.`

export default function MarkdownEditorContent() {
  return <MarkdownContent maxWidth="144">{note}</MarkdownContent>
}
