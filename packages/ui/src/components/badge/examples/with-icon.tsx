import { Badge, HStack } from '@advui/core'
import { CheckIcon, StarIcon } from '@advui/icons'

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
