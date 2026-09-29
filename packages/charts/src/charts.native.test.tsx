import { describe, expect, it } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import { renderNative } from '../test/native-utils'
import { AreaChart, BarChart, LineChart, PieChart } from './index'

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
    ]
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
    // Each plot is one accessible image named by its title.
    const bars = screen.getByRole('img', { name: /^Bars\./ })
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
})
