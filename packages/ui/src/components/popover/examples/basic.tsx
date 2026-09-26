import { Button, HStack, Input, Label, Popover, VStack } from '@advui/core'
import { SettingsIcon } from '@advui/icons'

export default function PopoverBasic() {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" icon={<SettingsIcon />}>
          Dimensions
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <VStack gap="$1">
          <Popover.Title>Dimensions</Popover.Title>
          <Popover.Description>Set the size of the layer in pixels.</Popover.Description>
        </VStack>
        <HStack gap="$3" alignItems="center">
          <Label htmlFor="popover-width" width="$16">
            Width
          </Label>
          <Input id="popover-width" size="sm" defaultValue="320" flex={1} />
        </HStack>
        <HStack gap="$3" alignItems="center">
          <Label htmlFor="popover-height" width="$16">
            Height
          </Label>
          <Input id="popover-height" size="sm" defaultValue="240" flex={1} />
        </HStack>
      </Popover.Content>
    </Popover>
  )
}
