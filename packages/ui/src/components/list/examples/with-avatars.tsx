import { Avatar, Badge, IconButton, List } from '@advui/core'
import { MailIcon } from '@advui/icons'

const team = [
  { name: 'Aung Kyaw', role: 'Field coordinator', status: 'Online' },
  { name: 'Nwe Ni', role: 'Data officer', status: 'Away' },
  { name: 'Hla Min', role: 'Programme manager', status: 'Online' },
]

export default function ListWithAvatars() {
  return (
    <List divided size="sm" width="100%" maxWidth="$96">
      {team.map((person) => (
        <List.Item
          key={person.name}
          leading={<Avatar size="sm" alt={person.name} />}
          title={person.name}
          description={person.role}
          trailing={
            <>
              <Badge
                size="sm"
                variant={person.status === 'Online' ? 'success' : 'secondary'}
                alignSelf="center"
              >
                {person.status}
              </Badge>
              <IconButton size="sm" icon={<MailIcon />} aria-label={`Email ${person.name}`} />
            </>
          }
        />
      ))}
    </List>
  )
}
