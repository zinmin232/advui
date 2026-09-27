import { Collapsible, HStack, IconButton, Text, VStack } from '@advui/core'
import { ChevronsUpDownIcon, FolderIcon } from '@advui/icons'

function Repo({ name }: { name: string }) {
  return (
    <HStack
      gap="$2"
      alignItems="center"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$md"
    >
      <FolderIcon size={16} color="$mutedForeground" />
      <Text size="sm" fontFamily="$mono">
        {name}
      </Text>
    </HStack>
  )
}

export default function CollapsibleBasic() {
  return (
    <Collapsible gap="$2" width="100%" maxWidth="$80">
      <HStack justifyContent="space-between" alignItems="center">
        <Text size="sm" weight="semibold">
          Ada starred 3 repositories
        </Text>
        <Collapsible.Trigger>
          <IconButton aria-label="Show all repositories" size="sm" icon={<ChevronsUpDownIcon />} />
        </Collapsible.Trigger>
      </HStack>
      <Repo name="advui/core" />
      <Collapsible.Content>
        <VStack gap="$2">
          <Repo name="advui/theme" />
          <Repo name="advui/icons" />
        </VStack>
      </Collapsible.Content>
    </Collapsible>
  )
}
