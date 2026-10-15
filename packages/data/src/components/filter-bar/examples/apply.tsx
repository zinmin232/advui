import { Text, VStack } from '@advui/core'
import { type FilterDefinition, type FilterState, FilterBar } from '@advui/data'
import { useState } from 'react'

const filters: FilterDefinition[] = [
  { key: 'created', label: 'Created between', type: 'date-range' },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { label: 'Invoice', value: 'invoice' },
      { label: 'Refund', value: 'refund' },
    ],
  },
]

export default function FilterBarApply() {
  const [applied, setApplied] = useState<FilterState | null>(null)
  return (
    <VStack gap="$3" width="100%">
      <FilterBar
        aria-label="Filter orders"
        variant="outline"
        locale="en-US"
        filters={filters}
        defaultValue={{ created: { start: new Date(2026, 9, 1), end: new Date(2026, 9, 14) } }}
        showApplyButton
        showResetButton
        onApply={setApplied}
      />
      <Text size="sm" tone="muted">
        {applied
          ? `Applied: ${applied.type ?? 'any type'}, ${applied.created ? 'with dates' : 'any date'}.`
          : 'Change a filter, then press Apply.'}
      </Text>
    </VStack>
  )
}
