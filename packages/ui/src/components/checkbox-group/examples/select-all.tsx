import { CheckboxGroup, Text, VStack } from '@advui/core'
import { useState } from 'react'

const channels = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push notifications' },
]

export default function CheckboxGroupSelectAll() {
  const [value, setValue] = useState(['email'])
  return (
    <VStack gap="4">
      <CheckboxGroup aria-label="Notifications" value={value} onValueChange={setValue}>
        <CheckboxGroup.SelectAll label="All channels" />
        <VStack gap="3" paddingLeft="6">
          {channels.map((channel) => (
            <CheckboxGroup.Item key={channel.value} {...channel} />
          ))}
        </VStack>
      </CheckboxGroup>
      <Text size="sm" tone="muted">
        {value.length} of {channels.length} selected
      </Text>
    </VStack>
  )
}
