# AGENTS.md

Instructions for AI coding agents working in this repository. Humans should
read [CONTRIBUTING.md](CONTRIBUTING.md) first; the rules are the same.

## What this is

A cross-platform React component library built on Tamagui 2, plus its docs
(Next.js 16) and an Expo playground. It is a pnpm 12 + Turborepo monorepo on
TypeScript 6 (strict) and React 19. Read [ARCHITECTURE.md](ARCHITECTURE.md)
before large changes.

## Commands

```bash
pnpm install
pnpm dev                     # docs → http://localhost:3000
pnpm lint                    # ESLint, all packages
pnpm typecheck               # tsc --noEmit, all packages
pnpm test                    # Vitest (web): utils, theme, icons, core, cli
pnpm test:native             # jest-expo + RNTL: core on the React Native renderer
pnpm test:e2e                # Playwright on a production build of the docs
pnpm build                   # all packages + docs production build
pnpm catalog                 # regenerate + validate component metadata
pnpm registry:build          # regenerate registry JSON
pnpm create-component <slug> # scaffold a component
```

Run a single package: `pnpm --filter @advui/core test`. Run one test
file: `pnpm --filter @advui/core exec vitest run src/components/button`.

## Where things live

- Components: `packages/ui/src/components/<slug>/`, with the component, test,
  `<slug>.meta.ts`, `examples/` and `index.ts`
- Public exports: `packages/ui/src/index.ts`
- Theme generation, tokens and presets: `packages/theme/src/`
- Docs routes: `apps/docs/src/app/`. Docs UI: `apps/docs/src/components/`.
  Guides: `apps/docs/src/content/guides/`
- Expo screens: `apps/expo/app/`
- App-level examples shared by docs and Expo: `examples/src/`

## Rules

1. **Tokens only.** No hex, rgb or hsl literals and no magic pixel values in
   `packages/*`. Use theme keys (`$primary`), tokens (`$4`, `$md`) and
   `zIndex`/`shadows` from `@advui/theme`. ESLint enforces color
   literals.
2. **Color roles have meaning.** `$primary` is a fill, `$primaryText` is text.
   Pair surfaces with their `*Foreground`. Contrast tests will fail otherwise.
3. **Accessibility is part of the feature.** Every control needs a role, an
   accessible name, state attributes and keyboard support. Native views with a
   role need `accessible`. See [COMPONENT_GUIDELINES.md](COMPONENT_GUIDELINES.md).
4. **One implementation.** Add a `.native.tsx` file only when the platform
   primitive differs, and keep the API identical.
5. **SSR-safe.** No `window` in render, and no markup that depends on `useMedia()`
   during the first render.
6. **Metadata is data.** `*.meta.ts` files must not import React or components;
   Server Components and Node scripts read them.
7. **Generated files are not edited by hand**: `src/meta/index.ts`,
   `src/meta/examples.ts`, `registry/*`, `apps/docs/public/r/*` and
   `packages/icons/src/generated.ts`.
8. **Match the surrounding code**: naming, comment density (comments explain
   why), file layout.

## Definition of done for a change

- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass.
- Component changes: `pnpm test:native` passes, and metadata and examples are
  updated (`pnpm catalog` passes).
- Visual changes: visual baselines are updated intentionally. Update both the
  local set (`pnpm --filter @advui/docs test:visual:update`) and the Linux set
  CI uses (the "Update visual baselines" workflow; see CONTRIBUTING.md).
- Report honestly what you ran and what you could not run, such as iOS without
  macOS or a physical device. Never claim a platform works without running it.

## Known pitfalls

- **Tamagui `create*` factories** (Checkbox, Switch, RadioGroup) force
  `unstyled={false}`. Put styles in the `unstyled.false` variant.
- **Passing `prop={undefined}`** to a styled component overrides its
  `defaultVariants`. Give props explicit defaults.
- **Android `TextInput`** rejects animated styles, so fields must not have a
  `transition`.
- **Platform files share an extension.** Pair `Foo.tsx` with
  `Foo.native.tsx` (or `.ts` with `.native.ts`). Metro tries every platform
  suffix for `.ts` before `.tsx`, so `Foo.ts` hides `Foo.native.tsx` on
  Android and iOS, while Jest still finds the native file.
- **Native portals drop React context.** Sheets (Select, Dropdown Menu) and
  toasts render in portals that do not carry context on native. Read
  app-wide settings from the Tamagui config (`getConfig()`) instead.
- **Android zIndex** is 32-bit; keep portal z-indices at `zIndex.*` values
  (see `Toaster.tsx`).
- **Tamagui `activeStyle`** is not applied on native; derive active styles from
  state.
- **RNTL 14**: `render`, `fireEvent` and `act` are async, so always `await` them.
- **Vitest uses happy-dom** (jsdom was too slow to start on Windows). Polyfills
  are in `packages/ui/test/setup.ts`.
- **pnpm stores scoped packages** as `.pnpm/@scope+name`. The jest
  `transformIgnorePatterns` account for this.
- **Windows + Android emulator**: use
  `pnpm --filter @advui/expo-playground android:emulator` (adb reverse +
  `127.0.0.1` Metro host).
