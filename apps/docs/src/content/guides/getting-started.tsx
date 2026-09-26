import { Code } from '../../components/code'
import { A, C, Callout, H2, H3, LI, P, UL } from '../../components/prose'
import type { TocItem } from '../../components/docs-shell'
import { siteConfig } from '../../lib/site'

export const introductionToc: TocItem[] = [
  { id: 'what-it-is', title: 'What it is' },
  { id: 'why-tamagui', title: 'Why Tamagui' },
  { id: 'platforms', title: 'Supported platforms' },
  { id: 'packages', title: 'Packages' },
  { id: 'principles', title: 'Principles' },
]

export async function Introduction() {
  return (
    <>
      <H2 id="what-it-is">What it is</H2>
      <P>
        {siteConfig.name} is a component library for building real products that ship to the web,
        iOS and Android from one codebase. The same <C>{'<Button>'}</C> renders a semantic{' '}
        <C>{'<button>'}</C> in Next.js and a native pressable in Expo — styled by one theme, typed
        end to end, and accessible on every platform.
      </P>
      <P>
        You can install it as a package, or copy component source into your app with the CLI
        (inspired by shadcn/ui) and own the code.
      </P>
      <H2 id="why-tamagui">Why Tamagui</H2>
      <UL>
        <LI>
          <strong>One styling system for web and native.</strong> Tamagui compiles styles to atomic
          CSS with CSS variables on web and to optimized React Native styles on iOS/Android.
        </LI>
        <LI>
          <strong>Real design tokens.</strong> Space, size, radius, colors and fonts are tokens (
          <C>$4</C>,<C>$primary</C>) checked by TypeScript — no magic numbers.
        </LI>
        <LI>
          <strong>Themes without re-renders.</strong> Light/dark switching on web swaps CSS
          variables instead of re-rendering the tree.
        </LI>
        <LI>
          <strong>Accessible primitives.</strong> Dialog, Select, Tabs, Checkbox and friends provide
          focus management, keyboard handling and ARIA semantics we build on.
        </LI>
      </UL>
      <H2 id="platforms">Supported platforms</H2>
      <UL>
        <LI>React 19 and Next.js 16 (App Router, SSR/RSC-safe client components)</LI>
        <LI>React Native 0.86 and Expo SDK 57 (Expo Go compatible — no custom native modules)</LI>
        <LI>Web through react-native-web; iOS and Android natively</LI>
      </UL>
      <H2 id="packages">Packages</H2>
      <UL>
        <LI>
          <C>@adv-ui/core</C> — components and <C>UniversalProvider</C>
        </LI>
        <LI>
          <C>@adv-ui/theme</C> — tokens, color presets and <C>createUniversalConfig()</C>
        </LI>
        <LI>
          <C>@adv-ui/icons</C> — the icon abstraction and a tree-shakable default set
        </LI>
        <LI>
          <C>@adv-ui/utils</C> — color math (OKLCH, WCAG contrast) and helpers
        </LI>
        <LI>
          <C>{siteConfig.cliName}</C> — CLI for copying component source
        </LI>
      </UL>
      <H2 id="principles">Principles</H2>
      <UL>
        <LI>
          Composition over configuration: <C>Card.Header</C>, <C>Card.Title</C>… instead of dozens
          of boolean props.
        </LI>
        <LI>
          Every color flows through the theme; lint rules reject hard-coded colors in components.
        </LI>
        <LI>
          A component is only “done” when it works on web, iOS and Android, in light and dark, with
          tests and docs.
        </LI>
      </UL>
      <Callout title="Next step">
        Follow the <A href="/docs/installation">installation guide</A>, then browse the{' '}
        <A href="/docs/components">components</A>.
      </Callout>
    </>
  )
}

export const installationToc: TocItem[] = [
  { id: 'install', title: 'Install' },
  { id: 'config', title: 'Create a config' },
  { id: 'nextjs', title: 'Next.js' },
  { id: 'expo', title: 'Expo' },
  { id: 'first-component', title: 'Use a component' },
]

