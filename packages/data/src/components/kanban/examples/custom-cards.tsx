import { Avatar, Badge, HStack, Text, VStack } from '@advui/core'
import { Kanban, type KanbanColumn, type KanbanItem } from '@advui/data'
import { useState } from 'react'

interface Task extends KanbanItem {
  priority: 'High' | 'Medium' | 'Low'
  owner: string
}

const priority = { High: 'destructive', Medium: 'warning', Low: 'secondary' } as const

const initial: KanbanColumn<Task>[] = [
  {
    id: 'new',
    title: 'New',
    items: [
      { id: 'r1', title: 'Request from Magway', priority: 'High', owner: 'Thiri Aung' },
      { id: 'r2', title: 'Request from Sagaing', priority: 'Low', owner: 'Kyaw Zin' },
    ],
  },
  {
    id: 'assigned',
    title: 'Assigned',
    items: [{ id: 'r3', title: 'Request from Kachin', priority: 'Medium', owner: 'May Phyu' }],
  },
  {
    id: 'closed',
    title: 'Closed',
    // Closed and locked: it cannot be picked up.
    items: [
      {
        id: 'r4',
        title: 'Request from Shan',
        priority: 'Low',
        owner: 'Htet Naing',
        disabled: true,
      },
    ],
  },
]

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')

export default function KanbanCustomCards() {
  const [columns, setColumns] = useState(initial)
  const [last, setLast] = useState('Drag a request, or press Space on one.')
  return (
    <VStack gap="3" width="100%">
      <Kanban
        aria-label="Requests"
        value={columns}
        onValueChange={setColumns}
        columnWidth="64"
        onItemMove={({ itemId, to }) => {
          const title = columns
            .flatMap((column) => column.items)
            .find((t) => t.id === itemId)!.title
          setLast(`${title} → ${columns.find((column) => column.id === to.columnId)!.title}`)
        }}
        renderItem={(task) => (
          <VStack gap="2">
            <Text size="sm" weight="medium">
              {task.title}
            </Text>
            <HStack alignItems="center" justifyContent="space-between">
              <Badge size="sm" variant={priority[task.priority]}>
                {task.priority}
              </Badge>
              <Avatar size="sm" alt={task.owner} fallback={initials(task.owner)} />
            </HStack>
          </VStack>
        )}
      />
      <Text size="sm" tone="muted" aria-live="polite">
        {last}
      </Text>
    </VStack>
  )
}
