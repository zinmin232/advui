import { ListItem, VStack } from '@advui/core'
import { FileIcon, StarIcon } from '@advui/icons'

export default function ListItemVariants() {
  return (
    <VStack gap="3" width="100%" maxWidth="96">
      <ListItem leading={<FileIcon />} title="Plain" description="No surface of its own" />
      <ListItem
        variant="filled"
        leading={<FileIcon />}
        title="Filled"
        description="A muted surface"
      />
      <ListItem
        variant="outline"
        leading={<FileIcon />}
        title="Outline"
        description="A card surface with a border"
      />
      <ListItem variant="outline" size="sm" title="Small" trailing="sm" />
      <ListItem variant="outline" size="lg" title="Large" trailing="lg" />
      <ListItem
        leading={<StarIcon />}
        title="Custom colors"
        description="backgroundColor, color and borderRadius"
        backgroundColor="primarySoft"
        color="primarySoftForeground"
        borderRadius="xl"
      />
    </VStack>
  )
}
