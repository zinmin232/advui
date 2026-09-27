import { ScrollArea, Separator, Text, VStack } from '@advui/core'
import { Fragment } from 'react'

const tags = Array.from({ length: 30 }, (_, index) => `v1.${30 - index}.0`)

export default function ScrollAreaBasic() {
  return (
    <ScrollArea
      aria-label="Release tags"
      height="$72"
      width="$48"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$md"
    >
      <VStack padding="$4" gap="$2">
        <Text size="sm" weight="medium">
          Tags
        </Text>
        {tags.map((tag) => (
          <Fragment key={tag}>
            <Text size="sm" fontFamily="$mono">
              {tag}
            </Text>
            <Separator />
          </Fragment>
        ))}
      </VStack>
    </ScrollArea>
  )
}
