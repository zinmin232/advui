import { List, ScrollArea, Sticky, Text, VStack } from '@advui/core'
import { Fragment } from 'react'

const groups = [
  { region: 'Kachin', townships: ['Bhamo', 'Myitkyina', 'Putao', 'Waingmaw'] },
  { region: 'Rakhine', townships: ['Kyaukpyu', 'Maungdaw', 'Mrauk-U', 'Sittwe'] },
  { region: 'Shan', townships: ['Kengtung', 'Lashio', 'Muse', 'Taunggyi'] },
]

export default function StickyListHeaders() {
  return (
    <ScrollArea
      aria-label="Townships"
      height={280}
      width="100%"
      maxWidth={360}
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
    >
      {/* Each header is a direct child of the content, so it is pinned on iOS and Android too. */}
      <VStack>
        {groups.map((group) => (
          <Fragment key={group.region}>
            <Sticky>
              <Text
                role="heading"
                aria-level={3}
                size="sm"
                weight="semibold"
                paddingHorizontal="$4"
                paddingVertical="$2"
                backgroundColor="$muted"
              >
                {group.region}
              </Text>
            </Sticky>
            <List>
              {group.townships.map((township) => (
                <List.Item key={township} title={township} />
              ))}
            </List>
          </Fragment>
        ))}
      </VStack>
    </ScrollArea>
  )
}
