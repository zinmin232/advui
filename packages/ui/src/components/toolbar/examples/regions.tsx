import { Button, Heading, Input, Toolbar } from '@advui/core'
import { PlusIcon } from '@advui/icons'

export default function ToolbarRegions() {
  return (
    <Toolbar
      aria-label="Users"
      variant="outline"
      width="100%"
      leading={
        <Heading level={3} size="lg">
          Users
        </Heading>
      }
      // The field fills the center, up to a width.
      center={
        <Input
          size="sm"
          flex={1}
          maxWidth="$96"
          placeholder="Search users…"
          aria-label="Search users"
        />
      }
      trailing={
        <Button size="sm" icon={<PlusIcon />}>
          Add user
        </Button>
      }
    />
  )
}
