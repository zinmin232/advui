import { NumberInput } from '@advui/core'
import { type CustomFilterDefinition, type FilterDefinition, FilterBar } from '@advui/data'

// Any control can be a filter: the value is typed, and `format` writes its chip.
const minimum: CustomFilterDefinition<number> = {
  key: 'minimum',
  label: 'Minimum amount',
  type: 'custom',
  format: (value) => `at least ${value}`,
  render: ({ value, onValueChange, size, disabled }) => (
    <NumberInput
      size={size}
      min={0}
      step={50}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    />
  ),
}

const filters: FilterDefinition[] = [
  minimum,
  {
    key: 'currency',
    label: 'Currency',
    type: 'select',
    options: [
      { label: 'MMK', value: 'mmk' },
      { label: 'USD', value: 'usd' },
    ],
  },
]

export default function FilterBarCustomFilter() {
  return (
    <FilterBar
      aria-label="Filter payments"
      width="100%"
      filters={filters}
      defaultValue={{ minimum: 100 }}
      showActiveFilters
    />
  )
}
