import { HStack, Label, RadioGroup, Text, VStack } from '@adv-ui/core'
import { useState } from 'react'

const plans = [
  { value: 'free', label: 'Free', hint: 'Up to 3 projects' },
  { value: 'pro', label: 'Pro', hint: 'Unlimited projects' },
  { value: 'team', label: 'Team', hint: 'Shared workspaces' },
]

export default function RadioGroupBasic() {
  const [plan, setPlan] = useState('pro')
  return (
    <RadioGroup value={plan} onValueChange={setPlan} aria-label="Plan">
      {plans.map((p) => (
        <HStack key={p.value} gap="$3" alignItems="flex-start">
          <RadioGroup.Item value={p.value} id={`plan-${p.value}`} marginTop="$0.5" />
          <VStack>
            <Label htmlFor={`plan-${p.value}`}>{p.label}</Label>
            <Text size="sm" tone="muted">
              {p.hint}
            </Text>
          </VStack>
        </HStack>
      ))}
    </RadioGroup>
  )
}
