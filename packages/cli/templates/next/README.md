# Adv UI app (Next.js)

A Next.js App Router app with [Adv UI](https://zinmin232.github.io/advui/). Start it with
`npm run dev` and open http://localhost:3000.

- `tamagui.config.ts`: the theme. Change the preset, colors, radius or font scale there.
- `app/providers.tsx`: `UniversalProvider`, which every component needs.
- `app/header.tsx`: the navigation. `render={<Link />}` keeps Next.js's client-side routing.
- `screens/`: the Dashboard, Settings and Sign in screens, from Adv UI's examples. Change
  them or delete them.
- `next.config.ts`: points `react-native` at React Native Web. Add `@advui/data`,
  `@advui/charts` and `@advui/editor` to `transpilePackages` when you install them.

Components: https://zinmin232.github.io/advui/docs/components
