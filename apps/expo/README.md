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
