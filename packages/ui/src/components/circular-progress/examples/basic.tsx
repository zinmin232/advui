import { CircularProgress, HStack, Text, VStack } from '@advui/core'

const storage = [
  { name: 'Photos', used: 82, tone: 'warning' },
  { name: 'Documents', used: 45, tone: 'primary' },
  { name: 'Backups', used: 100, tone: 'success' },
] as const

export default function CircularProgressBasic() {
  return (
    <HStack gap="$6" flexWrap="wrap" justifyContent="center">
      {storage.map((item) => (
        <VStack key={item.name} gap="$2" alignItems="center">
          <CircularProgress
            size="lg"
            value={item.used}
            tone={item.tone}
            label={`${item.name} storage used`}
            showValue
          />
          <Text size="sm" tone="muted">
            {item.name}
          </Text>
        </VStack>
      ))}
    </HStack>
  )
}
