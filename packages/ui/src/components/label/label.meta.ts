import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Label',
  slug: 'label',
  category: 'forms',
  description: 'An accessible label linked to a form control.',
  status: 'stable',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Label'],
  files: ['components/label/Label.tsx', 'components/label/index.ts'],
  keywords: ['form', 'caption', 'field name'],
  usage: `import { Checkbox, HStack, Label } from '@adv-ui/core'

<HStack gap="$2">
  <Checkbox id="newsletter" />
  <Label htmlFor="newsletter">Subscribe to the newsletter</Label>
</HStack>`,
  parts: [
    {
      name: 'Label',
      props: [
        { name: 'htmlFor', type: 'string', description: 'The `id` of the control it labels.' },
        {
          name: 'required',
          type: 'boolean',
          default: 'false',
          description: 'Shows a visual “*” (mark the input itself `required`).',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Dims the label to match a disabled control.',
        },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Labelling controls' }],
  accessibility: [
    'On web renders `<label for>`, giving the control its accessible name and a larger click target.',
    'On native, pressing the label focuses (inputs) or toggles (checkbox/switch) the linked control.',
  ],
  related: ['input', 'checkbox', 'switch'],
})
