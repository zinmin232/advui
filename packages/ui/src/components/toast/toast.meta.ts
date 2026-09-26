import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Toast',
  slug: 'toast',
  category: 'feedback',
  description: 'Brief, non-blocking notifications triggered imperatively with `toast()`.',
  status: 'beta',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['toast', 'Toaster'],
  files: ['components/toast/Toaster.tsx', 'components/toast/index.ts'],
  keywords: ['notification', 'snackbar', 'message', 'sonner'],
  usage: `import { toast } from '@advui/core'

toast.success('Profile saved', { description: 'Your changes are live.' })`,
  parts: [
    {
      name: 'toast(title, options?)',
      description: 'Also `toast.success / error / warning / info / loading / promise / dismiss`.',
      props: [
        { name: 'description', type: 'ReactNode', description: 'Secondary text.' },
        {
          name: 'duration',
          type: 'number',
          default: '4000',
          description: 'Milliseconds before auto-dismiss.',
        },
        {
          name: 'action',
          type: '{ label: string; onClick: () => void }',
          description: 'Inline action button (e.g. Undo).',
        },
        {
          name: 'dismissible',
          type: 'boolean',
          default: 'true',
          description: 'Shows the close button and allows swipe.',
        },
      ],
    },
    {
      name: 'Toaster',
      description:
        'Rendered automatically by UniversalProvider; configure with its `toaster` prop.',
      props: [
        {
          name: 'position',
          type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'",
          default: "'bottom-right'",
          description: 'Screen corner.',
        },
        { name: 'duration', type: 'number', default: '4000', description: 'Default duration.' },
        {
          name: 'visibleToasts',
          type: 'number',
          default: '4',
          description: 'Maximum stacked toasts.',
        },
      ],
    },
  ],
  examples: [
    { name: 'types', title: 'Types' },
    { name: 'action', title: 'With action' },
  ],
  accessibility: [
    'Toasts live in a labelled “Notifications” region and are announced politely.',
    'Pause-on-hover/focus prevents toasts from disappearing while being read; Alt+T focuses the region.',
    'Don’t put the only path to an action in a toast — it disappears.',
    'Swipe to dismiss on touch; reduced motion disables slide animations.',
  ],
  keyboard: [
    { keys: 'Alt + T', action: 'Moves focus to the notifications region.' },
    { keys: 'Tab', action: 'Moves through toast actions.' },
  ],
  platformNotes: {
    web: 'Stacked in the chosen corner; hover expands the stack.',
    ios: 'Rendered in-app with swipe-to-dismiss.',
    android: 'Rendered in-app with swipe-to-dismiss.',
  },
  related: ['alert', 'snackbar'],
})
