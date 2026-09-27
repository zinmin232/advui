import { Box, Button, Collapsible, HStack, Input, Label, Switch, Text, VStack } from '@advui/core'
import { ChevronDownIcon } from '@advui/icons'
import { useState } from 'react'

export default function CollapsibleSettings() {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen} gap="$3" width="100%" maxWidth="$80">
      <VStack gap="$1.5">
        <Label htmlFor="clp-name">Project name</Label>
        <Input id="clp-name" defaultValue="Atlas" />
      </VStack>
      <Collapsible.Trigger>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="flex-start"
          iconAfter={
            <Box rotate={open ? '180deg' : '0deg'}>
              <ChevronDownIcon />
            </Box>
          }
        >
          Advanced options
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content gap="$3">
        <VStack gap="$1.5">
          <Label htmlFor="clp-slug">URL slug</Label>
          <Input id="clp-slug" defaultValue="atlas" />
        </VStack>
        <HStack justifyContent="space-between" gap="$4">
          <VStack flex={1}>
            <Label htmlFor="clp-private">Private project</Label>
            <Text size="sm" tone="muted">
              Only invited members can see it.
            </Text>
          </VStack>
          <Switch id="clp-private" defaultChecked />
        </HStack>
      </Collapsible.Content>
    </Collapsible>
  )
}