export async function Installation() {
  return (
    <>
      <H2 id="install">Install</H2>
      <P>
        Install the core package. Peer dependencies (Tamagui and React Native Web on web) are
        installed automatically by pnpm and npm 7+.
      </P>
      <Code lang="bash" code={`pnpm add @adv-ui/core @adv-ui/theme @adv-ui/icons tamagui`} />
      <P>Or let the CLI detect your framework and do it for you:</P>
      <Code lang="bash" code={`npx ${siteConfig.cliName} init`} />
      <H2 id="config">Create a config</H2>
      <P>One config drives every component. Pick a preset or pass your brand colors:</P>
      <Code
        title="tamagui.config.ts"
        code={`import { createUniversalConfig } from '@adv-ui/theme'

export const config = createUniversalConfig({
  preset: 'indigo',          // or 'violet', 'emerald', 'rose', 'slate'…
  colors: { primary: '#6366f1' }, // optional brand override
  radius: 'md',              // 'none' | 'sm' | 'md' | 'lg' | 'xl'
  fontScale: 'default',      // 'compact' | 'default' | 'large'
})

export default config`}
      />
      <H2 id="nextjs">Next.js</H2>
      <P>Alias React Native to React Native Web and transpile the packages:</P>
      <Code
        title="next.config.ts"
        code={`import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@adv-ui/core', '@adv-ui/theme', '@adv-ui/icons', '@adv-ui/utils', 'react-native-web'],
  turbopack: {
    resolveAlias: { 'react-native': 'react-native-web' },
    resolveExtensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
}

export default nextConfig`}
      />
      <P>
        Wrap the app in a client provider. Tamagui injects its CSS during SSR through React 19 style
        hoisting — no extra wiring:
      </P>
      <Code
        title="app/providers.tsx"
        code={`'use client'

import { UniversalProvider } from '@adv-ui/core'
import { config } from '../tamagui.config'

export function Providers({ children }: { children: React.ReactNode }) {
  return <UniversalProvider config={config}>{children}</UniversalProvider>
}`}
      />
      <H2 id="expo">Expo</H2>
      <P>
        Expo SDK 52+ configures Metro for monorepos automatically. Wrap your root layout and pass
        the safe-area insets so toasts and sheets stay clear of the notch and home indicator:
      </P>
      <Code
        title="app/_layout.tsx"
        code={`import { UniversalProvider } from '@adv-ui/core'
import { Stack } from 'expo-router'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { config } from '../tamagui.config'

function Providers() {
  const insets = useSafeAreaInsets()
  return (
    <UniversalProvider config={config} insets={insets}>
      <Stack />
    </UniversalProvider>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Providers />
    </SafeAreaProvider>
  )
}`}
      />
      <Callout title="Expo Go">
        No custom native code is required: icons use react-native-svg (bundled with Expo) and
        animations use React Native Animated.
      </Callout>
      <H2 id="first-component">Use a component</H2>
      <Code
        code={`import { Button, Card, Input } from '@adv-ui/core'

export function ProfileCard() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Profile</Card.Title>
      </Card.Header>
      <Card.Content>
        <Input placeholder="Email" />
      </Card.Content>
      <Card.Footer>
        <Button>Save</Button>
      </Card.Footer>
    </Card>
  )
}`}
      />
      <H3>Color mode</H3>
      <P>
        <C>UniversalProvider</C> follows the system setting by default. Read or change it anywhere
        with <C>useColorMode()</C>, or control it with the <C>colorMode</C> prop.
      </P>
    </>
  )
}

export const cliToc: TocItem[] = [
  { id: 'init', title: 'init' },
  { id: 'add', title: 'add' },
  { id: 'list', title: 'list' },
  { id: 'registry', title: 'How the registry works' },
]

export async function Cli() {
  return (
    <>
      <P>
        The CLI copies component source into your project so you can change anything. Dependencies
        between components (a Dialog needs IconButton, which needs Button…) are resolved
        automatically.
      </P>
      <H2 id="init">init</H2>
      <Code lang="bash" code={`npx ${siteConfig.cliName} init`} />
      <UL>
        <LI>Detects Next.js, Expo, React Native or Vite and your package manager.</LI>
        <LI>
          Writes <C>adv-ui.json</C> (target folder, registry) and a <C>tamagui.config.ts</C>.
        </LI>
        <LI>
          Installs the theme, icons, utils and Tamagui packages, and prints framework setup notes.
        </LI>
      </UL>
      <H2 id="add">add</H2>
      <Code
        lang="bash"
        code={`npx ${siteConfig.cliName} add button dialog\nnpx ${siteConfig.cliName} add --all\nnpx ${siteConfig.cliName} add select --overwrite`}
      />
      <P>
        Files keep their relative layout (<C>ui/components/button/Button.tsx</C>), so internal
        imports work without rewriting. Existing files are never overwritten unless you pass{' '}
        <C>--overwrite</C>.
      </P>
      <H2 id="list">list</H2>
      <Code lang="bash" code={`npx ${siteConfig.cliName} list`} />
      <H2 id="registry">How the registry works</H2>
      <P>
        Every component has a metadata file. <C>pnpm registry:build</C> reads it, embeds the source
        files, and derives npm and component dependencies from import statements. The JSON is
        published at <A href="/r/index.json">/r/index.json</A> and{' '}
        <A href="/r/button.json">/r/button.json</A>.
      </P>
      <Code
        lang="json"
        title="registry/button.json (excerpt)"
        code={`{
  "name": "button",
  "type": "registry:component",
  "dependencies": ["@adv-ui/icons"],
  "registryDependencies": ["spinner"],
  "files": [{ "path": "components/button/Button.tsx", "content": "…" }]
}`}
      />
    </>
  )
}

