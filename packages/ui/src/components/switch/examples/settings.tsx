import { HStack, Label, Separator, Switch, Text, VStack } from '@adv-ui/core'
import { useState } from 'react'

export default function SwitchSettings() {
  const [push, setPush] = useState(true)
  const [marketing, setMarketing] = useState(false)
  return (
    <VStack gap="$3" width="100%" maxWidth="$96">
      <HStack justifyContent="space-between" gap="$4">
        <VStack flex={1}>
          <Label htmlFor="sw-push">Push notifications</Label>
          <Text size="sm" tone="muted">
            Order updates and mentions.
          </Text>
        </VStack>
        <Switch id="sw-push" checked={push} onCheckedChange={setPush} />
      </HStack>
      <Separator />
      <HStack justifyContent="space-between" gap="$4">
        <VStack flex={1}>
          <Label htmlFor="sw-marketing">Marketing emails</Label>
          <Text size="sm" tone="muted">
            Product news, at most once a month.
          </Text>
        </VStack>
        <Switch id="sw-marketing" size="sm" checked={marketing} onCheckedChange={setMarketing} />
      </HStack>
    </VStack>
  )
}
