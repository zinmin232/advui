import { Avatar, HStack, Indicator } from '@advui/core'

const team = [
  { name: 'Maya Chen', online: true },
  { name: 'Jordan Lee', online: true },
  { name: 'Sam Park', online: false },
  { name: 'Riley Quinn', online: true },
]

export default function IndicatorBasic() {
  return (
    <HStack gap="3">
      {team.map((person) => (
        // Read as “Maya Chen, image, Online”. The dot is there or not, so its
        // color is not the only thing that tells the statuses apart.
        <Indicator
          key={person.name}
          visible={person.online}
          label="Online"
          tone="success"
          placement="bottom-end"
          overlap="circle"
        >
          <Avatar alt={person.name} />
        </Indicator>
      ))}
    </HStack>
  )
}
