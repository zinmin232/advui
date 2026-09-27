import { Button, Input, Label, Sheet, VStack, toast } from '@advui/core'
import { EditIcon } from '@advui/icons'
import { useState } from 'react'

export default function SheetBasic() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger>
        <Button variant="outline" icon={<EditIcon />}>
          Edit profile
        </Button>
      </Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>Edit profile</Sheet.Title>
          <Sheet.Description>Your name and username are visible to your team.</Sheet.Description>
        </Sheet.Header>
        <VStack gap="$2">
          <Label htmlFor="sheet-name">Name</Label>
          <Input id="sheet-name" defaultValue="Ada Lovelace" />
        </VStack>
        <VStack gap="$2">
          <Label htmlFor="sheet-username">Username</Label>
          <Input id="sheet-username" defaultValue="ada" autoCapitalize="none" />
        </VStack>
        <Sheet.Footer>
          <Sheet.Close>
            <Button variant="outline">Cancel</Button>
          </Sheet.Close>
          <Button
            onPress={() => {
              setOpen(false)
              toast.success('Profile saved')
            }}
          >
            Save changes
          </Button>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  )
}
