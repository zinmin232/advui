import { Fab, HStack, toast } from '@advui/core'
import { EditIcon, PlusIcon, StarIcon } from '@advui/icons'

export default function FabBasic() {
  return (
    <HStack gap="$4" alignItems="center" flexWrap="wrap">
      <Fab size="sm" icon={<PlusIcon />} aria-label="Add item" onPress={() => toast('Add item')} />
      <Fab icon={<EditIcon />} aria-label="Compose" onPress={() => toast('Compose')} />
      <Fab
        size="lg"
        variant="primary"
        icon={<PlusIcon />}
        aria-label="New project"
        onPress={() => toast('New project')}
      />
      <Fab variant="secondary" icon={<StarIcon />} aria-label="Favorite" />
      <Fab variant="surface" icon={<StarIcon />} aria-label="Favorite" />
    </HStack>
  )
}
