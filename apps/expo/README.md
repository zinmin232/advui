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

## Phone preview

Component pages in the docs have an **Open on phone** button with a QR code
that opens the component's screen in Expo Go, with no dev server. The address
is `exps://advui-preview.advui.workers.dev/--/components/<slug>`: Expo Go
fetches the app from the part before `/--/`, and Expo Router takes the rest
as its route.

The playground reaches visitors as a self-hosted update, because Expo Go loads
an EAS Update project only for that project's own members. `preview/build.mjs`
exports both platforms as plain JavaScript (Expo Go takes Hermes bytecode only
from EAS Update) and writes a manifest for each to `dist-preview/`.
`preview/worker.mjs` is a Cloudflare Worker that answers Expo Go with the
manifest for its platform, in the
[Expo Updates protocol](https://docs.expo.dev/technical-specs/expo-updates-1/);
Cloudflare serves the bundle and images from `dist-preview/`.

```bash
pnpm --filter @advui/expo-playground preview:build    # write dist-preview
pnpm --filter @advui/expo-playground preview:dev      # serve it on localhost:8787
pnpm --filter @advui/expo-playground preview:deploy   # publish it to Cloudflare
```

On an Android emulator, try a build with `adb reverse tcp:8787 tcp:8787`, then
open `exp://127.0.0.1:8787/--/components/button` in Expo Go.

The **Deploy phone preview** workflow runs these on every push to `main` that
touches the playground, the packages or the examples. It needs two repository
secrets: `CLOUDFLARE_API_TOKEN`, from Cloudflare's "Edit Cloudflare Workers"
token template, and `CLOUDFLARE_ACCOUNT_ID`.

Expo Go from the store runs one Expo SDK, so the QR codes stop working when it
moves to a new SDK, until the playground is upgraded.

## Fields and the keyboard

The component and example screens scroll in `ScreenScrollView.tsx`, a
`ScrollArea` with `avoidKeyboard`, which keeps the focused field (a text
field, or a WebView such as Rich Text Editor's) above the keyboard. Use the
same for screens with forms; `AppShell` does it in Main by default. It needs
no native module beyond React Native's own, so it works in Expo Go.

- **iOS**: `automaticallyAdjustKeyboardInsets` on the ScrollView insets it by
  the keyboard and scrolls the focused input into view.
- **Android**: the app draws edge-to-edge (`edgeToEdgeEnabled`; apps for
  Android 16 cannot opt out), so the window no longer shrinks for the
  keyboard. The ScrollView measures where it ends on screen and takes the
  part the keyboard covers off its bottom, so it needs no offset for the
  header above it, and Android then scrolls its focused view into sight.

To see the Material 3 preset (Material colors, pill buttons, 28px dialogs
and, on Android, the press ripple),
start with `EXPO_PUBLIC_ADVUI_STYLE=material`, e.g.
`EXPO_PUBLIC_ADVUI_STYLE=material pnpm dev:expo` (PowerShell:
`$env:EXPO_PUBLIC_ADVUI_STYLE='material'; pnpm dev:expo`). The theme screen
can switch colors at runtime, but shapes come from the config at startup.
