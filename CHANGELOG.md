# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the packages
follow [Semantic Versioning](https://semver.org). All published packages share
one version.

## [Unreleased]

### Changed

- Renamed the project to **Adv UI**:
  - packages are published under the `@adv-ui/*` scope, and the CLI is `adv-ui`;
  - the logo mark reads "aUI";
  - repository: https://github.com/zinmin232/advui.
- Docs sidebar redesign:
  - collapsible **Getting started**, **Customization** and **Components**
    sections, with only the section holding the current page open by default;
  - a guide line with category markers;
  - an accent bar on the current page;
  - pill badges for beta, experimental and deprecated components;
  - the current page scrolls into view, on desktop and in the mobile drawer.

### Fixed

- On the web, the input icons (Login, Admin, Mobile home), the Mobile home
  notification badge and the product "-20%" badge were positioned against the
  page instead of their own container.

## [0.1.0] - 2026-09-26

First release.

### Added

- **Components** (`@adv-ui/core`): Button, IconButton, Input, Textarea,
  Label, Checkbox, Radio Group, Switch, Select (beta), Card, Badge, Avatar,
  Separator, Dialog, Toast (beta), Tabs, Tooltip, Alert, Progress, Spinner,
  Skeleton, Typography (Text, Heading, Kbd), Stack (Box, Stack, HStack, VStack,
  Center, Spacer), Grid, Container.
- `UniversalProvider` with color mode (`light`/`dark`/`system`), an icon
  registry, a built-in toaster and safe-area `insets` passthrough.
  `useColorMode`, `useControllableState` and `useReducedMotion` hooks.
- **Theme** (`@adv-ui/theme`): `createUniversalConfig` with 10 presets,
  any brand color (OKLCH scale generation), WCAG AA contrast enforcement,
  global radius and font scale, media queries, shadows and z-index layers.
- **Icons** (`@adv-ui/icons`): 56 Lucide icons for web (SVG) and native
  (react-native-svg), with `IconDefaults` for size and color.
- **Utils** (`@adv-ui/utils`): color parsing, OKLCH, contrast and event
  helpers.
- **CLI** (`adv-ui`): `init`, `add` and `list`, backed by a generated
  registry.
- **Docs site**: component pages with live previews, API tables,
  accessibility and platform notes; a playground; a theme customizer; ⌘K
  search; app examples.
- **Expo playground**: every component, seven app screens and runtime theme
  switching. Runs in Expo Go.
- **Tooling**: `create-component` generator, `rename` script, catalog
  validation, Vitest, jest-expo, Playwright e2e with axe, and visual
  regression.

### Fixed during pre-release verification

- Toasts were drawn beneath the screen on Android, because the portal zIndex
  overflowed 32 bits.
- Tabs showed no active indicator on native.
- Inputs crashed on Android when given animated border styles.
