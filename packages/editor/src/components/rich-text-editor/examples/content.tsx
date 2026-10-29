import { RichTextContent } from '@advui/editor'

const note =
  '<h3>Distribution plan</h3>' +
  '<ol><li><p>Register households with the village tract leader</p></li>' +
  '<li><p>Hand out <em>hygiene kits</em> at the monastery</p></li>' +
  '<li><p>Record every distribution in the <strong>5W</strong> form</p></li></ol>' +
  '<blockquote><p>Keep <s>paper lists</s> <u>digital records</u> only.</p></blockquote>'

export default function RichTextEditorContent() {
  return <RichTextContent maxWidth="144">{note}</RichTextContent>
}
