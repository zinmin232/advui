import { Text, VStack } from '@advui/core'
import { VirtualList } from '@advui/data'

const people = ['Thiri', 'Kyaw Zin', 'May', 'Htet']
const notes = [
  'Sent the township figures.',
  'The Bago sheet needs one more column before we can merge it with the others, and the dates in it are in two formats.',
  'Can we move the review to Thursday?',
  'Uploaded the new map. It has the camps from the last round, and the roads the cluster asked for are on their own layer so they can be hidden.',
  'Thanks!',
]

const messages = Array.from({ length: 500 }, (_, i) => ({
  id: `m-${i}`,
  from: people[i % people.length]!,
  text: notes[(i * 3) % notes.length]!,
}))

export default function VirtualListMeasured() {
  return (
    <VirtualList
      aria-label="Messages"
      height="80"
      width="100%"
      maxWidth="96"
      borderWidth={1}
      borderColor="border"
      borderRadius="lg"
      data={messages}
      // No itemHeight: each message is as tall as its text wraps to.
      estimatedItemHeight={64}
      getItemKey={(message) => message.id}
      renderItem={(message) => (
        <VStack gap="0-5" paddingHorizontal="4" paddingVertical="2-5">
          <Text size="sm" weight="medium">
            {message.from}
          </Text>
          <Text size="sm" tone="muted">
            {message.text}
          </Text>
        </VStack>
      )}
    />
  )
}
