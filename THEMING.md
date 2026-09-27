# Theming

One call creates everything the components need:

```ts
// tamagui.config.ts
import { createUniversalConfig } from '@advui/theme'

export const config = createUniversalConfig({
  preset: 'violet', // starting palette
  colors: { primary: '#0ea5e9' }, // override any role with a scale name or CSS color
  radius: 'lg', // 'none' | 'sm' | 'md' | 'lg' | 'xl' | number (px)
  fontScale: 'default', // 'compact' | 'default' | 'large' | number (factor)
  fonts: { body: 'Inter, system-ui, sans-serif' },
})

export default config
```

Pass it to `<UniversalProvider config={config}>`. The docs site's **Customize**
panel builds this call interactively, and **Copy theme** gives you the code.

## Layers

```
palettes (12-step scales)  →  semantic theme values  →  components
indigo, slate, #0ea5e9…        $primary, $mutedForeground…   Button, Card…
```

Components use **only semantic values and tokens**, never palette steps or
literal colors. Changing a preset or a brand color therefore restyles
everything consistently, in both modes.

## Presets

`indigo` (default), `blue`, `violet`, `green`, `emerald`, `orange`, `rose`,
`red`, `slate`, `neutral`. `slate` and `neutral` are **monochrome**: the primary
color is the neutral scale's high-contrast step (near-black in light mode,
near-white in dark mode).

```ts
import { themePresetNames, themePresets } from '@advui/theme'
```

## Material 3

`material()` from `@advui/theme/material` gives every component Google's
Material 3 look, with no component changes:

```ts
import { createUniversalConfig } from '@advui/theme'
import { material } from '@advui/theme/material'

export const config = createUniversalConfig({
  ...material({ seed: '#6750A4' }), // any brand color
  fontScale: 'default',
})
```

