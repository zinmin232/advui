import { Badge, Card, Carousel, Text, VStack } from '@advui/core'

const plans = [
  { name: 'Hobby', price: '0', note: 'One project, community support' },
  { name: 'Starter', price: '12', note: 'Five projects and a custom domain' },
  { name: 'Team', price: '$29', note: 'Shared projects and roles', popular: true },
  { name: 'Business', price: '$79', note: 'Audit log and single sign-on' },
  { name: 'Enterprise', price: 'Custom', note: 'Contracts, support and uptime terms' },
]

export default function CarouselSeveralPerView() {
  return (
    <VStack width="100%">
      {/* A fifth of the next card shows on phones, so people see there is more. */}
      <Carousel aria-label="Plans" slidesPerView={{ base: 1.2, sm: 2, md: 3 }} gap="3">
        {plans.map((plan) => (
          <Card key={plan.name} flexGrow={1}>
            <Card.Header>
              <Card.Title>{plan.name}</Card.Title>
              {plan.popular ? <Badge alignSelf="flex-start">Popular</Badge> : null}
            </Card.Header>
            <Card.Content gap="1">
              <Text size="2xl" weight="semibold">
                {plan.price}
              </Text>
              <Text size="sm" tone="muted">
                {plan.note}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </Carousel>
    </VStack>
  )
}
