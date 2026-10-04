import { Button, HStack, Heading, Stack } from '@advui/core'
import { PlusIcon } from '@advui/icons'

export default function StackToolbar() {
  return (
    <Stack
      direction={{ base: 'column', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      distribute="between"
      gap="$3"
      width="100%"
      padding="$3"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
    >
      <Heading level={3} size="lg">
        Projects
      </Heading>
      <HStack gap="$2" distribute="end">
        <Button variant="outline" size="sm">
          Import
        </Button>
        <Button size="sm" icon={<PlusIcon />}>
          New project
        </Button>
      </HStack>
    </Stack>
  )
}
