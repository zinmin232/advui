import { Button, HStack, Text, VStack } from '@advui/core'
import { TreeView, type TreeNode } from '@advui/data'
import { useState } from 'react'

const places: TreeNode[] = [
  {
    id: 'MMR013',
    label: 'Yangon',
    children: [
      {
        id: 'MMR013D001',
        label: 'Yangon (East)',
        children: [
          { id: 'MMR013014', label: 'Thingangyun' },
          { id: 'MMR013015', label: 'Yankin' },
        ],
      },
      {
        id: 'MMR013D002',
        label: 'Yangon (West)',
        children: [{ id: 'MMR013035', label: 'Kamaryut' }],
      },
    ],
  },
  {
    id: 'MMR010',
    label: 'Mandalay',
    children: [{ id: 'MMR010D001', label: 'Mandalay', disabled: true }],
  },
]

const branchIds = ['MMR013', 'MMR013D001', 'MMR013D002', 'MMR010']

export default function TreeViewControlled() {
  const [expanded, setExpanded] = useState<string[]>(['MMR013'])
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <VStack gap="$3" width="100%" maxWidth="$80">
      <HStack gap="$2">
        <Button size="sm" variant="outline" onPress={() => setExpanded(branchIds)}>
          Expand all
        </Button>
        <Button size="sm" variant="outline" onPress={() => setExpanded([])}>
          Collapse all
        </Button>
      </HStack>
      <TreeView
        aria-label="Places"
        data={places}
        expanded={expanded}
        onExpandedChange={setExpanded}
        selected={selected}
        onSelectedChange={setSelected}
      />
      <Text size="sm" tone="muted">
        Selected place code: {selected ?? 'none'}
      </Text>
    </VStack>
  )
}
