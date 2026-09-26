# @adv-ui/icons

Lucide icons as Tamagui-aware components for web (SVG) and native
(react-native-svg).

```tsx
import { SearchIcon, IconDefaults, createIcon } from '@adv-ui/icons'

<SearchIcon size={16} color="$mutedForeground" />

<IconDefaults size={20} color="$primaryText">
  <SearchIcon />
</IconDefaults>
```

Icons are decorative (`aria-hidden`) unless you pass `aria-label`. Colors
accept theme tokens. To add icons, edit the list in
`scripts/generate-icons.mjs` and run `pnpm --filter @adv-ui/icons generate`.

License: MIT. Icon artwork from [Lucide](https://lucide.dev) (ISC).
