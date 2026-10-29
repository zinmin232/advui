import { Field, VStack } from '@advui/core'
import { MarkdownEditor } from '@advui/editor'
import { useState } from 'react'

const initial = `## Situation update

Flooding in **Labutta** and **Bogale** since 12 August. Needs reported by partners:

- Drinking water
- Hygiene kits
- Temporary shelter

See the [MIMU township profiles](https://themimu.info) for baseline data.`

export default function MarkdownEditorBasic() {
  const [value, setValue] = useState(initial)
  return (
    <VStack width="100%" maxWidth="144">
      <Field label="Report" description="Markdown is supported. Use Preview to check it.">
        <MarkdownEditor value={value} onValueChange={setValue} maxLength={1000} />
      </Field>
    </VStack>
  )
}
