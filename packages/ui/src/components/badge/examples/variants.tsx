import { Badge, HStack } from '@adv-ui/core'

export default function BadgeVariants() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Paid</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="info">New</Badge>
      <Badge variant="destructive">Overdue</Badge>
    </HStack>
  )
}
