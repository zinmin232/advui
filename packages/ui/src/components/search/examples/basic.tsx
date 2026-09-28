import { Search, Text, VStack } from '@advui/core'
import { useState } from 'react'

export default function SearchBasic() {
  const [submitted, setSubmitted] = useState('')
  return (
    <VStack gap="$2" width="100%" maxWidth="$80">
      <Search placeholder="Search publications" onSearch={setSubmitted} />
      <Text size="sm" tone="muted">
        {submitted ? `Searched for “${submitted}”` : 'Press Enter to search.'}
      </Text>
    </VStack>
  )
}
