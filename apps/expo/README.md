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

## Fields and the keyboard

The component and example screens scroll in `ScreenScrollView.tsx`, which
keeps the focused field (a text field, or a WebView such as Rich Text
Editor's) above the keyboard. Copy it for screens with forms. It needs no
native module beyond React Native's own, so it works in Expo Go.

- **iOS**: `automaticallyAdjustKeyboardInsets` on the ScrollView insets it by
  the keyboard and scrolls the focused input into view.
- **Android**: the app draws edge-to-edge (`edgeToEdgeEnabled`; apps for
  Android 16 cannot opt out), so the window no longer shrinks for the
  keyboard. A `KeyboardAvoidingView` with `behavior="padding"` shrinks the
  screen instead, and the ScrollView then scrolls its focused view into
  sight. Give it `keyboardVerticalOffset={useHeaderHeight()}` (from
  `expo-router/react-navigation`): it measures itself from below the header,
  while the keyboard's position is from the top of the window.

To see the Material 3 preset (Material colors, pill buttons, 28px dialogs
and, on Android, the press ripple),
start with `EXPO_PUBLIC_ADVUI_STYLE=material`, e.g.
`EXPO_PUBLIC_ADVUI_STYLE=material pnpm dev:expo` (PowerShell:
`$env:EXPO_PUBLIC_ADVUI_STYLE='material'; pnpm dev:expo`). The theme screen
can switch colors at runtime, but shapes come from the config at startup.
