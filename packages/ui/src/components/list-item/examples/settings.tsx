import { List, ListItem, Switch, toast } from '@advui/core'
import { BellIcon, ChevronRightIcon, GlobeIcon, LockIcon, StarIcon } from '@advui/icons'
import { useState } from 'react'

export default function ListItemSettings() {
  const [email, setEmail] = useState(true)

  // ListItem and List.Item are the same component; List adds the dividers.
  return (
    <List variant="outline" divided width="100%" maxWidth="$128">
      <ListItem
        leading={<BellIcon />}
        title="Email notifications"
        description="Receive updates by email"
        // The row has no onPress, so the switch can sit in `trailing`.
        trailing={
          <Switch aria-label="Email notifications" checked={email} onCheckedChange={setEmail} />
        }
      />
      <ListItem
        leading={<LockIcon />}
        title="Privacy"
        description="Manage your privacy preferences"
        trailing={<ChevronRightIcon />}
        onPress={() => toast('Privacy')}
      />
      <ListItem
        leading={<GlobeIcon />}
        title="Language"
        trailing="English"
        onPress={() => toast('Language')}
      />
      <ListItem
        leading={<StarIcon />}
        title="Advanced features"
        description="Currently unavailable"
        disabled
        onPress={() => toast('Advanced features')}
      />
    </List>
  )
}
