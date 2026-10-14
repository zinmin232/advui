import { Button, Toolbar, VStack } from '@advui/core'
import { DownloadIcon, RotateCwIcon } from '@advui/icons'

const sizes = ['sm', 'md', 'lg'] as const

// The toolbar's size sets its gap, padding and height. Controls keep their
// own size, so give them the same one.
export default function ToolbarSizes() {
  return (
    <VStack gap="$3" align="start">
      {sizes.map((size) => (
        <Toolbar key={size} aria-label={`${size} toolbar`} size={size} variant="outline">
          <Button size={size} variant="ghost" icon={<RotateCwIcon />}>
            Refresh
          </Button>
          <Button size={size} variant="ghost" icon={<DownloadIcon />}>
            Export
          </Button>
        </Toolbar>
      ))}
    </VStack>
  )
}
