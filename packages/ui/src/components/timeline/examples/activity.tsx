import { Avatar, Card, HStack, Text, Timeline } from '@advui/core'

export default function TimelineActivity() {
  return (
    <Timeline width="100%" maxWidth="$96">
      <Timeline.Item tone="primary" title="Nwe Ni commented" time="2 hours ago">
        <Card variant="filled" marginTop="$1">
          <Card.Content padding="$3">
            <Text size="sm">The township totals now match the baseline tables.</Text>
          </Card.Content>
        </Card>
      </Timeline.Item>
      <Timeline.Item title="Aung Kyaw assigned the review" time="Yesterday">
        <HStack gap="$2" alignItems="center">
          <Avatar size="xs" alt="Hla Min" />
          <Text size="sm" tone="muted">
            Hla Min
          </Text>
        </HStack>
      </Timeline.Item>
      <Timeline.Item title="Report created" time="Sep 20" />
    </Timeline>
  )
}
