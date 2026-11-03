# Adv UI app (Expo)

An Expo Router app with [Adv UI](https://zinmin232.github.io/advui/). Start it with
`npm start`, then open it in Expo Go or an emulator. It needs no native code of its own.

- `tamagui.config.ts`: the theme. Change the preset, colors, radius or font scale there.
- `app/_layout.tsx`: `UniversalProvider` with the safe-area insets, the tabs, and
  `setRouter(router)`, so a path in a component's `href` opens that screen.
- `screens/`: the Home, Dashboard and Settings screens, from Adv UI's examples. Change
  them or delete them.

Copy Button and File Upload need the app's clipboard and file picker on iOS and Android:
see Installation in the docs (`setClipboard`, `setFilePicker`).

Components: https://zinmin232.github.io/advui/docs/components
