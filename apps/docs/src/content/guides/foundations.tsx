import { Code } from '../../components/code'
import { CustomizerControls } from '../../components/customizer-panel'
import type { TocItem } from '../../components/docs-shell'
import {
  BreakpointsTable,
  ColorTokens,
  IconGallery,
  RadiusScale,
  ShadowScale,
  SizeTable,
  SpaceScale,
  TypeScale,
  ZIndexTable,
} from '../../components/foundations'
import { A, C, Callout, H2, LI, P, UL } from '../../components/prose'

export const themeToc: TocItem[] = [
  { id: 'try-it', title: 'Try it' },
  { id: 'config', title: 'Config' },
  { id: 'tokens', title: 'Theme tokens' },
  { id: 'dark-mode', title: 'Dark mode' },
  { id: 'runtime', title: 'Runtime changes' },
]

export async function ThemeGuide() {
  return (
    <>
      <H2 id="try-it">Try it</H2>
      <P>These controls restyle this whole site. “Copy theme” gives you the exact config.</P>
      <CustomizerControls compact />
      <H2 id="config">Config</H2>
      <Code
        code={`import { createUniversalConfig } from '@adv-ui/theme'

export const config = createUniversalConfig({
  preset: 'violet',
  colors: {
    primary: '#7c3aed',   // any hex/rgb/hsl or a scale name ('indigo', 'teal'…)
    secondary: 'mauve',
    accent: 'mauve',
    success: 'green',
    warning: 'amber',
    error: 'red',
    info: 'blue',
    destructive: 'red',
  },
  radius: 'lg',
  fontScale: 'default',
  fonts: { body: 'Inter, system-ui, sans-serif', native: { body: 'Inter' } },
})`}
      />
      <P>
        Custom colors become 12-step scales (in OKLCH) for light and dark mode. Foregrounds are
        chosen — and solid colors adjusted if needed — so text always meets WCAG AA.
      </P>
      <H2 id="tokens">Theme tokens</H2>
      <P>
        Components only reference semantic tokens, so a new palette never requires component
        changes:
      </P>
      <UL>
        <LI>
          <C>$background</C> <C>$foreground</C> <C>$card</C> <C>$popover</C> <C>$muted</C>{' '}
          <C>$mutedForeground</C>
        </LI>
        <LI>
          <C>$primary</C> <C>$primaryForeground</C> <C>$primaryHover</C> <C>$primarySoft</C>{' '}
          <C>$secondary</C> <C>$accent</C>
        </LI>
        <LI>
          <C>$success</C> <C>$warning</C> <C>$error</C> <C>$info</C> <C>$destructive</C> (+{' '}
          <C>Soft</C>, <C>Foreground</C>, <C>Border</C> variants)
        </LI>
        <LI>
          <C>$border</C> <C>$borderStrong</C> <C>$input</C> <C>$ring</C> <C>$overlay</C>{' '}
          <C>$shadowColor</C>
        </LI>
      </UL>
      <P>
        See every value on the <A href="/docs/colors">Colors</A> page.
      </P>
      <H2 id="dark-mode">Dark mode</H2>
      <P>
        Dark themes use hand-tuned dark scales (Radix Colors), not inverted light colors:
        backgrounds are layered (<C>background</C> → <C>card</C> → <C>popover</C>), shadows get
        stronger and solid colors keep their brand hue.
      </P>
      <H2 id="runtime">Runtime changes</H2>
      <P>
        Themes can be changed while the app runs with Tamagui’s <C>updateTheme()</C> — that is how
        the customizer on this site works, on web and native alike.
      </P>
      <Code
        code={`import { updateTheme } from '@tamagui/theme'
import { createThemeColors } from '@adv-ui/theme'

const themes = createThemeColors({ primary: '#e11d48' })
updateTheme({ name: 'light', theme: themes.light })
updateTheme({ name: 'dark', theme: themes.dark })`}
      />
    </>
  )
}

export const colorsToc: TocItem[] = [{ id: 'tokens', title: 'Semantic tokens' }]

export async function ColorsGuide() {
  return (
    <>
      <P>
        Live values of the current theme. Switch light/dark or open the customizer to see them
        change. Ratios are WCAG contrast of the text color on its surface.
      </P>
      <H2 id="tokens">Semantic tokens</H2>
      <ColorTokens />
      <Callout variant="default" title="Rule">
        Components never contain raw colors — an ESLint rule rejects hex/rgb/hsl literals in
        component source.
      </Callout>
    </>
  )
}

