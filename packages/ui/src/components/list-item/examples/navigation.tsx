import { Badge, ListItem, VStack } from '@advui/core'
import { BarChartIcon, HomeIcon, SettingsIcon, UsersIcon } from '@advui/icons'
import { type ReactNode, useState } from 'react'

const pages: { id: string; label: string; icon: ReactNode; count?: number }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { id: 'reports', label: 'Reports', icon: <BarChartIcon />, count: 3 },
  { id: 'team', label: 'Team', icon: <UsersIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
]

export default function ListItemNavigation() {
  // The parent owns which item is current; each item only shows it.
  const [active, setActive] = useState('reports')

  return (
    <VStack gap="$1" width="100%" maxWidth="$64">
      {pages.map((page) => (
        <ListItem
          key={page.id}
          size="sm"
          leading={page.icon}
          title={page.label}
          trailing={
            page.count ? (
              <Badge size="sm" variant="outline">
                {page.count}
              </Badge>
            ) : null
          }
          selected={active === page.id}
          onPress={() => setActive(page.id)}
        />
      ))}
    </VStack>
  )
}
