import { Avatar, HStack } from '@adv-ui/core'

export default function AvatarBasic() {
  return (
    <HStack gap="$3">
      <Avatar src="https://i.pravatar.cc/128?img=47" alt="Maya Chen" />
      <Avatar alt="Jordan Lee" />
      <Avatar src="https://invalid.example/broken.png" alt="Sam Park" />
    </HStack>
  )
}
