import { VStack } from '@advui/core'
import { type FilterDefinition, FilterBar, type FilterBarVariant } from '@advui/data'

const filters: FilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
]

const variants: FilterBarVariant[] = ['default', 'outline', 'filled', 'ghost']

export default function FilterBarVariants() {
  return (
    <VStack gap="$4" width="100%">
      {variants.map((variant) => (
        <FilterBar
          key={variant}
          aria-label={`Filters, ${variant}`}
          variant={variant}
          showLabels={false}
          searchable
          searchPlaceholder={`Search, ${variant}`}
          filters={filters}
        />
      ))}
    </VStack>
  )
}
