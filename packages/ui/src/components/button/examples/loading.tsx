import { Button, HStack } from '@advui/core'
import { useState } from 'react'

export default function ButtonLoading() {
  const [loading, setLoading] = useState(false)
  const submit = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }
  return (
    <HStack gap="$2" flexWrap="wrap">
      <Button loading={loading} onPress={submit}>
        {loading ? 'Saving…' : 'Save'}
      </Button>
      <Button variant="outline" loading>
        Please wait
      </Button>
    </HStack>
  )
}
