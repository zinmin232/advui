# @advui/charts

Bar, line, area and pie charts for [Adv UI](https://github.com/zinmin232/advui),
on web, iOS and Android. Charts draw SVG on web and use `react-native-svg` on
iOS and Android. Each chart has a legend, tooltips (tap on touch screens), a
screen-reader summary and a table view of its data.

```bash
pnpm add @advui/charts @advui/data @advui/core @advui/theme @advui/icons tamagui
# iOS and Android also need react-native-svg (Expo: npx expo install react-native-svg)
```

```tsx
import { BarChart } from '@advui/charts'

;<BarChart
  title="People reached"
  data={[
    { month: 'Jan', planned: 1200, reached: 980 },
    { month: 'Feb', planned: 1400, reached: 1320 },
  ]}
  index="month"
  series={[
    { key: 'planned', label: 'Planned' },
    { key: 'reached', label: 'Reached' },
  ]}
/>
```

Charts render inside the app's `UniversalProvider` from `@advui/core`, which
is a peer dependency, as are `@advui/data` (the table view uses its Table),
`react`, `react-native`, `tamagui` and (on iOS and Android) `react-native-svg`.
No charting library is added.

**Exports:** AreaChart, BarChart, LineChart, PieChart and their prop types.

Docs: https://zinmin232.github.io/advui/docs/components/bar-chart. License: MIT.
