import { describe, expect, it } from 'vitest'
import * as charts from './index'

describe('@advui/charts public API', () => {
  it('exports the chart components and none of the internals', () => {
    expect(Object.keys(charts).sort()).toEqual(['AreaChart', 'BarChart', 'LineChart', 'PieChart'])
  })
})
