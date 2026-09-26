import { Button, Checkbox, HStack, Label, Popover, Text, VStack } from '@advui/core'
import { FilterIcon } from '@advui/icons'
import { useState } from 'react'

const statuses = ['Active', 'Invited', 'Suspended'] as const

export default function PopoverFilter() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(['Active'])
  const toggle = (status: string, checked: boolean) =>
    setSelected((prev) => (checked ? [...prev, status] : prev.filter((s) => s !== status)))

  return (
    <VStack gap="$2" alignItems="center">
      <Popover open={open} onOpenChange={setOpen} side="bottom" align="start">
        <Popover.Trigger asChild>
          <Button variant="outline" size="sm" icon={<FilterIcon />}>
            Status ({selected.length})
          </Button>
        </Popover.Trigger>
        <Popover.Content width="$64">
          <Popover.Title>Filter by status</Popover.Title>
          <VStack gap="$2.5">
            {statuses.map((status) => (
              <HStack key={status} gap="$2" alignItems="center">
                <Checkbox
                  id={`filter-${status}`}
                  checked={selected.includes(status)}
                  onCheckedChange={(checked) => toggle(status, checked === true)}
                />
                <Label htmlFor={`filter-${status}`}>{status}</Label>
              </HStack>
            ))}
          </VStack>
          <HStack gap="$2" justifyContent="flex-end">
            <Button variant="ghost" size="sm" onPress={() => setSelected([])}>
              Clear
            </Button>
            <Button size="sm" onPress={() => setOpen(false)}>
              Apply
            </Button>
          </HStack>
        </Popover.Content>
      </Popover>
      <Text size="sm" tone="muted">
        Showing: {selected.length ? selected.join(', ') : 'everyone'}
      </Text>
    </VStack>
  )
}
