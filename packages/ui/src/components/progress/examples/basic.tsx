import { Button, HStack, Progress, Text, VStack } from '@adv-ui/core'
import { useEffect, useState } from 'react'

export default function ProgressBasic() {
  const [value, setValue] = useState(20)
  useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 100 : v + 10)), 700)
    return () => clearInterval(id)
  }, [])
  return (
    <VStack gap="$3" width="100%" maxWidth="$96">
      <HStack justifyContent="space-between">
        <Text size="sm">Uploading…</Text>
        <Text size="sm" tone="muted">
          {value}%
        </Text>
      </HStack>
      <Progress
        value={value}
        label="Upload progress"
        tone={value === 100 ? 'success' : 'primary'}
      />
      <Button size="sm" variant="outline" alignSelf="flex-start" onPress={() => setValue(0)}>
        Restart
      </Button>
    </VStack>
  )
}
