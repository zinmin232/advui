import { Search, Text, VStack } from '@advui/core'
import { useEffect, useState } from 'react'

const townships = [
  'Hlaing Tharyar',
  'Hakha',
  'Hpa-An',
  'Mawlamyine',
  'Myitkyina',
  'Sittwe',
  'Taunggyi',
]

export default function SearchLive() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(townships)

  // A pretend request: results arrive a moment after typing stops.
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setResults(townships.filter((t) => t.toLowerCase().includes(query.toLowerCase())))
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <VStack gap="$2" width="100%" maxWidth="$80">
      <Search
        aria-label="Search townships"
        placeholder="Search townships"
        value={query}
        onValueChange={setQuery}
        loading={loading}
        size="sm"
      />
      <Text size="sm" tone="muted" aria-live="polite">
        {loading ? 'Searching…' : `${results.length} townships: ${results.join(', ') || 'none'}`}
      </Text>
    </VStack>
  )
}
