import { Badge, Button, HStack, Heading, Input, Toolbar } from '@advui/core'
import { DownloadIcon, PlusIcon } from '@advui/icons'

export default function ToolbarDataTable() {
  return (
    <Toolbar
      aria-label="Users table"
      variant="ghost"
      width="100%"
      wrap
      leading={
        <HStack gap="2">
          <Heading level={3} size="lg">
            Users
          </Heading>
          <Badge variant="secondary">128</Badge>
        </HStack>
      }
      trailing={
        <>
          <Input size="sm" width="56" placeholder="Filter users…" aria-label="Filter users" />
          <Button size="sm" variant="outline" icon={<DownloadIcon />}>
            Export
          </Button>
          <Button size="sm" icon={<PlusIcon />}>
            Add user
          </Button>
        </>
      }
    />
  )
}
