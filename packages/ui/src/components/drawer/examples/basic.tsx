import { Button, Drawer, Menu, Text } from '@advui/core'
import { HomeIcon, MenuIcon, SettingsIcon, UsersIcon } from '@advui/icons'
import { useState } from 'react'

export default function DrawerBasic() {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState('home')
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="outline" icon={<MenuIcon />}>
          Open navigation
        </Button>
      </Drawer.Trigger>
      <Drawer.Content side="left" size="sm">
        <Drawer.Header>
          <Drawer.Title>Acme Inc.</Drawer.Title>
          <Drawer.Description>Workspace navigation</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body>
          <Menu
            aria-label="Pages"
            value={page}
            onValueChange={(value) => {
              setPage(value)
              setOpen(false)
            }}
          >
            <Menu.Item value="home" icon={<HomeIcon />}>
              Home
            </Menu.Item>
            <Menu.Item value="team" icon={<UsersIcon />}>
              Team
            </Menu.Item>
            <Menu.Item value="settings" icon={<SettingsIcon />}>
              Settings
            </Menu.Item>
          </Menu>
        </Drawer.Body>
        <Text size="xs" tone="muted">
          Signed in as ada@example.com
        </Text>
      </Drawer.Content>
    </Drawer>
  )
}
