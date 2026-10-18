# AGENTS.md

Instructions for AI coding agents working in this repository. Humans should
read [CONTRIBUTING.md](CONTRIBUTING.md) first; the rules are the same.

## What this is

A cross-platform React component library built on Tamagui 2, plus its docs
(Next.js 16) and an Expo playground. Components ship in four packages:
`@advui/core` (general-purpose), `@advui/data`, `@advui/charts` and
`@advui/editor`. It is a pnpm 12 + Turborepo monorepo on
TypeScript 6 (strict) and React 19. Read [ARCHITECTURE.md](ARCHITECTURE.md)
before large changes.

## Commands

```bash
pnpm install
pnpm dev                     # docs → http://localhost:3000
pnpm lint                    # ESLint, all packages
pnpm typecheck               # tsc --noEmit, all packages
pnpm test                    # Vitest (web): utils, theme, icons, core, data, charts, editor, cli
pnpm test:native             # jest-expo + RNTL: core, data, charts, editor on the React Native renderer
pnpm test:e2e                # Playwright on a production build of the docs
pnpm build                   # all packages + docs production build
pnpm catalog                 # regenerate + validate component metadata
pnpm registry:build          # regenerate registry JSON
pnpm create-component <slug> [--package data|charts|editor] # scaffold a component (core by default)
pnpm verify:component <slug> [--full] [--skip-native]       # check one component (see Definition of done)
```

Run a single package: `pnpm --filter @advui/core test`. Run one test
file: `pnpm --filter @advui/core exec vitest run src/components/button`.

## Where things live

- Components: `packages/<dir>/src/components/<slug>/`, with the component,
  test, `<slug>.meta.ts`, `examples/` and `index.ts`. `<dir>` is `ui`
  (`@advui/core`), `data`, `charts` or `editor`
- Public exports: each package's `src/index.ts`
- Generated catalog for the docs and Expo: `packages/catalog` (private)
- Theme generation, tokens and presets: `packages/theme/src/`
- Docs routes: `apps/docs/src/app/`. Docs UI: `apps/docs/src/components/`.
  Guides: `apps/docs/src/content/guides/`
- Expo screens: `apps/expo/app/`
- App-level examples shared by docs and Expo: `examples/src/`
- Checklist for adding or extending a component (order of work, files to
  touch, metadata rules, pitfalls): `.claude/skills/add-component/SKILL.md`

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
6. **Metadata is data.** `*.meta.ts` files import only `defineMeta` (from
   `../../meta/types` in core, `@advui/core/meta` in the other packages) and
   must not import React or components;
   Server Components and Node scripts read them.
7. **Generated files are not edited by hand**: `packages/catalog/src/index.ts`,
   `packages/catalog/src/examples.ts`, `packages/*/src/meta/components.ts`,
   `registry/*`, `apps/docs/public/r/*` and `packages/icons/src/generated.ts`.
8. **Match the surrounding code**: naming, comment density (comments explain
   why), file layout.
9. **Packages are layered**: core ← data ← charts, core ← editor. A package
   imports the ones below it by name (`@advui/core`), never by a path into
   their files, and core imports none of the others. `pnpm lint` enforces it
   (`packageBoundaries` in `@advui/eslint-config`). If a new component needs a
   core internal, export it from core instead.

## Definition of done for a change

Check in tiers. CI runs everything on every PR (lint, typecheck, all web and
native tests, the build, e2e and the Linux visual baselines), and the full
suites take about half an hour on a dev machine, so do not run them after
each edit.

- **While working on a component:** `pnpm verify:component <slug>` passes. It
  regenerates and validates the catalog and registry, runs the component's
  web tests and the native tests that name it, and lints and typechecks the
  packages whose source changed. `--skip-native` skips the slowest step for
  quick loops.
