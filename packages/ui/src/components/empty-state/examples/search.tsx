import { Button, EmptyState } from '@advui/core'
import { SearchIcon } from '@advui/icons'

export default function EmptyStateSearch() {
  return (
    <EmptyState
      bordered
      icon={<SearchIcon />}
      title="No results for “invoice 2024”"
      description="Check the spelling or try a shorter search."
      width="100%"
    >
      <Button variant="ghost">Clear search</Button>
    </EmptyState>
  )
}
