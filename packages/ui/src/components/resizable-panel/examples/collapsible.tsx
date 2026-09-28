import { Resizable, Text, VStack } from '@advui/core'
import { useState } from 'react'

export default function ResizableCollapsible() {
  const [sizes, setSizes] = useState([25, 45, 30])
  return (
    <VStack gap="$2" width="100%">
      <Resizable
        sizes={sizes}
        onSizesChange={setSizes}
        height="$64"
        borderWidth={1}
        borderColor="$border"
        borderRadius="$lg"
      >
        <Resizable.Panel minSize={20} collapsible>
          <VStack padding="$4" gap="$1">
            <Text weight="semibold">Filters</Text>
            <Text size="sm" tone="muted">
              Sector, state, status
            </Text>
          </VStack>
        </Resizable.Panel>
        <Resizable.Handle aria-label="Resize filters" />
        <Resizable.Panel minSize={30}>
          <VStack padding="$4" gap="$1">
            <Text weight="semibold">Activities</Text>
            <Text size="sm" tone="muted">
              1,248 results
            </Text>
          </VStack>
        </Resizable.Panel>
        <Resizable.Handle aria-label="Resize details" />
        <Resizable.Panel minSize={20} collapsible>
          <VStack padding="$4" gap="$1">
            <Text weight="semibold">Details</Text>
            <Text size="sm" tone="muted">
              Pick an activity
            </Text>
          </VStack>
        </Resizable.Panel>
      </Resizable>
      <Text size="xs" tone="muted">
        {sizes.map((size) => `${Math.round(size)}%`).join(' · ')}
      </Text>
    </VStack>
  )
}
