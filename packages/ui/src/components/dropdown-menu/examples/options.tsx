import { DropdownMenu, IconButton, Text, VStack } from '@advui/core'
import { MoreHorizontalIcon } from '@advui/icons'
import { useState } from 'react'

export default function DropdownMenuOptions() {
  const [showStatus, setShowStatus] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [sort, setSort] = useState('newest')

  return (
    <VStack gap="$2" alignItems="center">
      <DropdownMenu align="end">
        <DropdownMenu.Trigger>
          <IconButton aria-label="View options" variant="outline" icon={<MoreHorizontalIcon />} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Appearance</DropdownMenu.Label>
          <DropdownMenu.CheckboxItem checked={showStatus} onCheckedChange={setShowStatus}>
            Status bar
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
            Side panel
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.Separator />
          <DropdownMenu.Label>Sort by</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenu.RadioItem value="newest">Newest first</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="oldest">Oldest first</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="name">Name</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
      <Text size="sm" tone="muted">
        Status bar {showStatus ? 'on' : 'off'} · Side panel {showPanel ? 'on' : 'off'} · Sorted by{' '}
        {sort}
      </Text>
    </VStack>
  )
}
