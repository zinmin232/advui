import { Avatar, HStack } from '@advui/core'

const people = ['Maya Chen', 'Jordan Lee', 'Sam Park', 'Riley Quinn']

export default function AvatarGroup() {
  return (
    <HStack>
      {people.map((name, index) => (
        <Avatar
          key={name}
          alt={name}
          src={`https://i.pravatar.cc/128?img=${index + 10}`}
          borderWidth={2}
          borderColor="$background"
          marginLeft={index === 0 ? 0 : '$-2'}
        />
      ))}
    </HStack>
  )
}
