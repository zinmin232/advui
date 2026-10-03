import { Badge, Card, Grid, HStack, Progress, Text, VStack } from '@advui/core'

const tasks = [
  { label: 'Design review', value: 80 },
  { label: 'Accessibility audit', value: 45 },
  { label: 'Release notes', value: 20 },
]

export default function GridTwoColumn() {
  return (
    <Grid columns={12} gap="$4" width="100%">
      <Grid.Item span={{ base: 12, md: 8 }}>
        <Card flexGrow={1}>
          <Card.Header>
            <Card.Title>Sprint progress</Card.Title>
            <Card.Description>8 of 12 columns from md, the full row on phones.</Card.Description>
          </Card.Header>
          <Card.Content gap="$4">
            {tasks.map((task) => (
              <VStack key={task.label} gap="$1.5">
                <HStack justifyContent="space-between">
                  <Text size="sm">{task.label}</Text>
                  <Text size="sm" tone="muted">
                    {task.value}%
                  </Text>
                </HStack>
                <Progress value={task.value} label={task.label} size="sm" />
              </VStack>
            ))}
          </Card.Content>
        </Card>
      </Grid.Item>
      <Grid.Item span={{ base: 12, md: 4 }}>
        <Card flexGrow={1}>
          <Card.Header>
            <Card.Title>Details</Card.Title>
            <Card.Description>4 of 12 columns from md.</Card.Description>
          </Card.Header>
          <Card.Content gap="$3">
            <HStack justifyContent="space-between">
              <Text size="sm" tone="muted">
                Status
              </Text>
              <Badge variant="success" size="sm">
                On track
              </Badge>
            </HStack>
            <HStack justifyContent="space-between">
              <Text size="sm" tone="muted">
                Due
              </Text>
              <Text size="sm">Friday</Text>
            </HStack>
          </Card.Content>
        </Card>
      </Grid.Item>
    </Grid>
  )
}
