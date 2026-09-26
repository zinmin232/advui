# @advui/core

Cross-platform React components for web, iOS and Android, built on Tamagui.

```bash
pnpm add @advui/core @advui/theme @advui/icons tamagui
```

```tsx
import { UniversalProvider, Button, toast } from '@advui/core'
import { createUniversalConfig } from '@advui/theme'

const config = createUniversalConfig({ preset: 'indigo' })

export function App() {
  return (
    <UniversalProvider config={config}>
      <Button onPress={() => toast.success('Saved')}>Save</Button>
    </UniversalProvider>
  )
}
```

On web, alias `react-native` to `react-native-web` and transpile the
`@advui/*` packages (see the Installation guide). Expo needs no extra
setup.

**Exports:** Alert, Avatar, Badge, Button, Card, Checkbox, Container, Dialog,
Grid, IconButton, Input, Label, Progress, RadioGroup, Select, Separator,
Skeleton, Spinner, Stack (Box, HStack, VStack, Center, Spacer), Switch, Tabs,
Text, Heading, Kbd, Textarea, Toaster, `toast`, Tooltip, UniversalProvider,
`useColorMode`, `useControllableState`, `useReducedMotion`, plus re-exports of
`createUniversalConfig`, `Icon`, `IconDefaults`, `createIcon`, `Theme`, `useTheme` and `useMedia`.

Docs: component pages, playground and theme customizer in `apps/docs`. License: MIT.
