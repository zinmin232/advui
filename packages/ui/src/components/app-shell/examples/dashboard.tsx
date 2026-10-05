import { AppShell, AutoGrid, Avatar, Card, IconButton, Sidebar, Text } from '@advui/core'
import { BarChartIcon, BellIcon, HomeIcon, SettingsIcon, UsersIcon } from '@advui/icons'
import { useState } from 'react'

const pages = [
  { id: 'home', label: 'Overview', icon: <HomeIcon /> },
  { id: 'reports', label: 'Reports', icon: <BarChartIcon />, badge: '3' },
  { id: 'partners', label: 'Partners', icon: <UsersIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
]

const stats = [
  { label: 'Active sites', value: '128' },
  { label: 'Partners', value: '42' },
  { label: 'Reports due', value: '7' },
  { label: 'Households reached', value: '18.4k' },
]

export default function AppShellDashboard() {
  const [page, setPage] = useState('home')
  return (
    // `height`, the border and `safeArea={false}` fit the shell into the preview. In an app,
    // leave them out: the shell fills the screen and clears the notch and home indicator.
    <AppShell
      height="$112"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
      safeArea={false}
    >
      <AppShell.Header>
        <AppShell.SidebarTrigger />
        <Text weight="semibold" flex={1}>
          Adv Data
        </Text>
        <IconButton icon={<BellIcon />} aria-label="Notifications" />
        <Avatar size="sm" alt="Nwe Ni" />
      </AppShell.Header>
      <AppShell.Sidebar aria-label="Main">
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Group label="Workspace">
              {pages.map((item) => (
                <Sidebar.Item
                  key={item.id}
                  icon={item.icon}
                  badge={item.badge}
                  active={page === item.id}
                  onPress={() => setPage(item.id)}
                >
                  {item.label}
                </Sidebar.Item>
              ))}
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </AppShell.Sidebar>
      <AppShell.Main padding="$6" gap="$4">
        <Text size="xl" weight="semibold">
          {pages.find((item) => item.id === page)?.label}
        </Text>
        <AutoGrid minChildWidth={160} gap="$3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <Card.Header>
                <Card.Description>{stat.label}</Card.Description>
                <Card.Title>{stat.value}</Card.Title>
              </Card.Header>
            </Card>
          ))}
        </AutoGrid>
        <Text tone="muted">
          On a phone the sidebar moves into a drawer: open it with the menu button.
        </Text>
      </AppShell.Main>
      <AppShell.Footer>
        <Text size="xs" tone="muted">
          Synced 2 minutes ago
        </Text>
      </AppShell.Footer>
    </AppShell>
  )
}
