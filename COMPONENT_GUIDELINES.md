# Component guidelines

These rules apply to every component in `packages/ui`. A component is **done**
only when every item in the checklist at the end is true.

## Start with the generator

```bash
pnpm create-component <slug> [--category forms] [--name "Display Name"]
```

The generator creates `packages/ui/src/components/<slug>/`:

```
<slug>/
├── <Name>.tsx          component (+ <Name>.native.tsx only if platforms truly differ)
├── <Name>.test.tsx     web tests (Vitest + Testing Library)
├── <slug>.meta.ts      documentation metadata — pure data, no React imports
├── examples/basic.tsx  default export, imports from '@advui/core'
└── index.ts            public exports
```

It also exports the component from `src/index.ts`, removes the slug from
`src/meta/roadmap.ts` and regenerates the catalog. The docs page, sidebar
entry, search entry, Expo screen and registry item then appear automatically.

## API design

- **Composition over configuration.** Multi-part components use
  `withStaticProperties` (`Card.Header`, `Dialog.Content`). Simple components
  take `children` plus a few focused props.
- **Names follow the platform and the ecosystem.** Use `variant`, `size`,
  `disabled`, `loading`, `icon`. Controlled/uncontrolled pairs are
  `value`/`defaultValue`/`onValueChange` or
  `checked`/`defaultChecked`/`onCheckedChange`. Use `useControllableState`
  for these.
- **Pass through the underlying props.** Extend the Tamagui frame's props
  (`GetProps<typeof Frame>`) so style props, `testID`, `aria-*` and event
  handlers work. Forward refs.
- **Export the building blocks.** Export the styled frame (`BadgeFrame`) and
  text (`BadgeText`) so users can compose their own variants.
- **Variants, not conditionals.** Put visual states in `styled()` variants. Use
  `createStyledContext` to pass `variant`/`size` to sub-parts instead of
  cloning children.
- **Defaults are explicit.** Give variant props real defaults in the function
  signature. Passing `variant={undefined}` must not wipe out Tamagui's
  `defaultVariants`.

## Styling rules

- **Tokens only.** Colors come from theme keys (`$primary`,
  `$mutedForeground`), spacing and sizes from `$` tokens, radius from `$sm`…`$full`
  (buttons and toggles `$button`, dialogs and sheets `$dialog`),
  z-index from `zIndex` in `@advui/theme`. The lint config rejects hex,
  rgb and hsl literals in library code.
- **Pick the right color role.** `$primary` is a fill. Use `$primaryText` for
  primary-colored text on the page background. Soft intent colors
  (`$successSoft`) pair with `$successSoftForeground`. Never use an intent color
  as text unless its `*Foreground` or `*Text` key says it is safe.
- **Focus is visible.** Interactive frames set
  `focusVisibleStyle: { outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 2 }`.
- **Motion is optional.** Use named animations (`quick`, `medium`…). On web,
  the provider's stylesheet removes transitions under
  `prefers-reduced-motion`. Components with enter/exit motion (Dialog, Select,
  Tooltip, Toast, Popover, Dropdown Menu, Accordion, Alert Dialog, Sheet) also read `useReducedMotion()` and drop their `transition`,
  which covers native. Never animate `TextInput` styles: Android rejects
  animated style objects there.
- **Press feedback.** Pressables call `useRipple()`: spread `ripple.props`
  last, render `ripple.element` first, and while `ripple.active` keep the
  resting fill as the `pressStyle` and drop a transparent border (Android
  clips children inside the border).
- **Tamagui factories.** Components built with `createCheckbox`, `createSwitch`
  or `createRadioGroup` must put their styles in the `unstyled.false` variant.
- **No layout assumptions.** Components don't set outer margins. They size to
  their content or accept width props.

## Accessibility

- Use the semantic element or role: `render="button"` or `role="button"`,
  `role="switch"` with `aria-checked`, `role="dialog"` with a title.
