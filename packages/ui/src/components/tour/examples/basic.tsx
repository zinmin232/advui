import { Button, HStack, IconButton, Search, Text, Tour, VStack } from '@advui/core'
import { PlusIcon, SettingsIcon } from '@advui/icons'
import { useRef, useState } from 'react'

export default function TourBasic() {
  const search = useRef(null)
  const create = useRef(null)
  const settings = useRef(null)
  const [open, setOpen] = useState(false)
  const [finished, setFinished] = useState(false)
  return (
    <VStack gap="4" width="100%" maxWidth="128">
      <HStack gap="2" alignItems="center">
        <Search ref={search} placeholder="Search projects" flex={1} />
        <Button ref={create} icon={<PlusIcon />}>
          New project
        </Button>
        <IconButton ref={settings} aria-label="Settings" icon={<SettingsIcon />} />
      </HStack>
      <HStack gap="3" alignItems="center">
        <Button variant="outline" onPress={() => setOpen(true)}>
          Take the tour
        </Button>
        {finished ? (
          <Text size="sm" tone="muted">
            Tour finished.
          </Text>
        ) : null}
      </HStack>
      <Tour
        open={open}
        onOpenChange={setOpen}
        onComplete={() => setFinished(true)}
        steps={[
          {
            title: 'Welcome to Projects',
            description: 'Three things to know before you start. It takes half a minute.',
          },
          {
            target: search,
            title: 'Find anything',
            description: 'Search looks through project names, files and comments.',
          },
          {
            target: create,
            title: 'Start a project',
            description: 'Pick a template or start from a blank page.',
          },
          {
            target: settings,
            title: 'Make it yours',
            description: 'Notifications, theme and keyboard shortcuts live here.',
          },
        ]}
      />
    </VStack>
  )
}
