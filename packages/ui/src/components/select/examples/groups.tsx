import { Select, VStack } from '@adv-ui/core'

export default function SelectGroups() {
  return (
    <VStack width="100%" maxWidth="$64">
      <Select aria-label="Timezone" placeholder="Select a timezone">
        <Select.Group label="Asia">
          <Select.Item value="yangon">Yangon (UTC+6:30)</Select.Item>
          <Select.Item value="bangkok">Bangkok (UTC+7)</Select.Item>
          <Select.Item value="tokyo">Tokyo (UTC+9)</Select.Item>
        </Select.Group>
        <Select.Group label="Europe">
          <Select.Item value="london">London (UTC+0)</Select.Item>
          <Select.Item value="berlin">Berlin (UTC+1)</Select.Item>
        </Select.Group>
      </Select>
    </VStack>
  )
}
