import { Resizable, Text, VStack } from '@advui/core'

export default function ResizableBasic() {
  return (
    <Resizable height="$64" borderWidth={1} borderColor="$border" borderRadius="$lg">
      <Resizable.Panel defaultSize={35} minSize={20} maxSize={60}>
        <VStack padding="$4" gap="$1">
          <Text weight="semibold">Townships</Text>
          <Text size="sm" tone="muted">
            Hakha, Sittwe, Labutta, Myitkyina
          </Text>
        </VStack>
      </Resizable.Panel>
      <Resizable.Handle withHandle aria-label="Resize township list" />
      <Resizable.Panel>
        <VStack padding="$4" gap="$1">
          <Text weight="semibold">Hakha</Text>
          <Text size="sm" tone="muted">
            Chin State · 14 organizations · 32 projects
          </Text>
        </VStack>
      </Resizable.Panel>
    </Resizable>
  )
}
