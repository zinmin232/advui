import { Avatar, HStack } from '@adv-ui/core'

export default function AvatarSizes() {
  return (
    <HStack gap="$3" alignItems="center">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} size={size} alt="Riley Quinn" />
      ))}
      <Avatar size="lg" shape="square" alt="Acme Inc" />
    </HStack>
  )
}
