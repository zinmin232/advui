import { AutoGrid, Badge, Card, HStack, Text } from '@advui/core'

const places = [
  { name: 'Atlas', region: 'North', sites: 12 },
  { name: 'Beacon', region: 'Coast', sites: 8 },
  { name: 'Compass', region: 'Delta', sites: 15 },
  { name: 'Delta', region: 'Hills', sites: 4 },
  { name: 'Echo', region: 'Capital', sites: 21 },
]

export default function AutoGridCardGallery() {
  // No breakpoints: as many 220px columns as fit, never more than 4.
  return (
    <AutoGrid minChildWidth={220} maxColumns={4} gap="$4">
      {places.map((place) => (
        <Card key={place.name}>
          <Card.Header>
            <Card.Title>{place.name}</Card.Title>
            <Card.Description>{place.region} region</Card.Description>
          </Card.Header>
          <Card.Content>
            <HStack gap="$2">
              <Badge variant="secondary" size="sm">
                {place.sites}
              </Badge>
              <Text size="sm" tone="muted">
                active sites
              </Text>
            </HStack>
          </Card.Content>
        </Card>
      ))}
    </AutoGrid>
  )
}
