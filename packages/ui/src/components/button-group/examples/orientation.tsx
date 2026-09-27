import { Button, ButtonGroup, HStack, IconButton } from '@advui/core'
import { MinusIcon, PlusIcon } from '@advui/icons'

export default function ButtonGroupOrientation() {
  return (
    <HStack gap="$6" alignItems="center">
      <ButtonGroup aria-label="Zoom" orientation="vertical" variant="outline" size="sm">
        <IconButton aria-label="Zoom in" icon={<PlusIcon />} />
        <IconButton aria-label="Zoom out" icon={<MinusIcon />} />
      </ButtonGroup>
      {/* attached={false}: related actions, spaced apart. */}
      <ButtonGroup aria-label="Form actions" attached={false}>
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </ButtonGroup>
    </HStack>
  )
}
