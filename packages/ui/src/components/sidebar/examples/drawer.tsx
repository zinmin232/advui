import { Button, Drawer, Sidebar } from '@advui/core'
import { HomeIcon, MenuIcon, SettingsIcon, UsersIcon } from '@advui/icons'
import { useState } from 'react'

const pages = [
  { id: 'home', label: 'Dashboard', icon: <HomeIcon /> },
  { id: 'partners', label: 'Partners', icon: <UsersIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
]

// On phones the sidebar lives in a drawer: same items, opened from a menu button.
export default function SidebarDrawer() {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState('home')
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="outline" icon={<MenuIcon />}>
          Menu
        </Button>
      </Drawer.Trigger>
      <Drawer.Content side="left" size="sm">
        <Drawer.Title position="absolute" opacity={0}>
          Navigation
        </Drawer.Title>
        <Sidebar aria-label="App" width="100%" borderRightWidth={0}>
          <Sidebar.Content>
            <Sidebar.Group label="Workspace">
              {pages.map((item) => (
                <Sidebar.Item
                  key={item.id}
                  icon={item.icon}
                  active={page === item.id}
                  onPress={() => {
                    setPage(item.id)
                    setOpen(false)
                  }}
                >
                  {item.label}
                </Sidebar.Item>
              ))}
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </Drawer.Content>
    </Drawer>
  )
}