- Every interactive element has an accessible name: visible text, a `Label`
  with `htmlFor`/`id`, or `aria-label` (required on `IconButton`).
- State is exposed: `aria-checked`, `aria-selected`, `aria-expanded`,
  `aria-disabled`, `aria-busy`, `aria-invalid` plus `aria-describedby` for
  errors.
- Keyboard support matches the WAI-ARIA Authoring Practices pattern: Enter
  and Space activate, arrow keys move within groups, Escape closes overlays,
  and focus is trapped in dialogs and returns to the trigger. List the keys in
  the metadata `keyboard` field.
- On native, views with a role set `accessible` so screen readers announce one
  element. Touch targets are ≥ 44pt; use `hitSlop` when the visual is smaller.
- Decorative icons are `aria-hidden`. `IconDefaults` does this by default.
- Text meets WCAG AA: 4.5:1 for body text, 3:1 for large text and UI
  boundaries. Theme tests verify this for every preset in light and dark mode.

## Cross-platform

- Write one implementation. Add `<Name>.native.tsx` only when the platform
  primitive differs (for example, `ActivityIndicator` vs SVG), and keep the
  exported API identical.
- Avoid web-only props in shared code (`className`, DOM events) and native-only
  props without a web equivalent. When you need one, guard it with `isWeb` from
  `tamagui`.
- Stay SSR-safe: no `window` access during render, and no `useMedia()`
  branching that changes markup between server and client. Prefer media props
  (`$sm={{ … }}`).
- Document real platform differences in `platformNotes`.

## Tests

Web tests (`<Name>.test.tsx`) use `renderWithProvider` from `test/utils`,
which returns a configured `user` (user-event). They cover:

- rendering with each variant and size,
- roles, names and ARIA state,
- keyboard interaction and pointer interaction,
- controlled and uncontrolled state,
- disabled and loading behavior.

The e2e suite runs axe on every docs page in light and dark mode. Native smoke
tests live in `src/components/components.native.test.tsx`. Add a case when a
component has native-specific code or behavior.

## Metadata (`<slug>.meta.ts`)

Metadata drives the docs page, search, playground, Expo screen and registry.
It must be plain data (no JSX, no imports other than `defineMeta`):

- `name`, `slug`, `category`, `description`, `status`, `since`, `platforms`
- `exports` (every public export) and `files` (sources for the registry)
- `usage`: the smallest correct snippet
- `parts`: props per part, with type, default and description
- `examples`: one entry per file in `examples/`, in display order
- `playground`: controls that map to real props
- `accessibility`, `keyboard`, `responsive`, `platformNotes`, `related`

`pnpm catalog` validates metadata. It fails on missing examples, unknown
related slugs and files that don't exist.

## Status

| Status         | Meaning                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| `stable`       | API is settled; changes follow semver                                    |
| `beta`         | Complete and tested; API may still change in a minor release             |
| `experimental` | Usable, but incomplete or likely to change                               |
| `deprecated`   | Kept for compatibility; the docs point to the replacement                |
| `planned`      | On the roadmap (`src/meta/roadmap.ts`); shown in the docs as coming soon |

## Definition of done

- [ ] Generated with `pnpm create-component` (or matches its structure)
- [ ] Variants and sizes use tokens only, and lint passes
- [ ] Works in light and dark mode with every preset
- [ ] Renders and behaves on web, iOS and Android (`platforms` lists only
      verified platforms)
- [ ] Accessible name, role, state and keyboard support; axe passes on the docs
      page
- [ ] Web tests cover variants, interaction and state; native case added if
      platform code exists
- [ ] Metadata complete, examples render in docs and Expo, and `pnpm catalog`
      passes
- [ ] Exported from `src/index.ts`; registry rebuilt (`pnpm registry:build`)
- [ ] Visual baselines updated if the look changed
- [ ] CHANGELOG entry under _Unreleased_
