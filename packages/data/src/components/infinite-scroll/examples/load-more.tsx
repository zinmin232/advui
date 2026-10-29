import { Separator, Text, VStack } from '@advui/core'
import { InfiniteScroll } from '@advui/data'
import { Fragment, useEffect, useRef, useState } from 'react'

const comments = [
  'The township totals match the July sheet now.',
  'Can we add the partner names to the map legend?',
  'Uploaded the corrected file.',
  'Thanks, that fixed the duplicate rows.',
  'Reviewed: ready to publish.',
]

const pageSize = 5

const page = (n: number) =>
  Array.from({ length: pageSize }, (_, i) => {
    const index = n * pageSize + i
    return { id: index, text: comments[index % comments.length]!, number: index + 1 }
  })

export default function InfiniteScrollLoadMore() {
  const [items, setItems] = useState(() => page(0))
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <InfiniteScroll
      aria-label="Comments"
      width="100%"
      maxWidth="96"
      mode="button"
      loadMoreLabel="Load more comments"
      hasMore={items.length < 20}
      loading={loading}
      onLoadMore={() => {
        setLoading(true)
        timer.current = setTimeout(() => {
          setItems((current) => [...current, ...page(current.length / pageSize)])
          setLoading(false)
        }, 800)
      }}
      endMessage="No more comments"
    >
      {items.map((item) => (
        <Fragment key={item.id}>
          <VStack gap="0-5" paddingVertical="2">
            <Text size="xs" tone="muted">
              Comment {item.number}
            </Text>
            <Text size="sm">{item.text}</Text>
          </VStack>
          <Separator />
        </Fragment>
      ))}
    </InfiniteScroll>
  )
}
