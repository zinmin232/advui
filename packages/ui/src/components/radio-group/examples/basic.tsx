import { RadioGroup } from '@advui/core'
import { useState } from 'react'

const plans = [
  { value: 'free', label: 'Free', description: 'Up to 3 projects' },
  { value: 'pro', label: 'Pro', description: 'Unlimited projects' },
  { value: 'team', label: 'Team', description: 'Shared workspaces' },
]

export default function RadioGroupBasic() {
  const [plan, setPlan] = useState('pro')
  return (
    <RadioGroup value={plan} onValueChange={setPlan} aria-label="Plan">
      {plans.map((p) => (
        <RadioGroup.Item key={p.value} {...p} />
      ))}
    </RadioGroup>
  )
}