export const accessibilityToc: TocItem[] = [
  { id: 'semantics', title: 'Semantics' },
  { id: 'keyboard', title: 'Keyboard & focus' },
  { id: 'contrast', title: 'Contrast' },
  { id: 'motion', title: 'Reduced motion' },
  { id: 'touch', title: 'Touch targets' },
  { id: 'testing', title: 'How we test' },
]

export async function Accessibility() {
  return (
    <>
      <P>
        Accessibility is part of each component’s definition of done. Every component page documents
        its strategy; this page summarises the shared rules.
      </P>
      <H2 id="semantics">Semantics</H2>
      <UL>
        <LI>
          Native elements on web (<C>button</C>, <C>input</C>, <C>label</C>, <C>h1–h6</C>) and ARIA
          roles on native (<C>role</C>, <C>aria-*</C> props map to iOS/Android accessibility APIs).
        </LI>
        <LI>
          Icons are decorative by default; icon-only buttons require <C>aria-label</C> at the type
          level.
        </LI>
        <LI>
          Composite widgets follow the WAI-ARIA Authoring Practices (tabs, radio group, dialog,
          listbox).
        </LI>
      </UL>
      <H2 id="keyboard">Keyboard &amp; focus</H2>
      <UL>
        <LI>
          Visible 2px focus ring using the theme <C>ring</C> color, shown only for keyboard focus (
          <C>:focus-visible</C>).
        </LI>
        <LI>Dialogs trap focus, restore it to the trigger and close on Escape.</LI>
        <LI>Tooltips open on keyboard focus as well as hover and dismiss with Escape.</LI>
      </UL>
      <H2 id="contrast">Contrast</H2>
      <P>
        Theme generation enforces WCAG 2.x AA (4.5:1) for every text/background pair and 3:1 for
        focus rings — including custom brand colors. The test suite checks all presets in light and
        dark mode.
      </P>
      <H2 id="motion">Reduced motion</H2>
      <P>
        When the OS asks for reduced motion, CSS transitions are removed on web and components skip
        animations on native (<C>useReducedMotion()</C>). Progress indicators keep moving slowly
        because they convey state.
      </P>
      <H2 id="touch">Touch targets</H2>
      <P>
        On iOS/Android, buttons extend their pressable area with <C>hitSlop</C> to reach 44pt; list
        items in sheets grow to 44pt on touch devices.
      </P>
      <H2 id="testing">How we test</H2>
      <P>
        Unit tests query by role and accessible name (Testing Library), exercise keyboard
        interaction and assert ARIA state. Tests caught — and we fixed — a Tamagui{' '}
        <C>Dialog.Close</C> label override and a tooltip that did not open on keyboard focus.
      </P>
    </>
  )
}

export const platformsToc: TocItem[] = [
  { id: 'shared', title: 'One codebase' },
  { id: 'differences', title: 'Deliberate differences' },
  { id: 'files', title: 'Platform files' },
  { id: 'verified', title: 'What is verified' },
]

export async function Platforms() {
  return (
    <>
      <H2 id="shared">One codebase</H2>
      <P>
        Components are written once with Tamagui and React Native primitives. Web builds resolve{' '}
        <C>react-native</C> to <C>react-native-web</C>; native builds use React Native directly.
      </P>
      <H2 id="differences">Deliberate differences</H2>
      <UL>
        <LI>
          <strong>Select</strong> opens a dropdown on desktop and a bottom sheet on touch devices
          and native.
        </LI>
        <LI>
          <strong>Tooltip</strong> is web-only; touch devices have no hover, so only the trigger
          renders.
        </LI>
        <LI>
          <strong>Spinner</strong> uses a CSS-animated SVG on web and the native ActivityIndicator
          on iOS/Android.
        </LI>
        <LI>
          <strong>Icons</strong> render DOM SVG on web (no react-native-svg in web bundles) and
          react-native-svg on native.
        </LI>
      </UL>
      <H2 id="files">Platform files</H2>
      <P>
        When behaviour must differ, the implementation is split with <C>.native.tsx</C> files, which
        Metro picks for iOS/Android and web bundlers ignore. This is used sparingly — only four
        files today.
      </P>
      <Code
        lang="bash"
        code={`components/spinner/Spinner.tsx         # web\ncomponents/spinner/Spinner.native.tsx  # iOS + Android`}
      />
      <H2 id="verified">What is verified</H2>
      <UL>
        <LI>
          Web: unit tests (jsdom + react-native-web), Next.js production build, Playwright
          end-to-end and visual tests.
        </LI>
        <LI>Android: the Expo playground runs in Expo Go on an Android emulator.</LI>
        <LI>
          iOS: builds with the same code path; not verified on a device in CI yet (requires macOS).
        </LI>
      </UL>
    </>
  )
}
