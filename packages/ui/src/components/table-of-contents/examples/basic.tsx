import { Heading, TableOfContents, Text, VStack } from '@advui/core'

const sections = [
  {
    id: 'toc-example-route',
    label: 'The route',
    level: 3,
    text: 'A loop of eleven kilometres from the village, along the river and back over the ridge.',
  },
  {
    id: 'toc-example-start',
    label: 'Where to start',
    level: 4,
    text: 'Park by the old mill and follow the yellow markers past the bridge.',
  },
  {
    id: 'toc-example-water',
    label: 'Water and shelter',
    level: 4,
    text: 'There is a spring at the halfway hut, which stays open from April to October.',
  },
  {
    id: 'toc-example-season',
    label: 'When to go',
    level: 3,
    text: 'Late spring and early autumn, when the river is low enough to cross at the ford.',
  },
]

export default function TableOfContentsBasic() {
  return (
    <VStack gap="6" width="100%" maxWidth="112">
      {/* On web it follows the page's scroll; the links go to the headings' ids. */}
      <TableOfContents items={sections} title="On this page" label="Trail guide" />
      <VStack gap="4">
        {sections.map((section) => (
          <VStack key={section.id} gap="1">
            <Heading id={section.id} level={section.level as 3 | 4} size="base">
              {section.label}
            </Heading>
            <Text size="sm" tone="muted">
              {section.text}
            </Text>
          </VStack>
        ))}
      </VStack>
    </VStack>
  )
}
