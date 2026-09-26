# Adv UI

Cross-platform React components for **web, iOS and Android** — one codebase for
React, Next.js, React Native and Expo. Built on [Tamagui](https://tamagui.dev),
themeable from a single config, accessible by default.

**Docs, playground and component registry:** https://zinmin232.github.io/advui/

```tsx
import { Button, Card, Input } from '@advui/core'

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
}
```

The same file renders DOM elements in Next.js and native views in Expo.

## Highlights

- **25 components** — Button, IconButton, Input, Textarea, Label, Checkbox,
  Radio Group, Switch, Select, Card, Badge, Avatar, Separator, Dialog, Toast,
  Tabs, Tooltip, Alert, Progress, Spinner, Skeleton, Typography, Stack, Grid,
  Container. Each one has tests, metadata, examples, docs and a registry entry.
- **One theme config** — presets or any brand color. Light and dark palettes are
  generated and checked against WCAG AA contrast. Radius and type scale are
  global knobs.
- **Tokens only** — components never use hard-coded colors or spacing, and lint
  rules enforce it.
- **Accessible** — semantic roles on web and native, keyboard support, focus
  rings and reduced motion. Axe checks run in e2e for light and dark mode.
- **Docs site** — interactive previews, a playground, a live theme customizer,
  ⌘K search and full API tables.
- **CLI + registry** — `npx advui add dialog` copies source into your app,
  shadcn-style.
- **Expo playground** — every component and seven app screens, running in Expo
  Go.

## Repository layout

| Path                     | What it is                                                                     |
| ------------------------ | ------------------------------------------------------------------------------ |
| `packages/ui`            | `@advui/core`: components, provider, hooks, component metadata                 |
| `packages/theme`         | `@advui/theme`: tokens, palettes, theme generation, `createUniversalConfig`    |
| `packages/icons`         | `@advui/icons`: Lucide-based icons for web (SVG) and native (react-native-svg) |
| `packages/utils`         | `@advui/utils`: color math (OKLCH, contrast), event helpers                    |
| `packages/cli`           | `advui`: CLI (`init`, `add`, `list`) that reads the registry                   |
| `packages/eslint-config` | Shared ESLint flat config (bans color literals in library code)                |
| `packages/tsconfig`      | Shared strict TypeScript configs                                               |
| `apps/docs`              | Next.js 16 documentation site                                                  |
| `apps/expo`              | Expo Router app (Expo Go compatible)                                           |
| `examples`               | `@advui/examples`: login, dashboard, admin, settings, product, mobile screens  |
| `registry`               | Generated registry JSON consumed by the CLI                                    |
| `scripts`                | Catalog/registry generators, `create-component`, `rename`                      |

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the pieces fit together.

## Getting started (this repo)

Requirements: Node 22+ and pnpm 12.

```bash
npm install -g pnpm@12   # skip if `pnpm -v` already prints 12.x
pnpm install
pnpm dev            # docs at http://localhost:3000
```

| Command                 | Does                                                                          |
| ----------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`              | Docs site in dev mode (regenerates the catalog first)                         |
| `pnpm dev:expo`         | Expo dev server (scan the QR code with Expo Go)                               |
| `pnpm android`          | Expo on a connected Android device or emulator                                |
| `pnpm ios`              | Expo on the iOS simulator (macOS only)                                        |
| `pnpm build`            | Type-emit every package and build the docs for production                     |
| `pnpm test`             | Unit and component tests (Vitest + Testing Library, web)                      |
| `pnpm test:native`      | Component tests on the React Native renderer (jest-expo + RNTL)               |
| `pnpm test:e2e`         | Playwright: docs flows, mobile viewport, axe, visual regression               |
| `pnpm lint`             | ESLint across the workspace                                                   |
| `pnpm typecheck`        | `tsc --noEmit` across the workspace                                           |
| `pnpm create-component` | Scaffold a component (see [COMPONENT_GUIDELINES.md](COMPONENT_GUIDELINES.md)) |
| `pnpm registry:build`   | Regenerate `registry/*.json` from component metadata                          |
| `pnpm rename`           | Rename the project, e.g. `pnpm rename --name "Acme UI" --scope @acme`         |

### Troubleshooting

**Don't use `corepack enable` for pnpm 12.** The Corepack bundled with Node 22
cannot start pnpm 12. It fails with
`Cannot find module …\corepack\v1\pnpm\12.x\bin\pnpm.cjs`, and on Windows it
also needs administrator rights (`EPERM … C:\Program Files\nodejs\pnpx`). If
you already enabled it, run `corepack disable` in an administrator terminal,
then install pnpm with npm:

```bash
npm install -g pnpm@12
```

**A page returns 404 only in `pnpm dev`** (for example, the Tablet or Phone
preview on a component page). On a busy machine, the Next.js dev server's file
watcher can finish its first route scan before it has indexed the deepest
folders, such as `src/app/preview/[slug]/[example]`. Save that route's
`page.tsx`, or restart `pnpm dev`, and the route appears. Production builds are
not affected.

**Android emulator on Windows.** Metro can advertise an address the emulator
can't reach. Run `pnpm --filter @advui/expo-playground android:emulator`
instead. It sets up `adb reverse`, starts Metro on `127.0.0.1` and opens the
app in Expo Go.

## Using it in an app

```bash
pnpm add @advui/core @advui/theme @advui/icons tamagui
```

```ts
// tamagui.config.ts
import { createUniversalConfig } from '@advui/theme'

export const config = createUniversalConfig({ preset: 'indigo', radius: 'md' })
export default config
```

Wrap your app in `<UniversalProvider config={config}>`. Next.js also needs
`transpilePackages` and a `react-native` → `react-native-web` alias. The
Installation page of the docs site (`/docs/installation`) has the full Next.js
and Expo setup. [THEMING.md](THEMING.md) covers colors, radius, fonts and
runtime themes.

To own the source instead of installing the package:

```bash
npx advui init
npx advui add button dialog
```

## Verification status

What has been run on the development machine (Windows 11, Node 22, pnpm 12):

| Check                                                                                                          | Result                                                                                      |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`                                                    | ✅                                                                                          |
| `pnpm test` (utils, theme, icons, core, cli)                                                                   | ✅                                                                                          |
| `pnpm test:native` (React Native renderer via jest-expo)                                                       | ✅                                                                                          |
| `pnpm test:e2e`: desktop and mobile flows, axe WCAG 2 AA (light and dark), visual baselines                    | ✅                                                                                          |
| Next.js dev and production (`next start`)                                                                      | ✅                                                                                          |
| Expo on Android emulator (API 35, Expo Go): components, examples, theme switching, Select sheet, Dialog, Toast | ✅ (manual)                                                                                 |
| Expo on iOS                                                                                                    | ⚠️ not run: needs macOS/Xcode. The iOS code path is covered only by jest-expo's iOS preset. |
| Physical devices                                                                                               | ⚠️ not run                                                                                  |
| GitHub Actions on Ubuntu: `check` job (lint, typecheck, unit + native tests, build)                            | ✅                                                                                          |
| GitHub Actions on Ubuntu: `e2e` job (desktop + mobile, axe, visual regression)                                 | ✅                                                                                          |

Visual baselines are platform-specific: `*-win32.png` for local runs on
Windows and `*-linux.png` for CI. [CONTRIBUTING.md](CONTRIBUTING.md) explains
how to update them.

## Documentation for contributors and AI agents

- [AGENTS.md](AGENTS.md): rules and commands for AI coding agents
- [ARCHITECTURE.md](ARCHITECTURE.md): packages, data flow, platform strategy
- [COMPONENT_GUIDELINES.md](COMPONENT_GUIDELINES.md): the definition of done
  for a component
- [THEMING.md](THEMING.md): tokens, semantic colors, presets, runtime themes
- [CONTRIBUTING.md](CONTRIBUTING.md): workflow, commits, releases
- [CHANGELOG.md](CHANGELOG.md)

## License

[MIT](LICENSE). Icons are derived from [Lucide](https://lucide.dev) (ISC).
Color scales come from [Radix Colors](https://www.radix-ui.com/colors) (MIT).
