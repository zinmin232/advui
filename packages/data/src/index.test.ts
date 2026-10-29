import { describe, expect, it } from 'vitest'
import * as data from './index'

describe('@advui/data public API', () => {
  it('exports the data components and their building blocks', () => {
    expect(Object.keys(data).sort()).toEqual([
      'DataGrid',
      'DataTable',
      'EventCalendar',
      'FilterBar',
      'InfiniteScroll',
      'Kanban',
      'KanbanCardFrame',
      'KpiCard',
      'Stat',
      'StatFrame',
      'StatHelpText',
      'StatLabel',
      'StatValue',
      'Table',
      'TableCellFrame',
      'TableFrame',
      'TableHeadFrame',
      'TableRowFrame',
      'Timeline',
      'TimelineDescription',
      'TimelineFrame',
      'TimelineItemFrame',
      'TimelineTime',
      'TimelineTitle',
      'TreeView',
      'VirtualList',
      'findItem',
      'flattenTree',
      'moveItem',
    ])
  })
})