- **Color:** all roles come from the seed through Google's
  [material-color-utilities](https://github.com/material-foundation/material-color-utilities)
  (the "tonal spot" scheme behind Android dynamic color). Material roles map
  onto ours: `primaryContainer` → `primarySoft`, `secondaryContainer` →
  `secondary` (the tonal button), `surfaceContainerLow` → `card`,
  `surfaceContainerHigh` → `popover`, `outline` → `input`, `outlineVariant` →
  `border`, `error` → `destructive`. Hover and press colors are Material state
  layers (8% / 10%). Success, warning and info are custom colors harmonized
  toward the seed; pass `colors: { success, warning, info }` to change them.
- **Shape:** `materialShape` sets pill buttons, 4px fields, 8px menus, 12px
  cards and 28px dialogs and sheets.
- **Type:** Roboto on web (load it yourself, e.g. from Google Fonts); the
  platform font on iOS and Android.
- **Press ripple (Android):** buttons, icon buttons, toggles, chips, the FAB,
  tabs, navigation bar items, accordion triggers, menu and select rows,
  interactive cards and snackbar and toast actions show Android's native
  ripple, starting where the finger lands. It replaces the pressed color, so
  there is one press state, as in native Material apps. Web and iOS keep their
  press colors. Turn it off with `material({ androidRipple: false })`, or on
  for any theme with `createUniversalConfig({ androidRipple: true })`. For
  your own pressables, use `useRipple()` from `@advui/core`.
- `createMaterialThemes({ seed })` returns just the light and dark themes, for
  runtime swaps with `updateTheme`.
- `material.test.ts` runs the same WCAG AA contrast checks as the presets, for
  several seeds.

It is a separate entry so apps that do not use it never ship the color
library.

## Color inputs

`colors` accepts these roles: `primary`, `secondary`, `accent`, `neutral`,
`destructive`, `success`, `warning`, `error`, `info`, plus `monochrome` and
`overrides`. Each role takes one of:

- **a scale name**: `indigo`, `blue`, `violet`, `green`, `teal`, `orange`,
  `amber`, `crimson`, `red`, and the neutrals `gray`, `slate`, `mauve`, `sage`,
  `sand` (Radix Colors, hand-tuned light and dark steps)
- **any CSS color**: `'#0ea5e9'`, `'rgb(14 165 233)'`, `'hsl(199 89% 48%)'`. A
  full light and dark scale is generated in OKLCH around it.
- **a `ColorScale`** object with your own 12 light and 12 dark steps

Contrast is enforced during generation, so any brand color works:

- Solid fills (`primary`, `destructive`…) get a foreground (`primaryForeground`)
  that reaches ≥ 4.5:1. The fill is darkened or lightened if no foreground can.
- Text roles (`primaryText`, `mutedForeground`, `*SoftForeground`) are pushed to
  ≥ 4.5:1 against the background they sit on.
- `packages/theme/src/themes.test.ts` checks every preset in light and dark
  mode.

`overrides` is the escape hatch for exact values:

```ts
createUniversalConfig({
  colors: {
    primary: 'violet',
    overrides: { dark: { background: '#0b0b10' } },
  },
})
```

## Semantic values

| Group              | Keys                                                                                                                                                        | Use                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces           | `background`, `foreground`, `muted`, `mutedForeground`, `card`, `cardForeground`, `popover`, `popoverForeground`, `overlay`                                 | Page, text, subdued areas, cards, menus, modal scrim                                                                                                       |
| Lines              | `border`, `borderStrong`, `input`, `ring`                                                                                                                   | Dividers, control borders, focus rings                                                                                                                     |
| Brand              | `primary`, `primaryHover`, `primaryPress`, `primaryForeground`, `primaryText`, `inversePrimary`, `primarySoft`, `primarySoftHover`, `primarySoftForeground` | `primary` is a **fill**; use `primaryText` for colored text and links, `inversePrimary` on inverse surfaces (`$foreground` backgrounds such as a snackbar) |
| Secondary / accent | `secondary*`, `accent*`                                                                                                                                     | Secondary buttons, hovered menu items, ghost buttons                                                                                                       |
| Intent             | `destructive*`, `success*`, `warning*`, `error*`, `info*` (each with `Foreground`, `Soft`, `SoftForeground`, `Border`)                                      | Status, validation, alerts, badges                                                                                                                         |
| Tamagui            | `background*`, `color*`, `borderColor*`, `color1`–`color12`, `placeholderColor`, `shadowColor*`                                                             | Used by Tamagui primitives; mapped from the neutral scale                                                                                                  |

Use them with a `$` prefix in any style prop:

```tsx
<View backgroundColor="$muted" borderColor="$border" />
<Text color="$primaryText">Link-colored text</Text>
```

`useTheme()` gives you the resolved values in JavaScript, for example for a
native header: `theme.background.val`.

## Tokens

| Token     | Scale                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `space`   | 4px grid: `$0.5`=2, `$1`=4, `$2`=8, `$3`=12, `$4`=16, `$6`=24, `$8`=32 … `$32`=128; negative keys (`$-2`) for margins          |
| `size`    | Same steps as space, extended to large sizes (`$96` = 384) for widths and heights                                              |
| `radius`  | `$xs` `$sm` `$md` `$lg` `$xl` `$2xl` `$3xl` `$full` from the `radius` option, plus role tokens `$button` `$buttonLg` `$dialog` |
| `zIndex`  | named layers: `dropdown` 1000, `sticky` 1100, `overlay` 1200, `modal` 1300, `popover` 1400, `toast` 1500, `tooltip` 1600       |
| fonts     | `body`, `heading`, `mono`; sizes `$1`–`$10` (12 → 60px) multiplied by `fontScale`                                              |
| `shadows` | `none`, `xs`, `sm`, `md`, `lg`: spread into styles; the colors come from the theme, and `elevation` is used on Android         |

Media queries (mobile-first): `xs` 460, `sm` 640, `md` 768, `lg` 1024, `xl` 1280,
`xxl` 1536, plus `max-*`, `touchable` and `hoverable`:

```tsx
<VStack padding="$4" $md={{ padding: '$8' }} />
<Grid columns={{ base: 1, md: 2, lg: 3 }}>{cards}</Grid>
```

## Light, dark and system

`UniversalProvider` handles color mode:

```tsx
<UniversalProvider config={config} defaultColorMode="system" />   // uncontrolled
<UniversalProvider config={config} colorMode={mode} onColorModeChange={setMode} />
```

```tsx
const { colorMode, resolvedColorMode, setColorMode } = useColorMode()
```

On the web, set the `t_light`/`t_dark` class on `<html>` before hydration to
avoid a flash. The docs do this in `apps/docs/src/lib/color-mode-script.ts`.

## Changing the theme at runtime

Colors can be swapped live, on web and native, without re-creating the config:

```ts
import { updateTheme } from '@tamagui/theme'
import { createThemeColors, themePresets } from '@advui/theme'

const themes = createThemeColors({ ...themePresets.emerald.colors, primary: '#10b981' })
updateTheme({ name: 'light', theme: themes.light })
updateTheme({ name: 'dark', theme: themes.dark })
```

The Expo app's Theme screen (`apps/expo/app/theme.tsx`) and the docs
customizer (`apps/docs/src/lib/theme-store.tsx`) both do this.

`radius` and `fontScale` are **tokens**, compiled into the config. To change
them for an app, change the config. The docs customizer previews them live by
overriding the token CSS variables, which only works on web.

## Scoped themes

Tamagui's `<Theme>` works as usual, so you can render a section in the other
mode:

```tsx
import { Theme } from 'tamagui'

;<Theme name="dark">
  <Card>Always dark</Card>
</Theme>
```

## Fonts

Web uses CSS font stacks; native uses loaded font family names:

```ts
createUniversalConfig({
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    mono: '"JetBrains Mono", monospace',
    native: { body: 'Inter', mono: 'JetBrainsMono' }, // load with expo-font first
  },
})
```

## Rules for component authors

- Never hard-code colors, spacing, radii or z-index values. ESLint rejects
  color literals in `packages/*`.
- Buttons, icon buttons and toggles use `$button` (`$buttonLg` for the large
  size); dialogs and sheets use `$dialog`. Design systems such as Material
  reshape those without touching other controls.
- Pick the role by meaning, not by looks. Don't use `$primary` as text; use
  `$primaryText`.
- Pair every surface with its foreground (`$card` + `$cardForeground`,
  `$successSoft` + `$successSoftForeground`).
- If you need a new semantic value, add it to `ThemeValues` in
  `packages/theme/src/themes.ts`, generate it for both modes and add a contrast
  test.
