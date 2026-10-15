import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Link',
  slug: 'link',
  category: 'navigation',
  description:
    'A text link to another page, a section or an outside site, inside a sentence or on its own.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Link'],
  files: ['components/link/Link.tsx', 'components/link/index.ts'],
  keywords: ['anchor', 'hyperlink', 'a', 'href', 'external', 'url', 'text link'],
  usage: `import { Link, Text } from '@advui/core'
import NextLink from 'next/link'

<Text>
  Read the <Link href="/docs">docs</Link> first.
</Text>
<Link href="https://tamagui.dev" external>Tamagui</Link>
<Link render={<NextLink href="/pricing" />}>Pricing</Link>
<Link onPress={() => router.push('/pricing')}>Pricing</Link>`,
  parts: [
    {
      name: 'Link',
      props: [
        { name: 'children', type: 'ReactNode', required: true, description: 'The link text.' },
        {
          name: 'href',
          type: 'string',
          description:
            'Where the link goes. On web it renders an `<a>`. On iOS and Android an absolute URL (`https:`, `mailto:`, `tel:`) opens with the system; a path in your app needs `onPress`.',
        },
        {
          name: 'onPress',
          type: '(event) => void',
          description:
            'Navigate with your router, e.g. `router.push(…)` in Expo Router. Without an `href` the link is a `<button>` on web. Call `event.preventDefault()` to stop the `href` from opening.',
        },
        {
          name: 'render',
          type: 'ReactElement',
          platforms: ['web'],
          description: 'Your router’s link on web, e.g. `<NextLink href="/pricing" />`.',
        },
        {
          name: 'external',
          type: 'boolean',
          default: 'false',
          description:
            'Shows an icon after the text. On web the link also opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`) and its name ends with “(opens in a new tab)”.',
        },
        {
          name: 'tone',
          type: "'primary' | 'muted' | 'inherit'",
          options: ['primary', 'muted', 'inherit'],
          default: "'primary'",
          description:
            '`muted` for secondary links (it darkens on hover); `inherit` takes the color of the text around it.',
        },
        {
          name: 'underline',
          type: "'always' | 'hover' | 'none'",
          options: ['always', 'hover', 'none'],
          default: "'always'",
          description:
            'Keep links inside running text underlined; `hover` and `none` suit links that are clearly links already, such as a footer row.',
        },
        {
          name: 'size',
          type: "'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'",
          options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],
          default: 'surrounding text',
          description:
            'A step of the type scale, as on Text. Leave it out inside Text so the link takes its size; give one to a link on its own.',
        },
        {
          name: 'weight',
          type: "'normal' | 'medium' | 'semibold' | 'bold'",
          options: ['normal', 'medium', 'semibold', 'bold'],
          default: 'surrounding text',
          description: 'Font weight.',
        },
        {
          name: 'labels',
          type: 'Partial<LinkLabels>',
          description: '`external`: the words added to an external link’s name, for translation.',
        },
      ],
      children: { accepts: 'text' },
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Basic',
      description: 'Links inside sentences, an inherited color, and a link on its own.',
    },
    {
      name: 'external',
      title: 'External, email and phone',
      description:
        'External links open in a new tab on web; `mailto:` and `tel:` open the mail or phone app on iOS and Android too.',
    },
    {
      name: 'tones',
      title: 'Tones and underline',
      description: 'Primary, muted and inherited colors, and a row that underlines on hover.',
    },
  ],
  playground: {
    component: 'Link',
    children: 'Read the docs',
    controls: [
      { prop: 'href', type: 'text', default: 'https://example.com' },
      {
        prop: 'tone',
        type: 'select',
        options: ['primary', 'muted', 'inherit'],
        default: 'primary',
      },
      {
        prop: 'underline',
        type: 'select',
        options: ['always', 'hover', 'none'],
        default: 'always',
      },
      { prop: 'external', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'Renders a real `<a href>` on web, so it works with middle-click, “Open in new tab” and the browser’s link list. Without an `href` it is a `<button>` with the `link` role.',
    'On iOS and Android it has the `link` role, and a double-tap with TalkBack or VoiceOver follows it. Inside Text it stays part of the sentence.',
    'Underlined by default, so links in text are not told apart by color alone (WCAG 1.4.1). `primary` and `muted` text meet 4.5:1 contrast in light and dark mode.',
    'External links say “(opens in a new tab)” after their text on web; the icon is decorative on iOS and Android, where nothing opens a tab.',
    'Shows a focus ring for keyboard users.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the link.' },
    { keys: 'Enter', action: 'Follows the link.' },
  ],
  responsive:
    'Inside text the link wraps with the sentence; the external icon stays on the line of the last word.',
  platformNotes: {
    web: 'Renders `<a href>`; pass `render` for client-side routing (Next.js, React Router). `onPress` runs before the browser follows the `href`.',
    ios: 'An absolute `href` opens with `Linking.openURL`. A path needs `onPress`: without it the link is not announced as a link and does nothing, and a warning says so in development.',
    android:
      'An absolute `href` opens with `Linking.openURL`. A path needs `onPress`: without it the link is not announced as a link and does nothing, and a warning says so in development.',
  },
  related: ['button', 'breadcrumb', 'typography', 'navigation-menu'],
})
