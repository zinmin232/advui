import { BackToTop, Box, ScrollArea, Text, VStack, useBackToTop } from '@advui/core'

const events = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  text: `Build ${240 - i} ${i % 5 === 3 ? 'failed' : 'passed'}`,
  time: `${i * 7 + 2} min ago`,
}))

export default function BackToTopBasic() {
  // Shows the button once the list is scrolled 160px down.
  const scroll = useBackToTop({ threshold: 160 })
  return (
    <Box position="relative" width="100%" maxWidth="96" height="72">
      <ScrollArea
        aria-label="Build activity"
        height="100%"
        borderWidth={1}
        borderColor="border"
        borderRadius="lg"
        {...scroll.scrollProps}
      >
        <VStack padding="4" gap="3">
          {events.map((event) => (
            <VStack key={event.id} gap="0-5">
              <Text size="sm">{event.text}</Text>
              <Text size="xs" tone="muted">
                {event.time}
              </Text>
            </VStack>
          ))}
        </VStack>
      </ScrollArea>
      <BackToTop scroll={scroll} label="Back to the latest build" />
    </Box>
  )
}
