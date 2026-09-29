import { describe, expect, it } from 'vitest'
import * as core from './index'

describe('@advui/core public API', () => {
  it('leaves data and chart components to their own packages', () => {
    for (const name of [
      'Table',
      'DataTable',
      'DataGrid',
      'TreeView',
      'Timeline',
      'Stat',
      'KpiCard',
      'BarChart',
      'LineChart',
      'AreaChart',
      'PieChart',
    ])
      expect(core).not.toHaveProperty(name)
  })

  it('exports the general-purpose components and what other packages build on', () => {
    for (const name of [
      'Button',
      'LoadingButton',
      'Input',
      'Form',
      'FormField',
      'DatePicker',
      'Combobox',
      'Dialog',
      'Card',
      'UniversalProvider',
      'isTextContent',
      'useControllableState',
      'useRipple',
    ])
      expect(core).toHaveProperty(name)
  })
})
