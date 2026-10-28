import { describe, expect, it } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import { renderNative } from '../test/native-utils'
import {
  AreaChart,
  BarChart,
  ComposedChart,
  Heatmap,
  LineChart,
  PieChart,
  RadarChart,
  RadialChart,
  ScatterChart,
} from './index'

// These run the React Native code path (react-native + Tamagui native builds,
// `.native.tsx` platform files): the same code Expo ships to iOS and Android.

describe('@advui/charts native rendering', () => {
  it('Charts draw with react-native-svg and show a tooltip on tap', async () => {
    const data = [
      { month: 'Jan', planned: 10, reached: 8 },
      { month: 'Feb', planned: 12, reached: 11 },
    ]
    const series = [
      { key: 'planned', label: 'Planned' },
      { key: 'reached', label: 'Reached' },
    ] as const
    await renderNative(
      <>
        <BarChart title="Bars" data={data} index="month" series={series} width={300} />
        <LineChart title="Lines" data={data} index="month" series={series} width={300} />
        <AreaChart title="Areas" data={data} index="month" series={series} stacked width={300} />
        <PieChart
          title="Slices"
          data={[
            { label: 'Health', value: 3 },
            { label: 'WASH', value: 1 },
          ]}
          width={300}
        />
      </>,
    )
    // Each plot is one accessible image named by its title. The web's arrow-key
    // hint is left out: a phone has no arrow keys.
    const bars = screen.getByRole('img', { name: 'Bars.' })
    expect(screen.getByRole('img', { name: /^Slices\./ })).toBeOnTheScreen()
    expect(screen.getByText('Health · 75%')).toBeOnTheScreen()
    // Tapping the right half of the bar plot shows February.
    await fireEvent.press(bars, { nativeEvent: { locationX: 280, locationY: 100 } })
    // The reading becomes the plot's accessibility value for screen readers.
    expect(screen.getByRole('img', { name: /^Bars\./ })).toHaveAccessibilityValue({
      text: 'Feb: Planned 12, Reached 11',
    })
    // The table view is a real button and table.
    await fireEvent.press(screen.getAllByRole('button', { name: 'Show table' })[0]!)
    expect(screen.getAllByRole('button', { name: 'Hide table' })).toHaveLength(1)
  })

  it('ScatterChart, ComposedChart, RadarChart, RadialChart and Heatmap read the tapped value', async () => {
    const rows = [
      { state: 'Kachin', health: 34, wash: 21 },
      { state: 'Shan', health: 41, wash: 28 },
      { state: 'Chin', health: 14, wash: 8 },
    ]
    const series = [
      { key: 'health', label: 'Health' },
      { key: 'wash', label: 'WASH' },
    ] as const
    await renderNative(
      <>
        <ScatterChart title="Points" data={rows} x="health" y="wash" index="state" width={300} />
        <ComposedChart
          title="Combo"
          data={rows}
          index="state"
          series={[series[0], { ...series[1], type: 'line', dashed: true }]}
          width={300}
        />
        <RadarChart title="Spokes" data={rows} index="state" series={series} width={300} />
        <RadialChart
          title="Rings"
          data={[
            { label: 'Food', value: 72 },
            { label: 'Health', value: 58 },
          ]}
          max={100}
          width={300}
        />
        <Heatmap title="Cells" data={rows.slice(0, 2)} index="state" series={series} width={300} />
      </>,
    )
    for (const name of ['Points.', 'Combo.', 'Spokes.', 'Rings.', 'Cells.'])
      expect(screen.getByRole('img', { name })).toBeOnTheScreen()

    // Shan, the top-right point at about 229,43, takes a tap near it.
    await fireEvent.press(screen.getByRole('img', { name: 'Points.' }), {
      nativeEvent: { locationX: 236, locationY: 38 },
    })
    expect(screen.getByRole('img', { name: 'Points.' })).toHaveAccessibilityValue({
      text: 'Shan: health 41, wash 28',
    })
    // The outer ring, straight up from the center.
    await fireEvent.press(screen.getByRole('img', { name: 'Rings.' }), {
      nativeEvent: { locationX: 150, locationY: 20 },
    })
    expect(screen.getByRole('img', { name: 'Rings.' })).toHaveAccessibilityValue({
      text: 'Food: 72% 72',
    })
    // The bottom-right cell.
    await fireEvent.press(screen.getByRole('img', { name: 'Cells.' }), {
      nativeEvent: { locationX: 280, locationY: 60 },
    })
    expect(screen.getByRole('img', { name: 'Cells.' })).toHaveAccessibilityValue({
      text: 'Shan: WASH 28',
    })
  })
})
