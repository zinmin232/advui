# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the packages
follow [Semantic Versioning](https://semver.org). All published packages share
one version.

## [Unreleased]

### Added

- **Material 3 theme** (`@advui/theme/material`): `material({ seed })` gives
  every component Google's Material 3 look with no component changes. It
  generates color roles from one seed color with Google's
  `material-color-utilities` (the tonal-spot scheme behind Android dynamic
  color), and adds Material's shapes (pill buttons, 4px fields, 12px cards,
  28px dialogs and sheets) and Roboto. The same WCAG AA contrast checks as the
  presets run for several seeds. It is a separate entry, so apps that don't
  import it don't ship the color library. The docs customizer has a
  **Style → Material 3** switch, and the Expo playground runs Material with
  `EXPO_PUBLIC_ADVUI_STYLE=material`.
- Theme: role radius tokens `$button`, `$buttonLg` and `$dialog` (buttons, icon
  buttons and toggles; dialogs and sheets). They keep today's values in every
  preset. `radius` also accepts exact values per token, and
  `createUniversalConfig` accepts prebuilt `themes`. Components copied with
  `advui add` need `@advui/theme` 0.2.0 or later for these tokens.
- **Accordion** (beta): single or multiple open sections, `default` and `card`
  variants, disabled items. Triggers sit in headings (`level`, default 3) and
  follow the WAI-ARIA accordion keyboard pattern (arrows, Home, End).
- **Slider** (beta): one value or a range, `sm`/`md`/`lg`, horizontal or
  vertical, `step`, `getValueText` and per-thumb labels. On iOS and Android
  thumbs have 44pt touch targets and respond to screen-reader
  increment/decrement gestures.
- **Popover** (beta): a non-modal dialog anchored to a trigger, named by
  `Popover.Title`, with `side`/`align`/`offset`. On phones and on native it
  opens as a bottom sheet.
- **Dropdown Menu** (beta): items with icons, shortcuts and destructive
  styling, checkbox and radio items, labels, groups and separators. On iOS and
  Android it opens as a bottom sheet of 48dp rows exposed as menu items,
  checkboxes and radios.
- **Alert Dialog** (beta): confirms important or destructive actions. An
  `alertdialog` named and described by its text, focus starts on Cancel, and
  presses outside are ignored; Escape cancels.
- **Sheet** (beta): a bottom sheet on web, iOS and Android, with fit or
  `snapPoints` heights and `Sheet.ScrollView`. On web it is a modal dialog with
  a focus trap and Escape; while closed its content is hidden from screen
  readers and the tab order.
- **Toggle** (beta): a two-state button (`aria-pressed` on web, a toggle
  button with a checked state on iOS and Android).
- **Toggle Group** (beta): `single` (a radio group) or `multiple` (toggle
  buttons), with one Tab stop and arrow-key navigation on web.
- **Breadcrumb** (beta): a `nav` landmark with an ordered list, the current
  page marked, `render` for router links, and `maxItems` to collapse deep
  paths behind a “Show N more” button.
- Icons: `align-left`, `align-center`, `align-right`, `bold`, `italic`,
  `underline`, `folder`, `layout-grid` and `list` (65 icons in total).
- Registry: a `utils` item for shared helpers. `build-registry` now fails if a
  component imports a file that no registry item ships.
- e2e: axe checks for the new component pages, and open-state tests for Popover,
  Dropdown Menu, Alert Dialog, Sheet and Toggle Group.

### Fixed

- Button, Badge, Tabs: children made of several text pieces (for example
  `Status ({count})`) crashed on iOS and Android with "Text strings must be
  rendered within a \<Text\> component". They are now wrapped in `Text`.
- Popover, Select and Dropdown Menu: their phone bottom sheets now use the same
  corner radius as Sheet (`$dialog`).
- Dropdown Menu on iOS and Android: the closed menu's rows could be reached by
  screen readers, because the sheet stays mounted while closed. They are now
  hidden until it opens.
- Docs: the four components added since 0.1.0 said “Since v0.1.0”; they
  first ship in 0.2.0.
- Toasts logged “React does not recognize the `accessibilityLabel` prop” in
  development: `@tamagui/toast` 2.7.7 passes that React Native prop to a DOM
  element. This repo now carries a `pnpm patch` (`patches/`) that passes it as
  `aria-label` instead. Apps installing `@advui/core` still see the dev-only
  warning until Tamagui fixes it upstream.
- Docs: the Login example collapsed to a thin strip in the Desktop frame. An
  e2e test now checks that no app example is clipped there.

## [0.1.0] - 2026-09-26

First release of **Adv UI**. Repository: https://github.com/zinmin232/advui.

### Added

- **Components** (`@advui/core`): Button, IconButton, Input, Textarea,
  Label, Checkbox, Radio Group, Switch, Select (beta), Card, Badge, Avatar,
  Separator, Dialog, Toast (beta), Tabs, Tooltip, Alert, Progress, Spinner,
  Skeleton, Typography (Text, Heading, Kbd), Stack (Box, Stack, HStack, VStack,
  Center, Spacer), Grid, Container.
- `UniversalProvider` with color mode (`light`/`dark`/`system`), an icon
  registry, a built-in toaster and safe-area `insets` passthrough.
  `useColorMode`, `useControllableState` and `useReducedMotion` hooks.
- **Theme** (`@advui/theme`): `createUniversalConfig` with 10 presets,
  any brand color (OKLCH scale generation), WCAG AA contrast enforcement,
  global radius and font scale, media queries, shadows and z-index layers.
- **Icons** (`@advui/icons`): 56 Lucide icons for web (SVG) and native
  (react-native-svg), with `IconDefaults` for size and color.
- **Utils** (`@advui/utils`): color parsing, OKLCH, contrast and event
  helpers.
- **CLI** (`advui`): `init`, `add` and `list`, backed by a generated
  registry. `list` works before `init` by reading the published registry.
- **Docs site**, published at https://zinmin232.github.io/advui/: component
  pages with live previews, API tables, accessibility and platform notes; a
  playground; a theme customizer; ⌘K search; app examples; and the component
  registry at `/r`. The sidebar has collapsible sections, a guide line with
  category markers, an accent bar on the current page and status badges.
- **Expo playground**: every component, seven app screens and runtime theme
  switching. Runs in Expo Go.
- **Tooling**: `create-component` generator, `rename` script, catalog
  validation, release scripts, Vitest, jest-expo, Playwright e2e with axe, and
  visual regression on Windows and Linux (CI).

### Fixed during pre-release verification

- Toasts were drawn beneath the screen on Android, because the portal zIndex
  overflowed 32 bits.
- Tabs showed no active indicator on native.
- Inputs crashed on Android when given animated border styles.
- On the web, the input icons in the examples and the example badges were
  positioned against the page instead of their own container.
