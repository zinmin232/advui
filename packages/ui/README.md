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

On web, install `react-native-web`, alias `react-native` to it and transpile the
`@advui/*` packages (see the Installation guide). Expo needs no extra
setup.

More components ship in packages built on this one, so apps install only what
they use: `@advui/data` (Table, Data Table, Data Grid, Tree View, Timeline,
Stat, KPI Card), `@advui/charts` (Bar, Line, Area and Pie Chart) and
`@advui/editor` (Rich Text Editor). They render inside the same
`UniversalProvider`.

**Exports:** Accordion, Alert, AlertDialog, Avatar, Badge, Breadcrumb, Button,
Card, Checkbox, Chip, Container, Dialog, DropdownMenu, Fab, Grid, IconButton,
Input, Label, NavigationBar, Popover, Progress, RadioGroup, Select, Separator,
Sheet, Skeleton, Slider, Snackbar, Spinner, Stack (Box, HStack, VStack, Center, Spacer), Switch, Tabs, Text,
Heading, Kbd, Textarea, Toaster, `toast`, Toggle, ToggleGroup, Tooltip,
UniversalProvider,
`useColorMode`, `useControllableState`, `useFieldControl`, `useParentForm`, `useReducedMotion`, `useRipple`,
`isTextContent`, plus re-exports of
`createUniversalConfig`, `Icon`, `IconDefaults`, `createIcon`, `Theme`, `useTheme` and `useMedia`.

Docs: component pages, playground and theme customizer in `apps/docs`. License: MIT.
