import { Button, HStack, Stepper, VStack } from '@advui/core'
import { useState } from 'react'

const steps = [
  { title: 'Organization', description: 'Name and type' },
  { title: 'Activities', description: 'Sectors and locations' },
  { title: 'Review', description: 'Check and submit' },
]

export default function StepperBasic() {
  const [active, setActive] = useState(1)
  return (
    <VStack gap="$6" width="100%">
      <Stepper activeStep={active} onStepPress={setActive} aria-label="Registration progress">
        {steps.map((step) => (
          <Stepper.Step key={step.title} title={step.title} description={step.description} />
        ))}
      </Stepper>
      <HStack gap="$2" justifyContent="flex-end">
        <Button variant="outline" disabled={active === 0} onPress={() => setActive(active - 1)}>
          Back
        </Button>
        <Button disabled={active === steps.length} onPress={() => setActive(active + 1)}>
          {active >= steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </HStack>
    </VStack>
  )
}
