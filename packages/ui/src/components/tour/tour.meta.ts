import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Tour',
  slug: 'tour',
  category: 'overlay',
  description:
    'A guided walk through a screen: each step highlights an element and shows a card beside it with Back, Next and Skip.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Tour'],
  files: ['components/tour/Tour.tsx', 'components/tour/index.ts'],
  keywords: [
    'tour',
    'onboarding',
    'walkthrough',
    'coach marks',
    'product tour',
    'guide',
    'spotlight',
  ],
  usage: `import { Button, Tour } from '@advui/core'

const search = useRef(null)

<Search ref={search} />
<Tour
  open={open}
  onOpenChange={setOpen}
  steps={[
    { title: 'Welcome', description: 'A quick look around.' },
    { target: search, title: 'Find anything', description: 'Search looks through every project.' },
  ]}
/>`,
  parts: [
    {
      name: 'Tour',
      props: [
        {
          name: 'steps',
          type: 'TourStep[]',
          required: true,
          description:
            '`{ target?, title, description? }`. `target` is a ref to the element the step points at; without one, the card is centered.',
        },
        { name: 'open', type: 'boolean', description: 'Controlled open state.' },
        { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Starts open.' },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the tour opens or closes (Done, Skip, Escape, Android back).',
        },
        {
          name: 'step',
          type: 'number',
          description: 'Controlled index of the current step, from 0.',
        },
        {
          name: 'defaultStep',
          type: 'number',
          default: '0',
          description: 'The step an uncontrolled tour starts on, and goes back to when closed.',
        },
        {
          name: 'onStepChange',
          type: '(step: number) => void',
          description: 'Called on Back and Next.',
        },
        {
          name: 'onComplete',
          type: '() => void',
          description:
            'Called when Done is pressed on the last step, such as to remember the tour was seen.',
        },
        {
          name: 'labels',
          type: 'Partial<TourLabels>',
          description:
            '`next`, `back`, `done`, `skip` and `progress(step, count)` (“Step 2 of 4”).',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'On web, each step is a modal `dialog` named by its title and described by “Step 2 of 4” and its description. Focus moves to it on each step, Tab stays inside it, Escape closes it, and focus goes back to where it was.',
    'On iOS and Android, the step and title are one heading, which takes screen reader focus on each step; the app behind is hidden from TalkBack and VoiceOver while the tour is open, and Android’s back button closes it.',
    'The highlighted element can still be pressed; the rest of the screen is covered.',
    'Do not hide anything only in a tour: it is for first runs, and can be skipped.',
  ],
  keyboard: [
    { keys: 'Tab / Shift+Tab', action: 'Moves between Skip, Back and Next, inside the card.' },
    { keys: 'Enter / Space', action: 'Presses the focused button.' },
    { keys: 'Escape', action: 'Closes the tour.' },
  ],
  platformNotes: {
    web: 'Scrolls each target into view and follows it as the page scrolls or resizes.',
    ios: 'Targets are measured with `measureInWindow` and not scrolled to: keep them on screen, or scroll in `onStepChange`.',
    android:
      'Targets are measured with `measureInWindow` and not scrolled to: keep them on screen, or scroll in `onStepChange`. The back button closes the tour.',
  },
  related: ['popover', 'dialog', 'portal', 'stepper'],
})
