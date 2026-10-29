import { HStack, Text } from '@advui/core'
import { InfiniteScroll } from '@advui/data'
import { useEffect, useRef, useState } from 'react'

const pageSize = 10

const page = (n: number) =>
  Array.from({ length: pageSize }, (_, i) => {
    const index = n * pageSize + i
    return { id: index, name: `Report ${String(index + 1).padStart(3, '0')}` }
  })

export default function InfiniteScrollError() {
  const [items, setItems] = useState(() => page(0))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const failedOnce = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const loadMore = () => {
    setError(null)
    setLoading(true)
    timer.current = setTimeout(() => {
      setLoading(false)
      // The second page fails the first time, as a dropped connection would.
      if (items.length === pageSize && !failedOnce.current) {
        failedOnce.current = true
        setError('Couldn’t load more reports. Check your connection.')
        return
      }
      setItems((current) => [...current, ...page(current.length / pageSize)])
    }, 800)
  }

  return (
    <InfiniteScroll
      aria-label="Reports"
      height="72"
      width="100%"
      maxWidth="80"
      borderWidth={1}
      borderColor="border"
      borderRadius="lg"
      hasMore={items.length < 40}
      loading={loading}
      error={error}
      onLoadMore={loadMore}
      endMessage="All 40 reports"
    >
      {items.map((item) => (
        <HStack key={item.id} paddingHorizontal="4" paddingVertical="2-5">
          <Text size="sm">{item.name}</Text>
        </HStack>
      ))}
    </InfiniteScroll>
  )
}
