import { Card, Grid, Heading, Section, Text, VStack } from '@advui/core'
import { GlobeIcon, LockIcon, UsersIcon } from '@advui/icons'

const features = [
  {
    icon: <UsersIcon />,
    title: 'For every partner',
    text: 'Clusters, agencies and NGOs report in one format.',
  },
  {
    icon: <GlobeIcon />,
    title: 'Down to the township',
    text: 'Map coverage and spot the places nobody reaches.',
  },
  {
    icon: <LockIcon />,
    title: 'Private by default',
    text: 'Share figures, not the people behind them.',
  },
]

export default function SectionFeatures() {
  return (
    <Section
      id="features"
      background="muted"
      spacing={{ base: 'sm', md: 'md' }}
      aria-labelledby="features-title"
      width="100%"
    >
      <VStack gap="$6">
        <Heading id="features-title" level={2}>
          Features
        </Heading>
        <Grid columns={{ base: 1, md: 3 }} gap="$4">
          {features.map((feature) => (
            <Card key={feature.title} padding="$4" gap="$2">
              {feature.icon}
              <Text weight="semibold">{feature.title}</Text>
              <Text size="sm" tone="muted">
                {feature.text}
              </Text>
            </Card>
          ))}
        </Grid>
      </VStack>
    </Section>
  )
}
