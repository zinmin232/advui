import { Field, TagsInput } from '@advui/core'

export default function TagsInputBasic() {
  return (
    <Field
      label="Topics"
      description="Press Enter or type a comma after each one."
      width="100%"
      maxWidth="$96"
    >
      <TagsInput defaultValue={['react', 'tamagui']} placeholder="Add a topic" />
    </Field>
  )
}
