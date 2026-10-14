import { Alert, Button } from '@advui/core'

export default function AlertActions() {
  return (
    <Alert
      variant="warning"
      title="Unsaved changes"
      description="You have changes that have not been saved. They are lost if you leave this page."
      actions={
        <>
          <Button size="sm">Save changes</Button>
          <Button size="sm" variant="outline">
            Discard
          </Button>
        </>
      }
      width="100%"
    />
  )
}
