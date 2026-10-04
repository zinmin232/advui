import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Loading Button',
  slug: 'loading-button',
  category: 'buttons',
  description:
    'A button that displays a loading indicator and prevents interaction while an asynchronous action is in progress.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['LoadingButton', 'LoadingButtonProps', 'SpinnerPosition'],
  files: ['components/loading-button/LoadingButton.tsx', 'components/loading-button/index.ts'],
  keywords: ['loading', 'spinner', 'submit', 'async', 'busy', 'pending', 'save', 'double submit'],
  usage: `import { LoadingButton } from '@advui/core'

const [saving, setSaving] = useState(false)

const save = async () => {
  setSaving(true)
  try {
    await saveData()
  } finally {
    setSaving(false)
  }
}

<LoadingButton loading={saving} loadingText="Saving…" onPress={save}>
  Save
</LoadingButton>`,
  parts: [
    {
      name: 'LoadingButton',
      description:
        'Takes every Button prop (`variant`, `size`, `icon`, `iconAfter`, `fullWidth`, `disabled`, `onPress`, `theme`, style props…). Your app owns `loading`; the button only shows it and blocks presses.',
      props: [
        {
          name: 'loading',
          type: 'boolean',
          default: 'false',
          description:
            'Shows the spinner, sets `aria-busy` and ignores presses, clicks and keys. When false it is a plain Button.',
        },
        {
          name: 'loadingText',
          type: 'ReactNode',
          description:
            'Replaces the label while loading, e.g. "Saving…". Without it the label stays next to the spinner.',
        },
        {
          name: 'spinner',
          type: 'ReactNode',
          default: '`<Spinner size="sm" />` in the label color',
          description: 'A custom indicator element. Icons take the button’s icon size and color.',
        },
        {
          name: 'spinnerPosition',
          type: "'left' | 'right'",
          options: ['left', 'right'],
          default: "'left'",
          description:
            "Side of the spinner. It takes the place of the icon on that side. With only `iconAfter`, it defaults to `'right'`.",
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Works as on Button. While loading the button is disabled either way.',
        },
      ],
      children: { accepts: 'text' },
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic', description: 'Normal and loading.' },
    {
      name: 'loading-text',
      title: 'Loading text',
      description: 'Say what is happening while the action runs.',
    },
    { name: 'custom-spinner', title: 'Custom spinner' },
    {
      name: 'spinner-position',
      title: 'Spinner position',
      description:
        'The spinner replaces the icon on its side: the leading icon on the left, `iconAfter` on the right.',
    },
    {
      name: 'async',
      title: 'Async operation',
      description:
        'The parent sets `loading` around the request. Press it several times: presses while saving are ignored.',
    },
  ],
  playground: {
    component: 'LoadingButton',
    children: 'Save',
    controls: [
      { prop: 'loading', type: 'boolean', default: true },
      { prop: 'loadingText', type: 'text', default: 'Saving…' },
      { prop: 'spinnerPosition', type: 'select', options: ['left', 'right'], default: 'left' },
      {
        prop: 'variant',
        type: 'select',
        options: ['default', 'secondary', 'outline', 'ghost', 'destructive'],
        default: 'default',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'It is a Button: a native `<button>` on web and a `button` role on iOS and Android, named by its visible label.',
    'While loading it is disabled and has `aria-busy="true"`, so screen readers report it as busy and unavailable, and Enter, Space, clicks and taps do nothing.',
    'The spinner is hidden from assistive technology so it does not change the button’s name. The name is the label, or `loadingText` while loading: use `loadingText` when the change should be heard.',
    'Like any disabled `<button>`, it loses keyboard focus while loading on web. Announce the result (for example in a polite live region, as in the Async example) when the action finishes.',
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Activates the button; ignored while loading.' },
    { keys: 'Tab', action: 'Moves focus; a loading button is skipped.' },
  ],
  responsive:
    'Height, padding and radius come from `size`, so they do not change while loading. A longer `loadingText` widens the button; keep it about as long as the label.',
  platformNotes: {
    web: 'Uses the browser spinner SVG from Spinner.',
    ios: 'The default spinner is the platform ActivityIndicator.',
    android: 'Same as iOS; the ripple is off while loading.',
  },
  related: ['button', 'spinner', 'icon-button'],
})
