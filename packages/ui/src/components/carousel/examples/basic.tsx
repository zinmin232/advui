import { Card, Carousel, Text, VStack } from '@advui/core'

const tips = [
  {
    title: 'Invite your team',
    description: 'Add people by email. They see every project you share with them.',
  },
  {
    title: 'Connect a repository',
    description: 'Each push builds a preview you can send round before it ships.',
  },
  {
    title: 'Turn on alerts',
    description: 'Get a message when a build fails or a site stops answering.',
  },
  {
    title: 'Add your domain',
    description: 'Point your DNS at us and we renew the certificate for you.',
  },
]

export default function CarouselBasic() {
  return (
    <VStack width="100%" maxWidth="$96">
      <Carousel aria-label="Getting started">
        {tips.map((tip) => (
          <Card key={tip.title} flexGrow={1}>
            <Card.Header>
              <Card.Title>{tip.title}</Card.Title>
            </Card.Header>
            <Card.Content>
              <Text tone="muted">{tip.description}</Text>
            </Card.Content>
          </Card>
        ))}
      </Carousel>
    </VStack>
  )
}
