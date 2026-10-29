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
          <C>4</C>,<C>primary</C>) checked by TypeScript — no magic numbers.
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
      <P>
        Install only what you use. Every component package builds on <C>@advui/core</C> and needs no
        other third-party libraries.
      </P>
      <UL>
        <LI>
          <C>@advui/core</C> — general-purpose components (buttons, forms, overlays, navigation,
          feedback, layout, media) and <C>UniversalProvider</C>
        </LI>
        <LI>
          <C>@advui/data</C> — Table, Data Table, Data Grid, Filter Bar, Tree View, Timeline, Stat,
          KPI Card, Virtual List, Infinite Scroll, Event Calendar and Kanban
        </LI>
        <LI>
          <C>@advui/charts</C> — Bar, Line, Area, Pie, Scatter, Composed, Radar and Radial Chart and
          Heatmap (uses <C>@advui/data</C> for its table view)
        </LI>
        <LI>
          <C>@advui/editor</C> — Rich Text Editor (WYSIWYG) and Markdown Editor, with a viewer for
          each
        </LI>
        <LI>
          <C>@advui/theme</C> — tokens, color presets and <C>createUniversalConfig()</C>
        </LI>
        <LI>
          <C>@advui/icons</C> — the icon abstraction and a tree-shakable default set
        </LI>
        <LI>
          <C>@advui/utils</C> — color math (OKLCH, WCAG contrast) and helpers
        </LI>
        <LI>
          <C>{siteConfig.cliName}</C> — CLI for copying component source
        </LI>
      </UL>
      {siteConfig.unpublishedPackages.length ? (
        <Callout title="Not on npm yet">
          <C>{siteConfig.unpublishedPackages.join(', ')}</C> will be published with the next
          release. Until then, add their components with the CLI.
        </Callout>
      ) : null}
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
  { id: 'file-picker', title: 'File picking (native)' },
  { id: 'first-component', title: 'Use a component' },
]

