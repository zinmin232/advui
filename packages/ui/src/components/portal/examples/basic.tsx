import { Button, Card, HStack, Portal, Text } from '@advui/core'
import { useState } from 'react'

export default function PortalBasic() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onPress={() => setOpen((value) => !value)}>
        {open ? 'Hide the bar' : 'Show a bar over the page'}
      </Button>
      {open ? (
        <Portal>
          {/* Placed in the window, not in this box. Values reach it as props
              and closures, such as setOpen; React context may not on iOS and Android. */}
          <Card
            variant="elevated"
            position="absolute"
            bottom="4"
            left="4"
            right="4"
            maxWidth="128"
            marginHorizontal="auto"
          >
            <HStack padding="3" gap="3" alignItems="center" justifyContent="space-between">
              <Text size="sm">This bar is in a portal, above everything else.</Text>
              <Button size="sm" onPress={() => setOpen(false)}>
                Close
              </Button>
            </HStack>
          </Card>
        </Portal>
      ) : null}
    </>
  )
}
