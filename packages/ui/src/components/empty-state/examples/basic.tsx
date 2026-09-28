import { Button, EmptyState } from '@advui/core'
import { FolderIcon, PlusIcon } from '@advui/icons'

export default function EmptyStateBasic() {
  return (
    <EmptyState
      icon={<FolderIcon />}
      title="No projects yet"
      description="Projects keep your files and team in one place."
      width="100%"
    >
      <Button icon={<PlusIcon />}>New project</Button>
      <Button variant="outline">Import</Button>
    </EmptyState>
  )
}
