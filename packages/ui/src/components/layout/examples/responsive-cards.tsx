import { Card, Grid } from '@advui/core'

const projects = [
  { name: 'Atlas', summary: 'Maps and place codes' },
  { name: 'Beacon', summary: 'Alerts for field teams' },
  { name: 'Compass', summary: 'Partner directory' },
  { name: 'Delta', summary: 'Survey imports' },
  { name: 'Echo', summary: 'Feedback inbox' },
  { name: 'Fjord', summary: 'Data warehouse' },
]

export default function GridResponsiveCards() {
  // Equal columns need no Grid.Item: each child is one column wide.
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="$4" width="100%">
      {projects.map((project) => (
        <Card key={project.name} flexGrow={1}>
          <Card.Header>
            <Card.Title>{project.name}</Card.Title>
            <Card.Description>{project.summary}</Card.Description>
          </Card.Header>
        </Card>
      ))}
    </Grid>
  )
}
