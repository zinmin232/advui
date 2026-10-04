import { Button, HStack, Hide, IconButton, Show, Text } from '@advui/core'
import { MenuIcon, SearchIcon } from '@advui/icons'

export default function ShowHideNavigation() {
  return (
    <HStack
      width="100%"
      gap="$3"
      padding="$3"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
      distribute="between"
    >
      <Text weight="semibold">Field reports</Text>
      {/* Links from md, a menu button below it. */}
      <Show above="md">
        <HStack gap="$1">
          <Button variant="ghost" size="sm">
            Projects
          </Button>
          <Button variant="ghost" size="sm">
            Reports
          </Button>
          <Button variant="ghost" size="sm">
            Partners
          </Button>
        </HStack>
      </Show>
      <HStack gap="$1">
        <Hide below="sm">
          <IconButton aria-label="Search" icon={<SearchIcon />} />
        </Hide>
        <Show below="md">
          <IconButton aria-label="Open menu" icon={<MenuIcon />} />
        </Show>
      </HStack>
    </HStack>
  )
}
