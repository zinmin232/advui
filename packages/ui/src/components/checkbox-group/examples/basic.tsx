import { CheckboxGroup } from '@advui/core'

const features = [
  { value: 'backups', label: 'Daily backups', description: 'Kept for 30 days.' },
  { value: 'analytics', label: 'Usage analytics', description: 'Page views, without cookies.' },
  { value: 'sso', label: 'Single sign-on', description: 'On the Team plan.', disabled: true },
]

export default function CheckboxGroupBasic() {
  return (
    <CheckboxGroup aria-label="Project features" defaultValue={['backups']} maxWidth={360}>
      {features.map((feature) => (
        <CheckboxGroup.Item key={feature.value} {...feature} />
      ))}
    </CheckboxGroup>
  )
}
