import { Text, VStack } from '@advui/core'

const tones = ['default', 'muted', 'primary', 'success', 'warning', 'error', 'info'] as const

export default function TypographyTones() {
  return (
    <VStack gap="$1">
      {tones.map((tone) => (
        <Text key={tone} tone={tone} weight="medium">
          {tone} text
        </Text>
      ))}
    </VStack>
  )
}
