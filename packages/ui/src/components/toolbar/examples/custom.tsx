import { Button, Toolbar } from '@advui/core'
import { CheckIcon } from '@advui/icons'

// Style props win over the variant and size, whatever their order.
export default function ToolbarCustom() {
  return (
    <Toolbar
      aria-label="Draft"
      variant="outline"
      backgroundColor="$card"
      borderColor="$primary"
      borderRadius="$full"
      paddingHorizontal="$3"
      gap="$1"
      alignSelf="center"
    >
      <Button size="sm" variant="ghost">
        Discard
      </Button>
      <Button size="sm" variant="outline">
        Preview
      </Button>
      <Button size="sm" icon={<CheckIcon />}>
        Publish
      </Button>
    </Toolbar>
  )
}
