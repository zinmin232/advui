# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the packages
follow [Semantic Versioning](https://semver.org). All published packages share
one version.

## [Unreleased]

### Added

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
- Registry: a `utils` item for shared helpers. `build-registry` now fails if a
  component imports a file that no registry item ships.
- e2e: axe checks for the new component pages, and open-state tests for Popover
  and Dropdown Menu.

### Fixed

- Button, Badge, Tabs: children made of several text pieces (for example
  `Status ({count})`) crashed on iOS and Android with "Text strings must be
  rendered within a \<Text\> component". They are now wrapped in `Text`.

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
