# @advui/theme

Tokens, palettes and theme generation for Adv UI.

```ts
import { createUniversalConfig } from '@advui/theme'

export const config = createUniversalConfig({
  preset: 'violet',
  colors: { primary: '#0ea5e9' },
  radius: 'lg',
  fontScale: 'default',
})
```

- 10 presets; any CSS color becomes a light and dark 12-step scale (OKLCH)
- about 80 semantic theme values with WCAG AA contrast enforced
- space, size, radius and zIndex tokens; fonts; media queries; shadows;
  animations (CSS on web, React Native Animated on native)
- `createThemeColors` for runtime theme swaps with Tamagui's `updateTheme`

See [THEMING.md](../../THEMING.md). License: MIT. Color scales are based on
Radix Colors (MIT).
