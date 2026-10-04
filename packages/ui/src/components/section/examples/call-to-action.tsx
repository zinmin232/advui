import { Button, Heading, Section, Stack, Text, VStack } from '@advui/core'

export default function SectionCallToAction() {
  return (
    <VStack gap="$4" width="100%">
      <Section background="inverse" spacing="md" container="lg" aria-label="Get started">
        <Stack direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} gap="$4">
          <VStack flex={1} gap="$1">
            <Heading level={3}>Ready for the next round?</Heading>
            <Text tone="muted">Reporting for October closes on the 10th.</Text>
          </VStack>
          <Button>Open the form</Button>
        </Stack>
      </Section>
      <Section background="primary" spacing="sm" container="lg" aria-label="Newsletter">
        <Stack direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} gap="$4">
          <Text flex={1} weight="medium">
            Get the monthly gaps report by email.
          </Text>
          <Button>Subscribe</Button>
        </Stack>
      </Section>
    </VStack>
  )
}
