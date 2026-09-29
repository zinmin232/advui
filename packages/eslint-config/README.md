# @advui/eslint-config

Shared ESLint flat configs.

- `base`: TypeScript (typescript-eslint, consistent type imports) and React hooks rules for apps and scripts
- `library`: `base` plus a ban on color literals (hex, rgb, hsl), so packages
  use theme tokens
- `packageBoundaries(forbidden)`: for the component packages. Bans imports of
  the listed workspace packages and path imports into another package, so the
  layering core ← data ← charts, core ← editor stays one-way
