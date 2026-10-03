import { Field, Input, Select, Switch, VStack } from '@advui/core'

export default function FieldHorizontal() {
  return (
    // The labels take the same share of each row, so the controls line up.
    <VStack gap="$4" width="100%" maxWidth={480}>
      <Field label="Username" orientation="horizontal" description="Shown on your profile.">
        <Input placeholder="ada" autoCapitalize="none" />
      </Field>
      <Field label="Plan" orientation="horizontal">
        <Select defaultValue="team">
          <Select.Item value="free">Free</Select.Item>
          <Select.Item value="team">Team</Select.Item>
          <Select.Item value="business">Business</Select.Item>
        </Select>
      </Field>
      <Field label="Email updates" orientation="horizontal">
        <Switch defaultChecked />
      </Field>
    </VStack>
  )
}
