import { Avatar, IconButton, List, ListItem, toast } from '@advui/core'
import { MailIcon } from '@advui/icons'

const people = [
  { name: 'Aung Kyaw', email: 'aung@example.org' },
  { name: 'Nwe Ni', email: 'nwe@example.org' },
  { name: 'Hla Min', email: 'hla@example.org' },
]

export default function ListItemProfiles() {
  return (
    <List divided width="100%" maxWidth="$128">
      {people.map((person) => (
        <ListItem
          key={person.name}
          leading={<Avatar size="md" alt={person.name} />}
          title={person.name}
          description={person.email}
          onPress={() => toast(`Open ${person.name}`)}
          // Beside the row's button, not inside it: pressing it does not open the profile.
          actions={
            <IconButton
              size="sm"
              icon={<MailIcon />}
              aria-label={`Email ${person.name}`}
              onPress={() => toast(`Email ${person.name}`)}
            />
          }
        />
      ))}
    </List>
  )
}
