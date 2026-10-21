import { Button, Carousel, HStack, Heading, Text, VStack } from '@advui/core'
import { useState } from 'react'

const steps = [
  { title: 'Welcome', body: 'Track every visit, referral and follow-up in one place.' },
  { title: 'Add your clinic', body: 'Your address and opening hours go on every referral.' },
  { title: 'Invite staff', body: 'Nurses and front desk staff get their own sign-in.' },
]

export default function CarouselControlled() {
  const [index, setIndex] = useState(0)
  const last = index === steps.length - 1
  return (
    <VStack width="100%" maxWidth="96" gap="4">
      <Carousel aria-label="Welcome tour" index={index} onIndexChange={setIndex} showArrows={false}>
        {steps.map((step) => (
          <Carousel.Item key={step.title} gap="1" paddingVertical="2">
            <Heading level={3} size="lg">
              {step.title}
            </Heading>
            <Text tone="muted">{step.body}</Text>
          </Carousel.Item>
        ))}
      </Carousel>
      <HStack distribute="between">
        <Button variant="ghost" disabled={index === 0} onPress={() => setIndex(index - 1)}>
          Back
        </Button>
        <Button onPress={() => setIndex(last ? 0 : index + 1)}>
          {last ? 'Start over' : 'Next'}
        </Button>
      </HStack>
    </VStack>
  )
}
