import { Button, ErrorState } from '@advui/core'
import { useState } from 'react'

export default function ErrorStateBasic() {
  const [retrying, setRetrying] = useState(false)
  return (
    <ErrorState
      title="Couldn’t load invoices"
      description="Check your connection and try again."
      retrying={retrying}
      onRetry={() => {
        setRetrying(true)
        setTimeout(() => setRetrying(false), 1500)
      }}
      width="100%"
    >
      <Button variant="ghost">Contact support</Button>
    </ErrorState>
  )
}
