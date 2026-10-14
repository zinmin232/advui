import { LoadingState } from '@advui/core'

export default function LoadingStateBasic() {
  return (
    <LoadingState
      title="Loading invoices…"
      description="This can take a few seconds."
      width="100%"
    />
  )
}
