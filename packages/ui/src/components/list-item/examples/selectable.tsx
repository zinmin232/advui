import { ListItem, VStack } from '@advui/core'
import { CheckIcon } from '@advui/icons'
import { useState } from 'react'

const topics = [
  { id: 'reports', title: 'Weekly reports', description: 'A summary every Monday' },
  { id: 'mentions', title: 'Mentions', description: 'When someone mentions you' },
  { id: 'releases', title: 'Product releases', description: 'New features and fixes' },
]

export default function ListItemSelectable() {
  // Multiple choice: the parent keeps the selected ids. For a single choice,
  // keep one id and set it when an item turns on.
  const [chosen, setChosen] = useState(['reports'])

  return (
    <VStack gap="2" width="100%" maxWidth="96">
      {topics.map((topic) => {
        const selected = chosen.includes(topic.id)
        return (
          <ListItem
            key={topic.id}
            variant="outline"
            title={topic.title}
            description={topic.description}
            selectable
            selected={selected}
            onSelectedChange={(on) =>
              setChosen((ids) => (on ? [...ids, topic.id] : ids.filter((id) => id !== topic.id)))
            }
            trailing={selected ? <CheckIcon color="primary" /> : null}
          />
        )
      })}
    </VStack>
  )
}
