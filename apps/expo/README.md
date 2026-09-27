# @advui/expo-playground

Expo Router app showing every component and the app examples on iOS and
Android. It runs in Expo Go, with no native build required.

```bash
pnpm dev:expo      # scan the QR code with Expo Go
pnpm android       # Android device or emulator
pnpm ios           # iOS simulator (macOS)
pnpm --filter @advui/expo-playground android:emulator   # Windows-friendly emulator launcher
```

Screens: `app/index.tsx` (metadata-driven home),
`app/components/[slug].tsx`, `app/examples/[slug].tsx`, and `app/theme.tsx`
(runtime presets and color mode).

To see the Material 3 preset (Material colors, pill buttons, 28px dialogs),
start with `EXPO_PUBLIC_ADVUI_STYLE=material`, e.g.
`EXPO_PUBLIC_ADVUI_STYLE=material pnpm dev:expo` (PowerShell:
`$env:EXPO_PUBLIC_ADVUI_STYLE='material'; pnpm dev:expo`). The theme screen
can switch colors at runtime, but shapes come from the config at startup.