export async function Installation() {
  return (
    <>
      <H2 id="install">Install</H2>
      <P>
        Install the core package. pnpm and npm 7+ install its peer dependencies (Tamagui and React
        Native) automatically. On web, add React Native Web yourself: it is what <C>react-native</C>{' '}
        is aliased to, and no package asks for it.
      </P>
      <Code
        lang="bash"
        code={`pnpm add @advui/core @advui/theme @advui/icons tamagui
pnpm add react-native-web   # web only (Next.js, Vite)`}
      />
      <P>
        Add the packages for the components you need. Each component page says which package it is
        in:
      </P>
      <Code
        lang="bash"
        code={`pnpm add @advui/data     # tables, data grid, tree view, timeline, stats
pnpm add @advui/charts   # bar, line, pie, scatter, radar charts and more (installs @advui/data too)
pnpm add @advui/editor   # rich text and Markdown editors`}
      />
      <P>Or let the CLI detect your framework and do it for you:</P>
      <Code lang="bash" code={`npx ${siteConfig.cliName} init`} />
      <H2 id="config">Create a config</H2>
      <P>One config drives every component. Pick a preset or pass your brand colors:</P>
      <Code
        title="tamagui.config.ts"
        code={`import { createUniversalConfig } from '@advui/theme'

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
  // Add @advui/data, @advui/charts and @advui/editor when you use them.
  transpilePackages: ['@advui/core', '@advui/theme', '@advui/icons', '@advui/utils', 'react-native-web'],
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

import { UniversalProvider } from '@advui/core'
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
        code={`import { UniversalProvider } from '@advui/core'
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
      <H2 id="file-picker">File picking (native)</H2>
      <P>
        File Upload and File Dropzone use the browser's dialog on web. Core ships no native file
        picker, so on iOS and Android register your app's once, at start. With{' '}
        <C>expo-document-picker</C> (it works in Expo Go):
      </P>
      <Code
        title="app/_layout.tsx"
        code={`import { setFilePicker } from '@advui/core'
import * as DocumentPicker from 'expo-document-picker'

setFilePicker(async ({ multiple, accept }) => {
  // The picker filters by MIME type only. Extensions (".pdf") are checked
  // after picking, so a list with one opens the picker unfiltered: filtering
  // by the rest ("image/*,.pdf") would hide the PDFs.
  const rules = accept?.split(',').map((rule) => rule.trim()) ?? []
  const result = await DocumentPicker.getDocumentAsync({
    multiple,
    type: rules.length && rules.every((rule) => rule.includes('/')) ? rules : '*/*',
  })
  if (result.canceled) return null
  return result.assets.map((asset) => ({
    name: asset.name,
    size: asset.size,
    type: asset.mimeType,
    uri: asset.uri,
  }))
})`}
      />
      <H2 id="first-component">Use a component</H2>
      <Code
        code={`import { Button, Card, Input } from '@advui/core'

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
          Writes <C>advui.json</C> (target folder, registry) and a <C>tamagui.config.ts</C>.
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
  "dependencies": ["@advui/icons"],
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

export const tailwindToc: TocItem[] = [
  { id: 'how-it-fits', title: 'How it fits' },
  { id: 'install', title: 'Install' },
  { id: 'usage', title: 'Use it next to Adv UI' },
  { id: 'colors', title: 'Theme colors' },
  { id: 'text', title: 'Text sizes' },
  { id: 'spacing', title: 'Spacing, sizes and radius' },
  { id: 'shadows', title: 'Shadows' },
  { id: 'classname', title: 'Classes on Adv UI components' },
  { id: 'limits', title: 'Limits' },
]

export async function Tailwind() {
  return (
    <>
      <H2 id="how-it-fits">How it fits</H2>
      <P>
        Tamagui's <C>@tamagui/tailwind</C> package has a <C>View</C> and a <C>Text</C> styled with
        Tailwind class names instead of style props. Adv UI components keep their own props, so the
        two work side by side: lay out a screen with classes and put Adv UI components in it.
      </P>
      <P>
        Classes are read against your Tamagui config, so they use Adv UI's theme and tokens, but
        only where the names match. The sections below say which Tailwind names work as they are and
        which need Adv UI's name instead.
      </P>
      <H2 id="install">Install</H2>
      <Code lang="bash" code="pnpm add @tamagui/tailwind" />
      <P>
        Install the same version as your <C>tamagui</C> package. Next.js and Expo need no other
        setup: the components parse their classes as they render, and Tamagui writes the CSS on web
        as it does for Adv UI, so there is no Tailwind stylesheet or PostCSS step.
      </P>
      <H2 id="usage">Use it next to Adv UI</H2>
      <P>In Next.js, render them in a client component, as you would Adv UI's.</P>
      <Code
        title="app/plan.tsx"
        code={`'use client'

import { Badge, Button, Card } from '@advui/core'
import { Text, View } from '@tamagui/tailwind'

export function Plan() {
  return (
    <View className="gap-4 p-4 md:flex-row md:p-8 rounded-lg bg-muted border border-border">
      <Card>
        <Card.Header>
          <Card.Title>Pro</Card.Title>
        </Card.Header>
        <Card.Content>
          <Badge>Popular</Badge>
        </Card.Content>
      </Card>
      <View className="flex-1 gap-3 justify-center">
        <Text className="text-2 text-mutedForeground">Billed yearly.</Text>
        <Button>Upgrade</Button>
      </View>
    </View>
  )
}`}
      />
      <P>
        States and breakpoints are prefixes that become Adv UI's flat values: <C>hover:bg-accent</C>
        , <C>press:bg-muted</C>, <C>focus-visible:border-ring</C>, and <C>md:p-6</C> with Adv UI's{' '}
        <A href="/docs/spacing#breakpoints">breakpoints</A>.
      </P>
      <H2 id="colors">Theme colors</H2>
      <P>
        A color class takes a theme key exactly as the theme spells it. Adv UI's keys are camelCase,
        so the classes are too:
      </P>
      <UL>
        <LI>
          <C>bg-primary</C>, <C>text-primaryForeground</C>, <C>text-mutedForeground</C> and{' '}
          <C>border-borderStrong</C> match.
        </LI>
        <LI>
          <C>text-primary-foreground</C> and <C>text-muted-foreground</C>, the kebab-case names
          shadcn/ui uses, do not.
        </LI>
        <LI>
          Tamagui's own keys are kebab-case and match as written: <C>bg-background-hover</C>,{' '}
          <C>bg-color-6</C>.
        </LI>
      </UL>
      <Callout variant="warning" title="A name that doesn't match fails silently">
        A class that matches nothing stays in <C>className</C>, with no warning. On web it does
        nothing unless your own CSS defines it, and on iOS and Android it is dropped. If an element
        comes out unstyled, check the name on the <A href="/docs/colors">Colors</A> page.
      </Callout>
      <P>
        There is no Tailwind palette: <C>bg-blue-500</C> doesn't match. Theme colors follow light
        and dark mode on their own, so you rarely need <C>dark:</C>. Arbitrary values (
        <C>bg-[#2563eb]</C>) and CSS color names (<C>text-white</C>) are used as written: the same
        in both modes, and outside the contrast checks Adv UI runs on its themes.
      </P>
      <H2 id="text">Text sizes</H2>
      <P>
        Font sizes use Adv UI's <A href="/docs/typography">type scale</A>, which is numbered.
        Tailwind's names (<C>text-sm</C>, <C>text-lg</C>) don't match. Use the number instead: it
        sets the line height too, and follows your theme's <C>fontScale</C>.
      </P>
      <UL>
        <LI>
          <C>text-xs</C> → <C>text-1</C> (12px)
        </LI>
        <LI>
          <C>text-sm</C> → <C>text-2</C> (14px)
        </LI>
        <LI>
          <C>text-base</C> → <C>text-3</C> (16px)
        </LI>
        <LI>
          <C>text-lg</C> → <C>text-4</C> (18px)
        </LI>
        <LI>
          <C>text-xl</C> → <C>text-5</C> (20px)
        </LI>
        <LI>
          <C>text-2xl</C> → <C>text-6</C> (24px)
        </LI>
        <LI>
          <C>text-3xl</C> → <C>text-7</C> (30px)
        </LI>
        <LI>
          <C>text-4xl</C> → <C>text-8</C> (36px)
        </LI>
        <LI>
          <C>text-5xl</C> → <C>text-9</C> (48px)
        </LI>
        <LI>
          <C>text-6xl</C> → <C>text-10</C> (60px)
        </LI>
      </UL>
      <P>
        Arbitrary sizes work (<C>text-[15px]</C>) but ignore <C>fontScale</C>. Line height classes
        are fixed values, not tokens: <C>leading-6</C> is 24px and <C>leading-tight</C> is 1.25.{' '}
        <C>font-body</C>, <C>font-heading</C> and <C>font-mono</C> pick the theme's fonts.
      </P>
      <H2 id="spacing">Spacing, sizes and radius</H2>
      <P>
        Space and size classes use Adv UI's <A href="/docs/spacing">tokens</A>, which follow
        Tailwind's 4px steps: <C>p-4</C> is 16px, <C>p-1.5</C> is 6px and <C>w-64</C> is 256px.
        Steps Adv UI doesn't have don't match (<C>p-28</C>, <C>w-36</C>, <C>p-px</C>), and neither
        do named widths like <C>max-w-md</C>. Use an arbitrary value for those: <C>max-w-[448px]</C>
        .
      </P>
      <P>
        <C>rounded-md</C>, <C>rounded-lg</C> and the other named radii use Adv UI's radius tokens,
        so they follow your theme's <C>radius</C> setting, and <C>rounded-button</C> works too. A
        bare <C>rounded</C> is a fixed 4px. <C>z-*</C> classes are plain numbers, not Adv UI's
        z-index tokens.
      </P>
      <H2 id="shadows">Shadows</H2>
      <P>
        Shadow classes (<C>shadow</C>, <C>shadow-md</C>…) don't match. Spread Adv UI's shadow
        presets on the view instead:
      </P>
      <Code
        code={`import { shadows } from '@advui/theme'
import { View } from '@tamagui/tailwind'

<View className="rounded-lg bg-card p-4" {...shadows.md} />`}
      />
      <H2 id="classname">Classes on Adv UI components</H2>
      <P>
        Adv UI components don't read Tailwind classes: <C>{'<Button className="w-full">'}</C> only
        adds the class to the element on web, and has no effect on iOS and Android. To style one
        with classes, parse them into style props with <C>parseStaticStyle</C>:
      </P>
      <Code
        title="components/tw-button.tsx"
        code={`import { Button, type ButtonProps } from '@advui/core'
import { parseStaticStyle } from '@tamagui/tailwind'
import { getConfig } from 'tamagui'

/** Adv UI's Button, plus Tailwind classes. */
export function TwButton({ className = '', ...props }: ButtonProps) {
  const { className: rest, ...styles } = parseStaticStyle(className, getConfig())
  return <Button {...styles} {...props} className={rest} />
}

// <TwButton className="mt-4 w-full md:w-[240px]">Save</TwButton>`}
      />
      <P>
        Props written on the component win over its classes. Use classes for layout and spacing, and
        a component's variants for its colors, so its text keeps a readable contrast. The package's
        own <C>styled()</C> wraps its <C>View</C> and <C>Text</C>, not Adv UI components.
      </P>
      <H2 id="limits">Limits</H2>
      <UL>
        <LI>
          Tamagui's compiler, which turns classes into CSS at build time, runs only in Vite apps.
          Next.js and Expo parse them as components render: in the Adv UI Expo playground, the
          package added about 63 KB to the Android bundle.
        </LI>
        <LI>
          The package installs Tailwind 4's engine, which includes a native binary, and Vite, even
          in a Next.js or Expo app.
        </LI>
        <LI>
          Web-only classes such as <C>grid</C> are dropped on iOS and Android.
        </LI>
      </UL>
    </>
  )
}
