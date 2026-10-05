import { AppShell, Button, Sidebar, Text } from '@advui/core'
import { useState } from 'react'

const groups = [
  { label: 'Getting started', pages: ['Introduction', 'Installation', 'Theming'] },
  { label: 'Layout', pages: ['App Shell', 'Auto Grid', 'Stack', 'Section'] },
]

export default function AppShellDocs() {
  const [page, setPage] = useState('App Shell')
  return (
    // `height`, the border and `safeArea={false}` fit the shell into the preview. In an app,
    // leave them out: the shell fills the screen and clears the notch and home indicator.
    <AppShell
      layout="sidebar-full"
      sidebarBreakpoint="lg"
      height="$112"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
      safeArea={false}
    >
      <AppShell.Sidebar aria-label="Docs">
        <Sidebar>
          <Sidebar.Header>
            <Text weight="semibold">Adv UI</Text>
          </Sidebar.Header>
          <Sidebar.Content>
            {groups.map((group) => (
              <Sidebar.Group key={group.label} label={group.label}>
                {group.pages.map((name) => (
                  <Sidebar.Item key={name} active={page === name} onPress={() => setPage(name)}>
                    {name}
                  </Sidebar.Item>
                ))}
              </Sidebar.Group>
            ))}
          </Sidebar.Content>
        </Sidebar>
      </AppShell.Sidebar>
      <AppShell.Header>
        <AppShell.SidebarTrigger />
        <Text tone="muted" flex={1}>
          Docs
        </Text>
        <Button size="sm" variant="outline">
          GitHub
        </Button>
      </AppShell.Header>
      <AppShell.Main padding="$6" gap="$3" maxWidth="$192">
        <Text size="2xl" weight="bold">
          {page}
        </Text>
        <Text>
          The sidebar spans the full height of the screen, and the header sits beside it. Below the
          lg breakpoint the sidebar becomes a drawer.
        </Text>
        <Text tone="muted">
          Only this column scrolls: the header, the sidebar and the footer stay in place.
        </Text>
      </AppShell.Main>
      <AppShell.Footer>
        <Text size="xs" tone="muted">
          Released under the MIT license.
        </Text>
      </AppShell.Footer>
    </AppShell>
  )
}
