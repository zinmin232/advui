import { HStack, Text, VStack } from '@advui/core'
import { VirtualList } from '@advui/data'

const clients = ['Shwe Taung', 'Golden Lotus', 'Irrawaddy Trading', 'Mandalay Print', 'Yoma Foods']

const invoices = Array.from({ length: 10_000 }, (_, i) => ({
  id: `INV-${String(i + 1).padStart(5, '0')}`,
  client: clients[i % clients.length]!,
  amount: ((i * 7919) % 90_000) / 100 + 100,
}))

export default function VirtualListBasic() {
  return (
    <VirtualList
      aria-label="Invoices"
      height="80"
      width="100%"
      maxWidth="112"
      borderWidth={1}
      borderColor="border"
      borderRadius="lg"
      data={invoices}
      itemHeight={56}
      getItemKey={(invoice) => invoice.id}
      renderItem={(invoice) => (
        <HStack
          height="100%"
          alignItems="center"
          justifyContent="space-between"
          gap="3"
          paddingHorizontal="4"
          borderBottomWidth={1}
          borderColor="border"
        >
          <VStack flexShrink={1}>
            <Text size="sm" weight="medium">
              {invoice.id}
            </Text>
            <Text size="xs" tone="muted" truncate>
              {invoice.client}
            </Text>
          </VStack>
          <Text size="sm">${invoice.amount.toFixed(2)}</Text>
        </HStack>
      )}
    />
  )
}