- **Once, before the PR:** `pnpm verify:component <slug> --full` passes (it
  adds the dependent packages and the package's whole web and native suites).
  For changes that are not one component: `pnpm lint`, `pnpm typecheck` and
  `pnpm test`, plus `pnpm test:native` when components or `.native` files
  change.
- Component changes: metadata and examples are updated, and a native test
  names the component (the verify script warns when none does).
- Visual changes (examples or styles): visual baselines are updated
  intentionally. After `pnpm build`, update both the local set
  (`pnpm --filter @advui/docs test:visual:update`) and the Linux set CI uses
  (the "Update visual baselines" workflow; see CONTRIBUTING.md). Skip this
  when the look did not change.
- Report honestly what you ran and what you could not run, such as iOS without
  macOS or a physical device. Never claim a platform works without running it.

## Known pitfalls

- **Tamagui `create*` factories** (Checkbox, Switch, RadioGroup) force
  `unstyled={false}`. Put styles in the `unstyled.false` variant.
- **Passing `prop={undefined}`** to a styled component overrides its
  `defaultVariants`. Give props explicit defaults.
- **Android `TextInput`** rejects animated styles, so fields must not have a
  `transition`.
- **Android back button**: Tamagui overlays ignore it. A new overlay's root
  must hold its `open` state (`useControllableState`) and call
  `useBackToClose(open, close)`, then get a case in the native "Android back
  button" tests. While open, that also hides the screen behind from
  TalkBack and VoiceOver (UniversalProvider's `AppLayer`): overlays render in
  a portal beside the app. A panel that opens in place passes
  `{ modal: false }` (Navigation Menu). Tamagui's native Dialog overlay has
  no press handler; dismissable dialogs use `useOverlayPress`.
- **Platform files share an extension.** Pair `Foo.tsx` with
  `Foo.native.tsx` (or `.ts` with `.native.ts`). Metro tries every platform
  suffix for `.ts` before `.tsx`, so `Foo.ts` hides `Foo.native.tsx` on
  Android and iOS, while Jest still finds the native file.
- **Native portals drop React context.** Sheets (Select, Dropdown Menu) and
  toasts render in portals that do not carry context on native. Read
  app-wide settings from the Tamagui config (`getConfig()`) instead.
- **Android zIndex** is 32-bit; keep portal z-indices at `zIndex.*` values
  (see `Toaster.tsx`).
- **Labels on native**: React Native has no `<label for>`; Tamagui's
  `htmlFor` only moves focus. So a Label publishes its text for that id
  (`useLabelFor`) and `useFieldControl` gives it to the control as
  `aria-label`, as Field passes its own label. Field-shaped buttons must then
  expose their value with `accessibilityValue` (see `PickerTrigger`).
- **Form controls read Field through context.** A new control calls
  `useFieldControl(props)` first, so a Field around it sets its id, state and
  descriptions. A control that renders other controls inside (Time Picker's
  selects) resets `FieldContext` to null for them, or they take the field's id.
- **Hidden inputs on Android** ignore a transparent text color, and Android
  leaves a view with an opacity of 0 out of the accessibility tree, so
  TalkBack never finds it. Hide them with a trace of opacity on native
  (`0.01`, see OTP Input). On web, `outline-style: auto` ignores
  `outline-width: 0`; use `outlineStyle: 'none'`.
- **Tamagui's Select reacts to touches only on native**: its trigger and
  items are not `accessible` and have no activate action, so Select adds
  both (see `Select.tsx`). A named view's text is not read on native, so a
  field-shaped button gives its text as `accessibilityValue`.
- **Group names and `aria-labelledby` are not read on native.** iOS ignores
  `aria-labelledby` (a Label also publishes its text under its own `id`, so
  read it with `useLabelFor`), and neither platform reads a group's name. Put
  the group's label in each control's name (Time Picker) or hint (Radio
  Group).
- **Tamagui `activeStyle`** is not applied on native; derive active styles from
  state.
- **Tamagui `asChild` drops `onFocus`** (web): `<View asChild onFocus>` never
  calls it, so Tamagui triggers that learn their element on focus miss
  keyboard-only users. Keep your own ref instead (see Popover's trigger ref).
- **Tamagui drops web events on native.** Styled components, Tamagui's own
  Input included, strip `onKeyDown`, `onKeyPress`, `onChange` and `onScroll`
  on iOS and Android, so a text field never hears a key press. Tags Input
  uses React Native's TextInput there (`TagsInputText.native.tsx`). RNTL
  tests still pass, because `fireEvent` finds the handler on a composite
  element: assert that the host element has `onKeyPress`, and check on a
  device with the on-screen keyboard (`adb` key events never fire it).
- **Tamagui sets control states on web only.** Its native Switch sends no
  checked state, and its Checkbox and Radio Group items no disabled state, so
  TalkBack misses them. Set them yourself on native (`accessible`,
  `aria-checked`, `aria-disabled` through `ariaState`; see `Switch.tsx`). On
  Android `role` wins over `accessibilityRole`, so a toggle built on Button
  clears `role` to become a `togglebutton` (see `PasswordInput`).
- **Android wraps a TextInput placeholder** wider than its box onto a cut-off
  second line, whatever the props (`numberOfLines` is already 1). Tags Input
  draws its own one-line copy over a transparent real placeholder
  (`TagsInputText.native.tsx`).
- **Drags inside a Tamagui Sheet**: asked about a vertical move, the Sheet
  marks itself as dragging even when the touched view keeps the gesture, and
  then stays on screen when closed. Wrap a drag surface in a view that
  claims moves while it drags (see `useColorDrag`'s `guard`).
- **RNTL 14**: `render`, `fireEvent` and `act` are async, so always `await` them.
- **Vitest uses happy-dom** (jsdom was too slow to start on Windows). Polyfills
  are in `packages/ui/test/setup.ts`.
- **pnpm stores scoped packages** as `.pnpm/@scope+name`. The jest
  `transformIgnorePatterns` account for this.
- **Windows + Android emulator**: use
  `pnpm --filter @advui/expo-playground android:emulator` (adb reverse +
  `127.0.0.1` Metro host).
