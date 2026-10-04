import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Stepper',
  slug: 'stepper',
  category: 'navigation',
  description: 'Progress through a multi-step flow, such as a form wizard or checkout.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Stepper',
    'StepperFrame',
    'StepIndicator',
    'StepConnector',
    'StepTitle',
    'StepDescription',
    'StepperProps',
    'StepperStepProps',
    'StepStatus',
    'StepperLabels',
  ],
  files: ['components/stepper/Stepper.tsx', 'components/stepper/index.ts'],
  keywords: ['stepper', 'steps', 'wizard', 'progress', 'multi-step', 'checkout', 'onboarding'],
  usage: `import { Stepper } from '@advui/core'

<Stepper activeStep={1}>
  <Stepper.Step title="Organization" description="Name and type" />
  <Stepper.Step title="Activities" />
  <Stepper.Step title="Review" />
</Stepper>`,
  parts: [
    {
      name: 'Stepper',
      props: [
        {
          name: 'activeStep',
          type: 'number',
          required: true,
          description: 'Index of the current step, from 0. Earlier steps are complete.',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          options: ['horizontal', 'vertical'],
          default: "'horizontal'",
          description: 'Vertical steps can show the current step’s content under it.',
        },
        {
          name: 'onStepPress',
          type: '(index: number) => void',
          description: 'Makes steps buttons that go back (or anywhere, with `linear={false}`).',
        },
        {
          name: 'linear',
          type: 'boolean',
          default: 'true',
          description: 'Only steps up to the current one can be pressed.',
        },
        {
          name: 'labels',
          type: 'Partial<StepperLabels>',
          description: 'Screen-reader text ("Step 2 of 3", "completed"…), for translation.',
        },
      ],
      children: { accepts: ['Stepper.Step'] },
    },
    {
      name: 'Stepper.Step',
      props: [
        { name: 'title', type: 'ReactNode', required: true, description: 'Name of the step.' },
        { name: 'description', type: 'ReactNode', description: 'Muted line under the title.' },
        {
          name: 'status',
          type: "'complete' | 'current' | 'upcoming' | 'error'",
          options: ['complete', 'current', 'upcoming', 'error'],
          default: 'from `activeStep`',
          description: 'Override, e.g. `error` for a step that failed validation.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Vertical only: shown under the step while it is current.',
        },
      ],
      children: { accepts: 'any' },
      parents: ['Stepper'],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Horizontal',
      description: 'Press a finished step to go back to it.',
    },
    {
      name: 'vertical',
      title: 'Vertical, with content',
      description: 'The third step shows the error status.',
    },
  ],
  accessibility: [
    'An ordered list; each step reads its number, title and status ("Step 1 of 3: Organization, completed"). Set `labels` to translate.',
    'The current step has `aria-current="step"` on web.',
    'Markers and lines are hidden; status is never color alone (numbers, a check, a cross and the words).',
    'With `onStepPress`, reachable steps are buttons; the others stay plain text.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between pressable steps.' },
    { keys: 'Enter / Space', action: 'Goes to the focused step.' },
  ],
  responsive:
    'Below the `xs` breakpoint a horizontal stepper shows only the current step’s text next to the markers (the rest stays readable by screen readers). With more than four steps, use `orientation="vertical"` on phones.',
  platformNotes: {
    web: 'The step number and status are visually hidden text.',
    ios: 'Each step is one accessible element whose name holds the number, title, status and description (when they are text).',
    android: 'Same as iOS.',
  },
  related: ['progress', 'tabs', 'timeline'],
})
