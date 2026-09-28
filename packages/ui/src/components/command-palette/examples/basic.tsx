import { Button, CommandPalette, HStack, Kbd, Text, toast, type Command } from '@advui/core'
import {
  BarChartIcon,
  DownloadIcon,
  FileIcon,
  HomeIcon,
  MoonIcon,
  SettingsIcon,
  UsersIcon,
} from '@advui/icons'
import { useState } from 'react'

const say = (text: string) => () => toast(text)

const commands: Command[] = [
  {
    id: 'home',
    label: 'Dashboard',
    group: 'Go to',
    icon: <HomeIcon />,
    onSelect: say('Dashboard'),
  },
  {
    id: 'reports',
    label: '5W reports',
    group: 'Go to',
    icon: <BarChartIcon />,
    keywords: ['who what where'],
    onSelect: say('5W reports'),
  },
  {
    id: 'partners',
    label: 'Partner directory',
    group: 'Go to',
    icon: <UsersIcon />,
    keywords: ['organizations'],
    onSelect: say('Partners'),
  },
  {
    id: 'new',
    label: 'New publication',
    group: 'Actions',
    icon: <FileIcon />,
    shortcut: '⌘N',
    onSelect: say('New publication'),
  },
  {
    id: 'export',
    label: 'Export to Excel',
    group: 'Actions',
    icon: <DownloadIcon />,
    keywords: ['xlsx', 'download'],
    onSelect: say('Exporting…'),
  },
  {
    id: 'theme',
    label: 'Toggle dark mode',
    group: 'Settings',
    icon: <MoonIcon />,
    onSelect: say('Theme toggled'),
  },
  {
    id: 'settings',
    label: 'Settings',
    group: 'Settings',
    icon: <SettingsIcon />,
    keywords: ['preferences'],
    shortcut: '⌘,',
    onSelect: say('Settings'),
  },
  {
    id: 'admin',
    label: 'Admin console',
    group: 'Settings',
    disabled: true,
    onSelect: say('Admin'),
  },
]

export default function CommandPaletteBasic() {
  const [open, setOpen] = useState(false)
  return (
    <HStack gap="$3" alignItems="center" flexWrap="wrap">
      <Button variant="outline" onPress={() => setOpen(true)}>
        Open command palette
      </Button>
      <Text size="sm" tone="muted">
        or press <Kbd>⌘</Kbd> <Kbd>J</Kbd> / <Kbd>Ctrl</Kbd> <Kbd>J</Kbd>
      </Text>
      {/* ⌘J here: these docs already use ⌘K for their own search. */}
      <CommandPalette commands={commands} open={open} onOpenChange={setOpen} hotkey="j" />
    </HStack>
  )
}
