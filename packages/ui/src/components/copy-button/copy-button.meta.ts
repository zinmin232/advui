import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Copy Button',
  slug: 'copy-button',
  category: 'buttons',
  description:
    'A button that copies a value, such as a command, link or key, and confirms it with a check and a "Copied" announcement.',
  status: 'stable',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['CopyButton', 'useClipboard', 'setClipboard', 'writeClipboard'],
  files: [
    'components/copy-button/CopyButton.tsx',
    'components/copy-button/clipboard.ts',
    'components/copy-button/index.ts',
  ],
  keywords: ['copy', 'clipboard', 'copy to clipboard', 'share link', 'api key', 'command'],
  usage: `import { CopyButton } from '@advui/core'

<CopyButton value="pnpm add @advui/core" />
<CopyButton value={inviteUrl}>Copy invite link</CopyButton>

// iOS and Android, once at app start:
import * as Clipboard from 'expo-clipboard'
import { setClipboard } from '@advui/core'
setClipboard(Clipboard.setStringAsync)`,
  parts: [
    {
      name: 'CopyButton',
      description:
        'Without children, an icon button named “Copy” with a tooltip on web; with children, a Button with that label. Takes the other Button props, such as `disabled`.',
      props: [
        { name: 'value', type: 'string', required: true, description: 'The text to copy.' },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'A visible label, e.g. “Copy link”. It reads “Copied” (`labels.copied`) for a moment after copying.',
        },
        {
          name: 'variant',
          type: "'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'",
          options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
          description:
            'Same variants as Button. Default: `ghost` without children, `outline` with them, or the ButtonGroup’s.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Button height: 32, 40 or 48px (a square without children).',
        },
        {
          name: 'timeout',
          type: 'number',
          default: '2000',
          min: 0,
          step: 100,
          description: 'How long the check (or the failure) shows, in ms.',
        },
        {
          name: 'onCopy',
          type: '(value: string) => void',
          description: 'Called with the text once it is on the clipboard.',
        },
        {
          name: 'onCopyError',
          type: '(error: unknown) => void',
          description:
            'Called when the clipboard refuses the text, or when iOS or Android have none (`setClipboard`).',
        },
        {
          name: 'labels',
          type: 'Partial<CopyButtonLabels>',
          description:
            '`copy` (the icon button’s name and tooltip, “Copy”), `copied` (“Copied”) and `failed` (“Couldn’t copy”), for translation or a more exact name such as “Copy API key”.',
        },
      ],
      children: { accepts: 'text' },
    },
    {
      name: 'useClipboard(options)',
      kind: 'hook',
      description:
        'For your own copy control: `const { copy, status } = useClipboard({ timeout, onCopy, onError })`. `copy(text)` resolves to whether it worked; `status` is `idle`, `copied` or `failed` (for `timeout` ms after). Announce the result yourself, e.g. with a toast.',
      props: [
        {
          name: 'timeout',
          type: 'number',
          default: '2000',
          description: 'How long `status` stays `copied` or `failed`, in ms.',
        },
        { name: 'onCopy', type: '(text: string) => void', description: 'Called after a copy.' },
        {
          name: 'onError',
          type: '(error: unknown) => void',
          description: 'Called when a copy fails.',
        },
      ],
    },
    {
      name: 'setClipboard(write)',
      kind: 'function',
      description:
        'Registers the app’s clipboard for every Copy Button and Code Block, once at app start: `setClipboard(Clipboard.setStringAsync)` with `expo-clipboard`. iOS and Android need one; web uses the browser’s clipboard unless one is set. `writeClipboard(text)` copies with it directly.',
      props: [
        {
          name: 'write',
          type: '((text: string) => Promise<unknown> | void) | undefined',
          required: true,
          description: 'Writes the text; throw or reject when it cannot.',
        },
      ],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Icon button',
      description: 'Next to a command. The name says what it copies: “Copy command”.',
    },
    {
      name: 'label',
      title: 'With a label',
      description: 'The label reads “Link copied” for two seconds after copying.',
    },
    {
      name: 'in-input',
      title: 'In an input',
      description: 'In a read-only field’s trailing slot.',
    },
    {
      name: 'use-clipboard',
      title: 'Your own control',
      description: '`useClipboard` copies and reports the status; a toast announces the result.',
    },
  ],
  playground: {
    component: 'CopyButton',
    staticProps: { value: 'pnpm add @advui/core' },
    controls: [
      {
        prop: 'variant',
        type: 'select',
        options: ['ghost', 'outline', 'secondary', 'default'],
        default: 'ghost',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'A button, named “Copy” (`labels.copy`) without children or by its label with them. Give it a name that says what it copies when there are several, e.g. “Copy API key”.',
    'After a press the result is announced, “Copied” or “Couldn’t copy”: through a polite live region on web, and with `AccessibilityInfo.announceForAccessibility` on iOS and Android. The icon button keeps its name; its tooltip shows the result.',
    'The check is not the only sign: the tooltip or label text changes too.',
  ],
  keyboard: [{ keys: 'Enter / Space', action: 'Copies the value.' }],
  platformNotes: {
    web: 'Uses the Clipboard API, and falls back to a hidden text area and `execCommand("copy")` where the page is not served over HTTPS.',
    ios: 'Needs `setClipboard` (e.g. `expo-clipboard`). Without it the press fails, `onCopyError` is called and a warning is logged once.',
    android:
      'Needs `setClipboard`, as on iOS. Android 13 and later show their own “Copied” preview as well.',
  },
  related: ['icon-button', 'button', 'code-block', 'input'],
})