export const typographyToc: TocItem[] = [
  { id: 'scale', title: 'Scale' },
  { id: 'fonts', title: 'Fonts' },
]

export async function TypographyGuide() {
  return (
    <>
      <H2 id="scale">Scale</H2>
      <P>
        Ten sizes shared by the <C>body</C>, <C>heading</C> and <C>mono</C> fonts. Use{' '}
        <C>{'<Text size="lg">'}</C> or font tokens like <C>fontSize="$4"</C>.
      </P>
      <TypeScale />
      <H2 id="fonts">Fonts</H2>
      <P>
        Defaults to the platform system font (San Francisco, Roboto, Segoe UI). Provide a CSS stack
        for web and loaded family names for native:
      </P>
      <Code
        code={`createUniversalConfig({\n  fonts: { body: 'Inter, system-ui, sans-serif', native: { body: 'Inter' } },\n  fontScale: 'large', // compact 0.9375× · default 1× · large 1.125×\n})`}
      />
      <P>
        See <A href="/docs/components/typography">Text &amp; Heading</A> for the components.
      </P>
    </>
  )
}

export const spacingToc: TocItem[] = [
  { id: 'space', title: 'Space' },
  { id: 'size', title: 'Size' },
  { id: 'radius', title: 'Radius' },
  { id: 'shadows', title: 'Shadows' },
  { id: 'breakpoints', title: 'Breakpoints' },
  { id: 'z-index', title: 'Z-index' },
]

export async function SpacingGuide() {
  return (
    <>
      <H2 id="space">Space</H2>
      <P>
        A 4px scale: <C>$1</C> = 4px, <C>$4</C> = 16px. Negative tokens (<C>$-2</C>) exist for
        margins. Prefer <C>padding="$4"</C> over raw numbers.
      </P>
      <SpaceScale />
      <H2 id="size">Size</H2>
      <SizeTable />
      <H2 id="radius">Radius</H2>
      <RadiusScale />
      <H2 id="shadows">Shadows</H2>
      <P>
        Elevation presets map to <C>shadow*</C> props on iOS/web and <C>elevation</C> on Android:
      </P>
      <ShadowScale />
      <Code
        code={`import { shadows } from '@adv-ui/theme'\n\nconst Panel = styled(View, { ...shadows.md })`}
      />
      <H2 id="breakpoints">Breakpoints</H2>
      <P>
        Mobile-first media props: <C>{'<Stack $md={{ flexDirection: "row" }} />'}</C>. On web they
        compile to CSS media queries, so SSR output is stable.
      </P>
      <BreakpointsTable />
      <H2 id="z-index">Z-index</H2>
      <ZIndexTable />
    </>
  )
}

export const iconsToc: TocItem[] = [
  { id: 'usage', title: 'Usage' },
  { id: 'swap', title: 'Swap the icon set' },
  { id: 'gallery', title: 'Gallery' },
]

export async function IconsGuide() {
  return (
    <>
      <H2 id="usage">Usage</H2>
      <Code
        code={`import { Icon, SearchIcon } from '@adv-ui/icons'

<SearchIcon size={20} color="$mutedForeground" />   // tree-shakable named import
<Icon name="search" />                              // by name (resolved through IconProvider)`}
      />
      <UL>
        <LI>
          Icons inherit color and size from Button, Badge, Tabs, Alert… via <C>IconDefaults</C>.
        </LI>
        <LI>
          Decorative by default (<C>aria-hidden</C>); pass <C>aria-label</C> for meaningful icons.
        </LI>
        <LI>Web renders DOM SVG; native uses react-native-svg.</LI>
      </UL>
      <H2 id="swap">Swap the icon set</H2>
      <Code
        code={`import { Search, Settings } from 'lucide-react-native'

<UniversalProvider config={config} icons={{ search: Search, settings: Settings }}>
  …
</UniversalProvider>`}
      />
      <P>
        Or create your own with <C>createIcon(name, nodes)</C> using Lucide-style node data.
      </P>
      <H2 id="gallery">Gallery</H2>
      <IconGallery />
    </>
  )
}
