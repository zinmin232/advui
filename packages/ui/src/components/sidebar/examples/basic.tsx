import { Avatar, Badge, HStack, Sidebar, Text, VStack, useSidebar } from '@advui/core'
import { BarChartIcon, FileIcon, HomeIcon, SettingsIcon, UsersIcon } from '@advui/icons'
import { useState } from 'react'

function Brand() {
  const { collapsed } = useSidebar()
  return collapsed ? null : (
    <Text weight="semibold" flex={1}>
      Adv Data
    </Text>
  )
}

function Account() {
  const { collapsed } = useSidebar()
  return (
    <HStack gap="$2" alignItems="center" justifyContent={collapsed ? 'center' : 'flex-start'}>
      <Avatar size="sm" alt="Nwe Ni" />
      {collapsed ? null : (
        <VStack flex={1} minWidth={0}>
          <Text size="sm" weight="medium" truncate>
            Nwe Ni
          </Text>
          <Text size="xs" tone="muted" truncate>
            Data officer
          </Text>
        </VStack>
      )}
    </HStack>
  )
}

const pages = [
  { id: 'home', label: 'Dashboard', icon: <HomeIcon /> },
  { id: 'reports', label: 'Reports', icon: <BarChartIcon />, badge: '3' },
  { id: 'partners', label: 'Partners', icon: <UsersIcon /> },
]

export default function SidebarBasic() {
  const [page, setPage] = useState('home')
  return (
    <HStack
      height="$112"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
      overflow="hidden"
      width="100%"
    >
      <Sidebar aria-label="App">
        <Sidebar.Header>
          <Brand />
          <Sidebar.Toggle />
        </Sidebar.Header>
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
          <Sidebar.Group label="Library">
            <Sidebar.Item icon={<FileIcon />} badge={<Badge size="sm">New</Badge>}>
              Publications
            </Sidebar.Item>
            <Sidebar.Item icon={<SettingsIcon />} disabled>
              Admin
            </Sidebar.Item>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>
          <Account />
        </Sidebar.Footer>
      </Sidebar>
      <VStack flex={1} padding="$6" gap="$2">
        <Text size="xl" weight="semibold">
          {pages.find((p) => p.id === page)?.label}
        </Text>
        <Text tone="muted">Collapse the sidebar with the arrow button.</Text>
      </VStack>
    </HStack>
  )
}
