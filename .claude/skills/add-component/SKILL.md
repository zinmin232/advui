---
name: add-component
description: Use when adding a component to AdvUI (core, data, charts or editor), or adding props, variants or parts to an existing one. Gives the order of work, every file to touch, the metadata rules `pnpm catalog` enforces, where tests go, which existing component to copy for each pattern, and pitfalls that have cost time before.
---

# Add or extend a component

Read this instead of re-reading the library. It assumes AGENTS.md (rules,
known pitfalls) is loaded; COMPONENT_GUIDELINES.md has the full design rules.
Open a reference component only for the pattern you need (table below).

## 0. Check for overlap first

Search existing metadata before designing anything:

```bash
grep -rli "<idea>" packages/*/src/components/*/*.meta.ts   # names, keywords, descriptions
```

If a component already covers most of the request (a "Callout" was an Alert
whose `keywords` listed "callout"), ask the user whether to extend it rather
than add a near-duplicate.

## 1. Order of work

1. **Scaffold** a new component: `pnpm create-component <slug> [--package data|charts|editor] [--category <id>] [--name "Display Name"]`.
   It creates `<Name>.tsx`, `<Name>.test.tsx`, `<slug>.meta.ts`,
   `examples/basic.tsx` and `index.ts`, exports it from the package's
   `src/index.ts`, removes the slug from the roadmap and regenerates the
   catalog. To extend a component, skip this and list its call sites:
   `grep -rn "<Name[ .>]" packages examples/src apps --include=*.tsx`.
2. **Implement** in `<Name>.tsx` (tokens only, one implementation; see the
   patterns table).
3. **Web tests** in `<Name>.test.tsx`.
4. **Native case**: one `it(...)` that names the component, in
   `packages/ui/src/components/components.native.test.tsx` inside
   `describe('native rendering')` (core), or `src/<package>.native.test.tsx`
   (data, charts, editor). Overlays also get a case in the "Android back
   button" describe.
5. **Metadata** in `<slug>.meta.ts` (rules below) and **examples** in
   `examples/<name>.tsx`, each listed in `examples` in the meta.
6. **Check while you work**: `pnpm verify:component <slug>` (catalog, registry,
   its web and native tests, lint and typecheck of changed packages; a few
   minutes). Use `--skip-native` for quick loops. Never run the full suites
   after each edit; CI runs them on the PR.
7. **Wire-up** for a new component:
   - add its docs path to the axe list in `apps/docs/e2e/docs.spec.ts`
     (`for (const path of [...])`); axe runs only on listed pages;
   - add its export to the list in the package's `src/index.test.ts`
     (public API test).
8. **CHANGELOG** entry under `## [Unreleased]`: `### Added`, or `### Changed`
   for anything an existing user could notice (even an undocumented prop).
9. **Visual baselines**, only if examples or styles changed: stop any dev
   server (it shares `.next` with the build), `pnpm build`, then
   `pnpm --filter @advui/docs test:visual:update`. It rewrites only changed or
   missing images. Open each new PNG with Read to review it, and commit only
   the component's. The Linux set comes from the "Update visual baselines"
   workflow after pushing (CONTRIBUTING.md step 5).
10. **Final pass** once: `pnpm verify:component <slug> --full`. Report what ran
    and what did not (iOS, a real phone, screen readers).

## 2. Metadata rules (`pnpm catalog` fails otherwise)

- Required: `name`, `slug`, `category`, `description`, `status`, `since`,
  `usage`, non-empty `platforms` and `accessibility`. The scaffold sets
  `status: 'experimental'`; move it to `beta` once it is complete and tested
  (COMPONENT_GUIDELINES.md, "Status"). Extending a component keeps its status.
- `files` and every `examples` entry must exist, and every file in
  `examples/` must be listed in the meta.
- One prop per row; a `type` never contains `…`. A closed union such as
  `"'sm' | 'md'"` needs `options: ['sm', 'md']` in the same order, and a
  literal `default` must be one of them (`default: "'md'"`).
- Mark theme-scale props with `token: 'color' | 'space' | 'radius' | 'size'`
  (the AdvUI Builder builds editors from this); numbers may take
  `min`/`max`/`step`.
- `related` slugs must exist. Parts that read context use `within: '<Root>'`.
- `playground` controls pass their values straight in as props, so use them
  for props that take plain values. Element props such as an icon or actions
  need handling in `apps/docs/src/components/playground.tsx`.
- The meta imports only `defineMeta`, never React or components.

## 3. Copy these patterns

| Need                                            | Reference                                                                          |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Parts that share variant or size (`Card.Title`) | `badge/Badge.tsx`, `alert/Alert.tsx` (`createStyledContext`)                       |
| Title, description and actions props            | `empty-state/EmptyState.tsx`, `alert/Alert.tsx`                                    |
| Close or dismiss button                         | `toast/Toaster.tsx`, `alert/Alert.tsx` (a `View render="button"` with `useRipple`) |
| Controlled and uncontrolled state               | `hooks/useControllableState.ts`, `collapsible/Collapsible.tsx`                     |
| Form control inside Field                       | `hooks/useFieldControl.ts`; field-shaped button: `date-picker/PickerTrigger.tsx`   |
| Overlay                                         | `useControllableState` + `hooks/useBackToClose.ts` (AGENTS.md pitfall)             |
| ReactNode prop that may be a string             | `utils/isTextContent.ts` (wrap strings in Text for native)                         |
| Pressable with Android ripple                   | `hooks/useRipple.tsx`, `chip/Chip.tsx`                                             |
| Boolean ARIA state across platforms             | `utils/ariaState.ts`                                                               |

Paths are under `packages/ui/src/`.

## 4. Pitfalls that have cost time

**Tamagui**

- Styled-context values become props on every part that uses that context,
  in key order, and later props win. A `color` in the same context as
  `variant` loses to the variant's color. Compute the value in the root and
  give the part its own context (see `AlertTitleContext`).
- `Context.Provider` fills every value it is not given with the default, not
  the parent's value. Pass all of them.
- Redefining a variant key in `styled(Text, …)` merges per value, so
  `size: { md }` adds `md` and keeps Text's other sizes.
- Icons take a string `color`; type a color prop as `ColorTokens`.
- Token pixels depend on the preset (the `lg` radius is 8px in the default one).
  Do not assert exact radii from memory.

**Accessibility on native**

- `accessible` on a container merges its children into one element, so
  buttons inside can no longer be reached. When a component holds buttons,
  put `accessible` and the role on the text group instead (see Alert).
- Stop a nested button's press from reaching a pressable parent with
  `event.stopPropagation()`.

**Tests**

- `rerender` from `renderWithProvider` drops the provider ("Missing theme").
  Render the cases side by side in one render instead.
- happy-dom computes px styles (`getComputedStyle(el).padding`). Compare
  colors against a reference `<Text color="$token">`, not literal RGB values.
- Jest's `-t` is a case-insensitive regex; `\bAlert\b` excludes AlertDialog.
- The native config file is `jest.native.config.js`, not `jest.config.js`.

**Environment (Windows)**

- Write files with Edit/Write. Python's `open(p, 'w')` writes CRLF; if you
  script it, pass `newline=''`.
- Do not start the docs dev server while lint, typecheck or tests run: the
  first page compile then takes minutes. Browser pane screenshots can time
  out while the app window is hidden; use `find` and `javascript_tool`, or
  read the visual baseline PNGs.
- In a git worktree, run Playwright with `PORT=3200`: port 3100 may be
  another checkout's server, and Playwright reuses it.
