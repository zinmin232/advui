import { Button, LoadingState } from '@advui/core'

export default function LoadingStateCancel() {
  return (
    <LoadingState
      bordered
      title="Importing contacts…"
      description="Adding 1,240 contacts. This can take a minute."
      width="100%"
    >
      <Button variant="outline">Cancel import</Button>
    </LoadingState>
  )
}
