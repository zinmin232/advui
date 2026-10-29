import { Avatar, HStack, Text, VStack } from '@advui/core'
import { InfiniteScroll } from '@advui/data'
import { useEffect, useRef, useState } from 'react'

const people = ['Thiri Aung', 'Kyaw Zin', 'May Phyu', 'Htet Naing', 'Su Su']
const actions = ['updated the Bago sheet', 'commented on the 5W round', 'uploaded a map', 'closed a task']

const pageSize = 12
const pages = 4

const page = (n: number) =>
  Array.from({ length: pageSize }, (_, i) => {
    const index = n * pageSize + i
    return {
      id: index,
      who: people[index % people.length]!,
      what: actions[(index * 3) % actions.length]!,
      when: `${index + 2} min ago`,
    }
  })

export default function InfiniteScrollBasic() {
  const [items, setItems] = useState(() => page(0))
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const loadMore = () => {
    setLoading(true)
    // Stands in for a request to your API.
    timer.current = setTimeout(() => {
      setItems((current) => [...current, ...page(current.length / pageSize)])
      setLoading(false)
    }, 800)
  }

  return (
    <InfiniteScroll
      aria-label="Activity"
      height="80"
      width="100%"
      maxWidth="96"
      borderWidth={1}
      borderColor="border"
      borderRadius="lg"
      hasMore={items.length < pageSize * pages}
      loading={loading}
      onLoadMore={loadMore}
      endMessage="You're all caught up"
    >
      {items.map((item) => (
        <HStack key={item.id} gap="3" alignItems="center" paddingHorizontal="4" paddingVertical="2-5">
          {/* The name follows in text. */}
          <Avatar
            size="sm"
            fallback={item.who
              .split(' ')
              .map((part) => part[0])
              .join('')}
            aria-hidden
          />
          <VStack flexShrink={1}>
            <Text size="sm">
              <Text size="sm" weight="medium">
                {item.who}
              </Text>{' '}
              {item.what}
            </Text>
            <Text size="xs" tone="muted">
              {item.when}
            </Text>
          </VStack>
        </HStack>
      ))}
    </InfiniteScroll>
  )
}
