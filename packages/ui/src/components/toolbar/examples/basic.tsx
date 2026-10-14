import { Button, Toolbar } from '@advui/core'
import { EditIcon, PlusIcon, TrashIcon } from '@advui/icons'

export default function ToolbarBasic() {
  return (
    <Toolbar aria-label="Project actions" variant="outline">
      <Button size="sm" icon={<PlusIcon />}>
        New
      </Button>
      <Button size="sm" variant="outline" icon={<EditIcon />}>
        Edit
      </Button>
      <Button size="sm" variant="outline" icon={<TrashIcon />}>
        Delete
      </Button>
    </Toolbar>
  )
}
