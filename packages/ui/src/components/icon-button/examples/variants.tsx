import { HStack, IconButton } from '@advui/core'
import { HeartIcon, PlusIcon, SearchIcon, TrashIcon } from '@advui/icons'

export default function IconButtonVariants() {
  return (
    <HStack gap="$2">
      <IconButton aria-label="Search" icon={<SearchIcon />} />
      <IconButton aria-label="Add" variant="outline" icon={<PlusIcon />} />
      <IconButton aria-label="Favorite" variant="secondary" circular icon={<HeartIcon />} />
      <IconButton aria-label="New" variant="default" icon={<PlusIcon />} />
      <IconButton aria-label="Delete" variant="destructive" icon={<TrashIcon />} />
    </HStack>
  )
}
