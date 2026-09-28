import { Button, HStack, Input, Label, Stepper, Text, VStack } from '@advui/core'
import { useState } from 'react'

export default function StepperVertical() {
  const [active, setActive] = useState(1)
  const next = () => setActive(active + 1)
  return (
    <Stepper activeStep={active} orientation="vertical" aria-label="Report steps" maxWidth="$96">
      <Stepper.Step title="Choose a template" description="Monthly 5W report">
        <Button size="sm" alignSelf="flex-start" onPress={next}>
          Continue
        </Button>
      </Stepper.Step>
      <Stepper.Step title="Add the reporting period">
        <VStack gap="$2">
          <Label htmlFor="stepper-period">Period</Label>
          <Input id="stepper-period" placeholder="September 2026" />
        </VStack>
        <HStack gap="$2">
          <Button size="sm" variant="outline" onPress={() => setActive(active - 1)}>
            Back
          </Button>
          <Button size="sm" onPress={next}>
            Continue
          </Button>
        </HStack>
      </Stepper.Step>
      <Stepper.Step title="Upload the data" status={active === 2 ? 'error' : undefined}>
        <Text size="sm" tone="error">
          Three rows have no place code.
        </Text>
        <Button size="sm" alignSelf="flex-start" onPress={next}>
          Fix and continue
        </Button>
      </Stepper.Step>
      <Stepper.Step title="Publish">
        <Button size="sm" alignSelf="flex-start" onPress={() => setActive(0)}>
          Start over
        </Button>
      </Stepper.Step>
    </Stepper>
  )
}
