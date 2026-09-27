import { HStack, Toggle } from '@advui/core'
import { BellIcon, BoldIcon, ItalicIcon, StarIcon } from '@advui/icons'

export default function ToggleBasic() {
  return (
    <HStack gap="$3" alignItems="center" flexWrap="wrap">
      {/* Icon-only toggles need a label; it stays the same when pressed. */}
      <Toggle aria-label="Bold" icon={<BoldIcon />} defaultPressed />
      <Toggle aria-label="Italic" icon={<ItalicIcon />} />
      <Toggle variant="outline" icon={<BellIcon />} defaultPressed>
        Notifications
      </Toggle>
      <Toggle variant="outline" icon={<StarIcon />} disabled>
        Favorite
      </Toggle>
    </HStack>
  )
}
