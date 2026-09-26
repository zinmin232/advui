import { Badge, HStack } from '@adv-ui/core'
import { CheckIcon, StarIcon } from '@adv-ui/icons'

export default function BadgeWithIcon() {
  return (
    <HStack gap="$2">
      <Badge variant="success" icon={<CheckIcon />}>
        Verified
      </Badge>
      <Badge variant="secondary" size="sm" icon={<StarIcon />}>
        Featured
      </Badge>
    </HStack>
  )
}
