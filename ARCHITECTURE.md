# Architecture

Adv UI is a pnpm + Turborepo monorepo. Everything a component needs —
source, tests, examples, docs metadata — lives in one folder. Every other
surface (docs site, Expo app, search, registry, CLI) is generated from those
folders.

```
                        packages/ui/src/components/<slug>/
                        ├── Component.tsx        (+ .native.tsx when needed)
                        ├── Component.test.tsx
                        ├── <slug>.meta.ts       (pure data)
                        ├── examples/*.tsx
                        └── index.ts
                                   │
               scripts/generate-catalog.mjs  (predev / prebuild)
                                   │
          ┌────────────────────────┼─────────────────────────┐
          ▼                        ▼                         ▼
 src/meta/index.ts         src/meta/examples.ts     scripts/build-registry.mjs
 (catalog: all metas       (example name →                   │
  + roadmap)                React component)                 ▼
          │                        │              registry/*.json
          │                        │              apps/docs/public/r/*.json
          ▼                        ▼                         │
 docs: sidebar, pages,     docs previews,                    ▼
 search, ⌘K, API tables    Expo component screens      CLI: init / add / list
```

## Packages

| Package           | Depends on                                                                      | Notes                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@advui/utils`    | —                                                                               | Color math: parse, OKLCH conversion with gamut mapping, WCAG contrast, `ensureContrast`, `accessibleSolid`. Event composition. Framework-free.                                                 |
| `@advui/theme`    | utils, tamagui                                                                  | Tokens (space, size, radius, zIndex), fonts, media queries, animations, shadows, palettes, theme generation, presets, `createUniversalConfig`.                                                 |
| `@advui/icons`    | tamagui, react-native-svg (native)                                              | Icons generated from Lucide by `scripts/generate-icons.mjs`. `SvgIcon.tsx` renders DOM SVG; `SvgIcon.native.tsx` renders react-native-svg. `IconDefaults` sets size and color through context. |
| `@advui/core`     | theme, icons, utils, tamagui, @tamagui/toast, @tamagui/floating (web listboxes) | Components, `UniversalProvider`, color mode, hooks, metadata. No native file-picker or media dependency: apps register them with `setFilePicker`, `setVideoView` and `setAudioEngine`.         |
| `@advui/examples` | core                                                                            | Full app screens shared by the docs and Expo.                                                                                                                                                  |
| `advui` (cli)     | —                                                                               | Reads the registry and copies source into a project.                                                                                                                                           |

Inside the repo, packages resolve to their TypeScript source (`main: src/index.ts`),
so apps pick up changes without a build step. `publishConfig` switches the entry
points to `dist/` for npm.

## Cross-platform strategy

- **One component file** uses Tamagui `styled()` primitives with tokens and
  variants. On web, Tamagui emits atomic CSS. On native, it resolves the same
  styles to React Native style objects.
- **Platform files** exist only where the platforms really differ. Metro picks
  up `.native.tsx`, and web bundlers use the base file:
  - `spinner/Spinner.native.tsx`: `ActivityIndicator` instead of an SVG arc
  - `icons/SvgIcon.native.tsx`: react-native-svg instead of DOM `<svg>`
  - `charts/svg.native.tsx`: the charts' SVG layer on react-native-svg; the web
    file draws DOM `<svg>`. Everything else in `src/charts/` (frame, legend,
    tooltip, table view, scales) is shared, and ships as the `charts` registry
    item.
  - `video/Video.native.tsx`: renders the player registered with
    `setVideoView`; the web file renders `<video>`
  - `provider/GlobalStyles.native.tsx`: no-op (web injects keyframes and
    reduced-motion CSS)
  - `hooks/useReducedMotion.native.ts`: `AccessibilityInfo` instead of
    `matchMedia`
  - `hooks/useBackToClose.native.ts`: closes the open overlay on Android's back
    button; the web file is a no-op
  - `hooks/useRipple.native.tsx`: Android's native ripple (the view commands
    Pressable's `android_ripple` uses); the web file is a no-op
  - `theme/animations.native.ts`: React Native Animated driver instead of CSS
    transitions
- **Accessibility props** are written once, as ARIA props (`role`,
  `aria-label`, `aria-checked`…), and mapped to native props. Native views that
  expose a role also set `accessible` so TalkBack and VoiceOver treat them as
  one element.
- **Behavior primitives** come from Tamagui: Dialog, Select (with
  `Adapt` → Sheet on touch devices), Tabs, Checkbox, Switch, RadioGroup and
  Toast. We add styling, semantics and a stable API.

## Theming pipeline

`createUniversalConfig(options)` in `packages/theme/src/config.ts`:

1. Resolves each color input (a scale name like `'violet'`, or any CSS color)
   to a 12-step light and dark scale. Custom colors are generated in OKLCH.
2. `createThemeColors` maps the scales to about 80 semantic values (`primary`,
   `primaryText`, `mutedForeground`, `successSoft`…) plus Tamagui's standard
   keys. Solid fills get an accessible foreground, and text colors are pushed
   to ≥ 4.5:1 with `ensureContrast`.
3. `createTokens` builds the radius scale from one base value (with role tokens
   `$button`, `$buttonLg` and `$dialog` that a design system can override).
   Fonts are scaled by a single factor. `@advui/theme/material` swaps steps 1–3
   for Material 3: themes from a seed color, Material's shapes and Roboto.
4. The result goes to `createTamagui` with media queries, shorthands and
   animations.

Themes can change at runtime without a rebuild: the docs customizer and the
Expo theme screen call Tamagui's `updateTheme`. Details are in
[THEMING.md](THEMING.md).

## Color mode

`ColorModeProvider` (`packages/ui/src/provider/ColorMode.tsx`) stores
`light | dark | system` and resolves `system` with `useColorScheme()`. On web,
the docs inline `color-mode-script.ts` before hydration. The script reads
`localStorage` and sets the `t_dark`/`t_light` class on `<html>`, so there is
no flash of the wrong theme.

## Docs site (`apps/docs`)

- Next.js 16 App Router with Turbopack. `react-native` is aliased to
  `react-native-web`, and workspace packages are listed in `transpilePackages`.
- Pages are Server Components that read the catalog (pure data, so it is safe
  in RSC). Interactive parts are client components: previews, the playground,
  the customizer and the command palette.
- Code samples are highlighted at build time with Shiki (fine-grained bundle,
  JavaScript regex engine) from the real example files.
- Component previews render in an iframe (`/preview/[slug]/[example]`), so the
  responsive toggles give the example a real viewport and media queries fire.
- Tamagui's CSS is injected during SSR with React 19 `<style precedence>`
  hoisting. Hydration-sensitive code avoids `useMedia` during render (Grid uses
  media props). Select renders a static trigger until `useDidFinishSSR()`.
- `/visual` renders every example in light and dark mode for Playwright visual
  baselines.

## Expo app (`apps/expo`)

- Expo Router with the metadata-driven home (`app/index.tsx`), component
  screens (`app/components/[slug].tsx`) that render the same example files as
  the docs, the app examples (`app/examples/[slug].tsx`) and a theme screen.
- It runs in **Expo Go**: no custom native modules. Icons use react-native-svg,
  and animations use React Native Animated.
- The root layout passes `useSafeAreaInsets()` to `UniversalProvider`, which
  forwards them to Tamagui so toasts and sheets avoid the notch and home
  indicator.

## Registry and CLI

`scripts/build-registry.mjs` writes one JSON file per component with file
contents and dependencies. Dependencies are derived from imports: bare imports
become npm dependencies, and relative imports into another component folder
become registry dependencies. The CLI (`packages/cli`):

- `init` detects the framework and package manager, then writes
  `advui.json` and `tamagui.config.ts`.
- `add` resolves the dependency graph, rewrites import paths and installs npm
  dependencies.

The docs publish the registry at `/r/<name>.json`.

## Testing layers

| Layer             | Tooling                                                                    | Where                                             |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| Unit              | Vitest                                                                     | `packages/{utils,theme,cli}`                      |
| Component, web    | Vitest + happy-dom + Testing Library + user-event                          | `packages/ui/src/**/*.test.tsx`, `packages/icons` |
| Component, native | jest-expo (iOS preset) + React Native Testing Library                      | `packages/ui/src/**/*.native.test.tsx`            |
| E2E               | Playwright (Chrome): desktop and Pixel 7 viewports, `@axe-core/playwright` | `apps/docs/e2e`                                   |
| Visual            | Playwright screenshots of `/visual`, light and dark                        | `apps/docs/e2e/visual.spec.ts`                    |

## Known platform quirks (and where they are handled)

- **Android `TextInput`** crashes when given animated style objects, so fields
  have no `transition` (`input/Input.tsx`).
- **Android zIndex** is a 32-bit int. Tamagui's toast portal defaults to
  `Number.MAX_SAFE_INTEGER`, which overflows and draws toasts under the screen.
  `Toaster` passes `zIndex.toast` instead, and a native test guards this.
- **Android back button** is not handled by Tamagui's Dialog, Sheet, Popover or
  Select, so it would leave the screen with an overlay open. Every overlay
  root calls `useBackToClose(open, close)` (`hooks/useBackToClose.native.ts`;
  the web file is a no-op, since react-native-web's BackHandler only warns); a
  native test per overlay guards this.
- **Tamagui `activeStyle`** is not applied on native. Tabs derive the active
  style from their own context.
- **Tamagui `create*` factories** (Checkbox, Switch, RadioGroup) force
  `unstyled={false}`. Our styles live in the `unstyled.false` variant so they
  are not overridden.
