import { Button, HStack, Heading, Section, Text, VStack } from '@advui/core'
import { ArrowRightIcon } from '@advui/icons'

export default function SectionHero() {
  return (
    <Section spacing="lg" container="md" aria-labelledby="hero-title" width="100%">
      <VStack gap="$4" align="center">
        <Heading id="hero-title" level={2} size="4xl" textAlign="center">
          Who does what, where
        </Heading>
        <Text tone="muted" textAlign="center">
          One place for partners to report their activities, and for everyone to see the gaps.
        </Text>
        <HStack gap="$2" wrap="wrap" distribute="center">
          <Button iconAfter={<ArrowRightIcon />}>Start reporting</Button>
          <Button variant="outline">See the dashboard</Button>
        </HStack>
      </VStack>
    </Section>
  )
}
