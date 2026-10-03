import { Button, Card, Grid, Text, VStack } from '@advui/core'

const sections = ['Overview', 'Members', 'Billing', 'Settings']

export default function GridSidebar() {
  return (
    <Grid columns={12} gap="$4" width="100%">
      <Grid.Item span={{ base: 12, md: 3 }}>
        <VStack gap="$1">
          {sections.map((section, index) => (
            <Button
              key={section}
              variant={index === 0 ? 'secondary' : 'ghost'}
              justifyContent="flex-start"
            >
              {section}
            </Button>
          ))}
        </VStack>
      </Grid.Item>
      <Grid.Item span={{ base: 12, md: 9 }}>
        <Card flexGrow={1}>
          <Card.Header>
            <Card.Title>Overview</Card.Title>
            <Card.Description>
              A 3 / 9 split from md. On phones the sections sit above the content.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Text size="sm" tone="muted">
              The sidebar covers 3 of 12 columns and the content the other 9.
            </Text>
          </Card.Content>
        </Card>
      </Grid.Item>
    </Grid>
  )
}
