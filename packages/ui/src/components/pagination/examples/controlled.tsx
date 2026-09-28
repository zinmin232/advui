import { Pagination, Text, VStack } from '@advui/core'
import { useState } from 'react'

const perPage = 10
const total = 87

export default function PaginationControlled() {
  const [page, setPage] = useState(1)
  const first = (page - 1) * perPage + 1
  const last = Math.min(page * perPage, total)
  return (
    <VStack gap="$3" alignItems="center">
      <Pagination count={Math.ceil(total / perPage)} page={page} onPageChange={setPage} size="sm" />
      <Text size="sm" tone="muted">
        Showing {first}–{last} of {total} projects
      </Text>
    </VStack>
  )
}
