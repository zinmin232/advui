import { Card, NavigationBar, Text, VStack } from '@advui/core'
import { BellIcon, HomeIcon, SearchIcon, UserIcon } from '@advui/icons'
import { useState } from 'react'

const titles: Record<string, string> = {
  home: 'Home',
  search: 'Search',
  inbox: 'Inbox',
  profile: 'Profile',
}

export default function NavigationBarBasic() {
  const [tab, setTab] = useState('home')
  return (
    // A card stands in for the phone screen; in an app the bar sits at the bottom.
    <Card width="100%" maxWidth="$96" overflow="hidden">
      <VStack height="$40" padding="$4" gap="$1">
        <Text size="lg" weight="semibold">
          {titles[tab]}
        </Text>
        <Text size="sm" tone="muted">
          Pick a destination below.
        </Text>
      </VStack>
      <NavigationBar value={tab} onValueChange={setTab} aria-label="Main">
        <NavigationBar.Item value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBar.Item value="search" icon={<SearchIcon />} label="Search" />
        <NavigationBar.Item value="inbox" icon={<BellIcon />} label="Inbox" badge={3} />
        <NavigationBar.Item value="profile" icon={<UserIcon />} label="Profile" badge />
      </NavigationBar>
    </Card>
  )
}
