import { HStack, Spinner, Text } from '@advui/core'
import { VirtualList } from '@advui/data'
import { useEffect, useRef, useState } from 'react'

const pageSize = 30
const lastPage = 5

const page = (n: number) =>
  Array.from({ length: pageSize }, (_, i) => {
    const index = n * pageSize + i
    return { id: index, text: `Order ${String(4800 - index).padStart(4, '0')} shipped` }
  })

export default function VirtualListLoadMore() {
  const [orders, setOrders] = useState(() => page(0))
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const done = orders.length >= pageSize * lastPage
  const loadMore = () => {
    if (loading || done) return
    setLoading(true)
    // Stands in for a request to your API.
    timer.current = setTimeout(() => {
      setOrders((current) => [...current, ...page(current.length / pageSize)])
      setLoading(false)
    }, 800)
  }

  return (
    <VirtualList
      aria-label="Shipped orders"
      aria-busy={loading}
      height="80"
      width="100%"
      maxWidth="96"
      borderWidth={1}
      borderColor="border"
      borderRadius="lg"
      data={orders}
      itemHeight={44}
      getItemKey={(order) => order.id}
      onEndReached={loadMore}
      renderItem={(order) => (
        <HStack height="100%" alignItems="center" paddingHorizontal="4">
          <Text size="sm">{order.text}</Text>
        </HStack>
      )}
      footer={
        // A set height, so the list does not jump when the spinner shows.
        <HStack justifyContent="center" alignItems="center" gap="2" height="12">
          {loading ? <Spinner size="sm" aria-hidden /> : null}
          {loading || done ? (
            <Text size="sm" tone="muted">
              {loading ? 'Loading more orders…' : 'All 150 orders'}
            </Text>
          ) : null}
        </HStack>
      }
    />
  )
}
