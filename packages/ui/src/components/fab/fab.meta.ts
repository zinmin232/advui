import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Floating Action Button',
  slug: 'fab',
  category: 'buttons',
  description:
    'The primary action of a screen, such as Compose or New, floating above the content.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Fab'],
  files: ['components/fab/Fab.tsx', 'components/fab/index.ts'],
  keywords: ['fab', 'floating', 'material', 'compose', 'primary action', 'extended fab'],
  usage: `import { Fab } from '@advui/core'
import { EditIcon } from '@advui/icons'

<Fab icon={<EditIcon />} aria-label="Compose" onPress={compose} />
<Fab icon={<EditIcon />} label="Compose" placement="bottom-end" onPress={compose} />`,
  parts: [
    {
      name: 'Fab',
      props: [
        { name: 'icon', type: 'ReactNode', required: true, description: 'The action’s icon.' },
        {
          name: 'label',
          type: 'string',
          description: 'Visible text: makes it an extended FAB. Icon-only FABs need `aria-label`.',
        },
        {
          name: 'variant',
          type: "'soft' | 'primary' | 'secondary' | 'surface'",
          default: "'soft'",
          description: '`soft` is Material’s primary container color.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: '40, 56 or 96 square (icon-only).',
        },
        {
          name: 'placement',
          type: "'bottom-end' | 'bottom-start' | 'bottom-center'",
          description: 'Pins it to a corner of the nearest positioned parent.',
        },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Not interactive.' },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Sizes and variants' },
    {
      name: 'extended',
      title: 'Extended, pinned to a corner',
      description: 'A label makes the action clear; placement keeps it above the content.',
    },
  ],
  accessibility: [
    'A button: `<button>` on web, the button role on iOS and Android.',
    'Icon-only FABs need an `aria-label` naming the action (“Compose”), not the icon.',
    'Use one FAB per screen for its most important action.',
    'The smallest size is 40pt; keep it clear of other touch targets.',
  ],
  keyboard: [{ keys: 'Enter / Space', action: 'Runs the action.' }],
  responsive:
    'With `placement` it floats 16px from the edges of its container. Leave space below scrolling content so it never covers the last item.',
  platformNotes: {
    web: 'A native `<button type="button">` with a shadow that lifts on hover.',
    ios: 'Keep it above the home indicator: give the container a bottom safe-area inset.',
    android:
      'Uses elevation for its shadow. With `androidRipple` (on in `material()`), presses show the native ripple.',
  },
  related: ['button', 'icon-button', 'navigation-bar'],
})
