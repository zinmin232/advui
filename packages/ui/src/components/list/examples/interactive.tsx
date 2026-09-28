import { List, toast } from '@advui/core'
import { BellIcon, ChevronRightIcon, LockIcon, UserIcon } from '@advui/icons'

const settings = [
  { title: 'Account', description: 'Name, email and photo', icon: <UserIcon /> },
  { title: 'Notifications', description: 'Email and push alerts', icon: <BellIcon /> },
  { title: 'Privacy', description: 'Who can see your activity', icon: <LockIcon /> },
]

export default function ListInteractive() {
  return (
    <List variant="outline" divided width="100%" maxWidth="$96">
      {settings.map((item) => (
        <List.Item
          key={item.title}
          leading={item.icon}
          title={item.title}
          description={item.description}
          trailing={<ChevronRightIcon />}
          onPress={() => toast(`Opening ${item.title}…`)}
        />
      ))}
      <List.Item
        leading={<LockIcon />}
        title="Security keys"
        description="Available on the Pro plan"
        disabled
        onPress={() => {}}
      />
    </List>
  )
}
