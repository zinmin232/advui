import { Button, Dialog, Input, Label, VStack } from '@advui/core'

export default function DialogBasic() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline">Edit profile</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Make changes to your profile here.</Dialog.Description>
        </Dialog.Header>
        <VStack gap="$3">
          <VStack gap="$2">
            <Label htmlFor="dlg-name">Name</Label>
            <Input id="dlg-name" defaultValue="Ada Lovelace" />
          </VStack>
          <VStack gap="$2">
            <Label htmlFor="dlg-username">Username</Label>
            <Input id="dlg-username" defaultValue="@ada" />
          </VStack>
        </VStack>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button>Save changes</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}
