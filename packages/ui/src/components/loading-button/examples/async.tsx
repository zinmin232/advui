import { LoadingButton, Text, VStack } from '@advui/core'
import { useState } from 'react'

// Stands in for a real request, e.g. saving a 5W activity.
const saveActivity = () => new Promise((resolve) => setTimeout(resolve, 1500))

export default function LoadingButtonAsync() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(0)

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveActivity()
      setSaved((count) => count + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <VStack gap="$2" alignItems="flex-start">
      <LoadingButton loading={loading} loadingText="Saving…" onPress={handleSave}>
        Save activity
      </LoadingButton>
      {/* Presses while saving are ignored, so this counts each save once. */}
      <Text size="sm" tone="muted" aria-live="polite">
        {saved === 0 ? 'Not saved yet.' : `Saved ${saved} time${saved === 1 ? '' : 's'}.`}
      </Text>
    </VStack>
  )
}
