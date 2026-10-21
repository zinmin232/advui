import { Box, Button, Heading, Input, Toolbar } from '@advui/core'
import { FilterIcon, PlusIcon } from '@advui/icons'

// A phone-width frame. With `wrap`, the field and the actions move onto new
// lines instead of squeezing the title; the actions stay at the end edge.
export default function ToolbarWrap() {
  return (
    <Box
      width="100%"
      maxWidth="80"
      borderWidth={1}
      borderColor="border"
      borderStyle="dashed"
      borderRadius="lg"
    >
      <Toolbar
        aria-label="Orders"
        wrap
        leading={
          <Heading level={3} size="lg">
            Orders
          </Heading>
        }
        center={
          <Input
            size="sm"
            flex={1}
            minWidth="40"
            placeholder="Search orders…"
            aria-label="Search orders"
          />
        }
        trailing={
          <>
            <Button size="sm" variant="outline" icon={<FilterIcon />}>
              Filter
            </Button>
            <Button size="sm" icon={<PlusIcon />}>
              New order
            </Button>
          </>
        }
      />
    </Box>
  )
}
