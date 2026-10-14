import { Alert, VStack } from '@advui/core'
import { StarIcon, TrendingUpIcon } from '@advui/icons'

export default function AlertCustom() {
  return (
    <VStack gap="$3" width="100%">
      <Alert
        icon={<StarIcon />}
        title="New: shared workspaces"
        description="Invite your team and work on the same projects."
        backgroundColor="$primary"
        borderColor="$primary"
        color="$primaryForeground"
        borderRadius="$xl"
      />
      <Alert
        size="sm"
        icon={<TrendingUpIcon />}
        title="Tip"
        description="Sort by the last column to see this week's growth."
        backgroundColor="$muted"
        borderWidth={0}
      />
    </VStack>
  )
}
