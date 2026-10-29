import { Field, VStack } from '@advui/core'
import { RichTextEditor } from '@advui/editor'
import { useState } from 'react'

const initial =
  '<h2>Situation update</h2>' +
  '<p>Flooding in <strong>Labutta</strong> and <strong>Bogale</strong> since 12 August. Needs reported by partners:</p>' +
  '<ul><li><p>Drinking water</p></li><li><p>Hygiene kits</p></li><li><p>Temporary shelter</p></li></ul>' +
  '<p>See the <a href="https://themimu.info">MIMU township profiles</a> for baseline data.</p>'

export default function RichTextEditorBasic() {
  const [value, setValue] = useState(initial)
  return (
    <VStack width="100%" maxWidth="144">
      <Field label="Report" description="Select text, then pick a format from the toolbar.">
        <RichTextEditor value={value} onValueChange={setValue} />
      </Field>
    </VStack>
  )
}
