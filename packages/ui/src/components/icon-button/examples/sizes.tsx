import { HStack, IconButton } from '@adv-ui/core'
import { BellIcon } from '@adv-ui/icons'

export default function IconButtonSizes() {
  return (
    <HStack gap="$2" alignItems="center">
      <IconButton aria-label="Notifications" variant="outline" size="sm" icon={<BellIcon />} />
      <IconButton aria-label="Notifications" variant="outline" size="md" icon={<BellIcon />} />
      <IconButton aria-label="Notifications" variant="outline" size="lg" icon={<BellIcon />} />
    </HStack>
  )
}
