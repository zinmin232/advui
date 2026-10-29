import { HStack, Text, VStack } from '@advui/core'
import { VirtualList } from '@advui/data'

type Row =
  | { kind: 'day'; id: string; label: string }
  | { kind: 'message'; id: string; from: string; text: string }

const people = ['Thiri', 'Kyaw Zin', 'May', 'Htet']
const notes = [
  'Sent the township figures.',
  'The Bago sheet needs one more column.',
  'Can we move the review to Thursday?',
  'Uploaded the new map.',
]

// Each day: a heading, then six messages.
const rows: Row[] = Array.from({ length: 60 }, (_, day) => [
  { kind: 'day' as const, id: `day-${day}`, label: `October ${(day % 30) + 1}` },
  ...Array.from({ length: 6 }, (_, i) => ({
    kind: 'message' as const,
    id: `m-${day}-${i}`,
    from: people[(day + i) % people.length]!,
    text: notes[(day * 3 + i) % notes.length]!,
  })),
]).flat()

export default function VirtualListVariableHeights() {
  return (
    <VirtualList
      aria-label="Messages"
      height="80"
      width="100%"
      maxWidth="96"
      borderWidth={1}
      borderColor="border"
      borderRadius="lg"
      data={rows}
      itemHeight={(index) => (rows[index]!.kind === 'day' ? 32 : 60)}
      getItemKey={(row) => row.id}
      renderItem={(row) =>
        row.kind === 'day' ? (
          <HStack height="100%" alignItems="center" paddingHorizontal="4" backgroundColor="muted">
            <Text size="xs" weight="semibold" tone="muted">
              {row.label}
            </Text>
          </HStack>
        ) : (
          <VStack height="100%" justifyContent="center" paddingHorizontal="4">
            <Text size="sm" weight="medium">
              {row.from}
            </Text>
            <Text size="sm" tone="muted" truncate>
              {row.text}
            </Text>
          </VStack>
        )
      }
    />
  )
}
