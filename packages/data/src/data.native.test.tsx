import { describe, expect, it, jest } from '@jest/globals'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { Text } from '@advui/core'
import { PlusIcon } from '@advui/icons'
import { useState } from 'react'
import { AccessibilityInfo, ScrollView, StyleSheet } from 'react-native'
import { renderNative } from '../test/native-utils'
import {
  DataGrid,
  DataTable,
  EventCalendar,
  FilterBar,
  InfiniteScroll,
  Kanban,
  KpiCard,
  Stat,
  Table,
  Timeline,
  TreeView,
  VirtualList,
} from './index'

// These run the React Native code path (react-native + Tamagui native builds,
// `.native.tsx` platform files): the same code Expo ships to iOS and Android.

describe('@advui/data native rendering', () => {
  it('Stat and KpiCard read the trend as words, since the arrow is hidden', async () => {
    await renderNative(
      <>
        <Stat>
          <Stat.Label>Refunds</Stat.Label>
          <Stat.Value>$1,092</Stat.Value>
          <Stat.Delta trend="down" tone="positive">
            3.1%
          </Stat.Delta>
        </Stat>
        <KpiCard label="Revenue" value="$48,210" delta="12.5%" trend="up" loading={false} />
      </>,
    )
    expect(screen.getByLabelText('Decreased by 3.1%')).toBeOnTheScreen()
    expect(screen.getByLabelText('Increased by 12.5%')).toBeOnTheScreen()
    expect(screen.getByText('$48,210')).toBeOnTheScreen()
  })

  it('Timeline renders its events with hidden markers', async () => {
    await renderNative(
      <Timeline>
        <Timeline.Item title="Published" time="Sep 24" icon={<PlusIcon />} tone="success" />
        <Timeline.Item title="Survey closed" description="All responses in." />
      </Timeline>,
    )
    expect(screen.getByText('Published')).toBeOnTheScreen()
    expect(screen.getByText('All responses in.')).toBeOnTheScreen()
    // The markers (and the success icon in one) are decorative.
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })

  it('Table sorts from a header button that says how the column is sorted', async () => {
    const onSort = jest.fn()
    await renderNative(
      <Table aria-label="Townships" minWidth={640}>
        <Table.Header>
          <Table.Row>
            <Table.Head sortDirection="descending" onSort={onSort}>
              Population
            </Table.Head>
            <Table.Head>Region</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell align="end">687,867</Table.Cell>
            <Table.Cell>Yangon</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Population, sorted descending' }))
    expect(onSort).toHaveBeenCalledTimes(1)
    expect(screen.getByText('687,867')).toBeOnTheScreen()
  })

  it('Table with minWidth gets a set width, so its columns line up', async () => {
    // Regression: in the sideways ScrollView each row sized its flex columns to
    // its own text, so the columns drifted apart on Android.
    await renderNative(
      <Table aria-label="Invoices" minWidth={480}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>INV-001</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    )
    const table = () => screen.getByLabelText('Invoices')
    expect(StyleSheet.flatten(table().props.style).width).toBe(480)
    // Wider than minWidth: the table fills the visible width.
    const scrollView = table().parent!.parent!
    await fireEvent(scrollView, 'layout', { nativeEvent: { layout: { width: 700, height: 200 } } })
    expect(StyleSheet.flatten(table().props.style).width).toBe(700)
  })

  it('DataTable sorts, selects and pages on native', async () => {
    const onSelectedIdsChange = jest.fn()
    await renderNative(
      <DataTable
        aria-label="Regions"
        data={[
          { id: 'a', name: 'Bago' },
          { id: 'b', name: 'Ayeyarwady' },
          { id: 'c', name: 'Chin' },
        ]}
        columns={[{ id: 'name', header: 'Name', sortable: true }]}
        pageSize={2}
        selectable
        getRowLabel={(row) => row.name}
        onSelectedIdsChange={onSelectedIdsChange}
      />,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Name' }))
    expect(screen.getByRole('button', { name: 'Name, sorted ascending' })).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Select Ayeyarwady' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['b'])
    await fireEvent.press(screen.getByRole('button', { name: 'Page 2' }))
    expect(screen.getByText('Chin')).toBeOnTheScreen()
    expect(screen.queryByText('Bago')).toBeNull()
  })

  it('FilterBar names its controls and its chips and Reset change the filters', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <FilterBar
        searchable
        filters={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [{ label: 'Active', value: 'active' }],
          },
          { key: 'reference', label: 'Reference', type: 'text' },
          { key: 'created', label: 'Created', type: 'date' },
        ]}
        defaultValue={{ status: 'active', reference: 'INV' }}
        onValueChange={onValueChange}
        showActiveFilters
        showResetButton
      />,
    )
    // The Field passes each label to its control as its name on native.
    expect(screen.getByLabelText('Search')).toBeOnTheScreen()
    const reference = screen.getByLabelText('Reference')
    expect(reference.props.value).toBe('INV')
    expect(screen.getByRole('button', { name: 'Created' })).toBeOnTheScreen()
    await fireEvent.changeText(reference, 'INV-7')
    expect(onValueChange).toHaveBeenLastCalledWith({
      status: 'active',
      reference: 'INV-7',
      created: null,
      search: null,
    })
    await fireEvent.press(screen.getByRole('button', { name: 'Remove Status: Active' }))
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: null, reference: 'INV-7' }),
    )
    expect(screen.queryByRole('button', { name: 'Remove Status: Active' })).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Clear Reference' }))
    expect(screen.getByLabelText('Reference').props.value).toBe('')
    await fireEvent.changeText(screen.getByLabelText('Search'), 'ada')
    await fireEvent.press(screen.getByRole('button', { name: 'Reset' }))
    expect(onValueChange).toHaveBeenLastCalledWith({
      status: null,
      reference: null,
      created: null,
      search: null,
    })
  })

  it('TreeView items are buttons that report expanded and selected', async () => {
    const onSelectedChange = jest.fn()
    await renderNative(
      <TreeView
        aria-label="Files"
        data={[
          { id: 'reports', label: 'Reports', children: [{ id: 'q3', label: 'Q3 summary' }] },
          { id: 'readme', label: 'Readme' },
        ]}
        onSelectedChange={onSelectedChange}
      />,
    )
    const reports = screen.getByRole('button', { name: 'Reports' })
    expect(reports).toBeCollapsed()
    expect(screen.queryByRole('button', { name: 'Q3 summary' })).toBeNull()
    await fireEvent.press(reports)
    expect(screen.getByRole('button', { name: 'Reports' })).toBeExpanded()
    expect(screen.getByRole('button', { name: 'Reports' })).toBeSelected()
    await fireEvent.press(screen.getByRole('button', { name: 'Q3 summary' }))
    expect(onSelectedChange).toHaveBeenLastCalledWith('q3')
  })

  it('DataGrid edits a cell from a tap and saves with the return key', async () => {
    const onCellChange = jest.fn()
    await renderNative(
      <DataGrid
        aria-label="Reach"
        defaultData={[{ id: 'a', township: 'Hakha', reached: 4200 }]}
        columns={[
          { id: 'township', header: 'Township' },
          { id: 'reached', header: 'Reached', type: 'number', editable: true },
        ]}
        onCellChange={onCellChange}
      />,
    )
    expect(screen.getByLabelText('Township, Hakha: Hakha')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Reached, Hakha: 4200' }))
    const field = screen.getByLabelText('Reached, Hakha')
    // Regression: the return key blurred the field on Android, and a blur drops
    // an invalid value, so its error never showed.
    expect(field.props.submitBehavior).toBe('submit')
    await fireEvent.changeText(field, 'many')
    await fireEvent(field, 'submitEditing')
    expect(screen.getByText(/^Reached, Hakha: /)).toBeOnTheScreen()
    await fireEvent.changeText(field, '4500')
    await fireEvent(field, 'submitEditing')
    expect(onCellChange).toHaveBeenCalledWith(expect.objectContaining({ value: 4500 }))
    expect(screen.getByRole('button', { name: 'Reached, Hakha: 4500' })).toBeOnTheScreen()
  })

  it('VirtualList is a named FlatList that draws only its first rows', async () => {
    const onEndReached = jest.fn()
    const error = jest.spyOn(console, 'error')
    const rows = Array.from({ length: 1000 }, (_, i) => ({ id: `r${i}`, name: `Row ${i + 1}` }))
    await renderNative(
      // In a scrolling screen, as in the playground.
      <ScrollView>
        <VirtualList
          aria-label="Invoices"
          height="80"
          data={rows}
          itemHeight={40}
          initialCount={8}
          getItemKey={(row) => row.id}
          footer={<Text>Loading more</Text>}
          renderItem={(row) => <Text>{row.name}</Text>}
        />
        <VirtualList
          aria-label="Short"
          height="80"
          data={rows.slice(0, 3)}
          itemHeight={40}
          onEndReached={onEndReached}
          renderItem={(row) => <Text>{row.name}</Text>}
        />
      </ScrollView>,
    )
    // It has a height, so React Native's warning about nested lists does not apply.
    expect(error).not.toHaveBeenCalledWith(
      expect.stringMatching(/VirtualizedLists should never be nested/),
    )
    error.mockRestore()
    const list = screen.getByLabelText('Invoices')
    expect(list.props.nestedScrollEnabled).toBe(true)
    // Only the first rows are drawn, not all thousand.
    expect(screen.getByText('Row 8')).toBeOnTheScreen()
    expect(screen.queryByText('Row 500')).toBeNull()
    expect(screen.getByText('Loading more')).toBeOnTheScreen()
    // Three rows do not fill 320px: FlatList asks for more through our callback.
    const short = screen.getByLabelText('Short')
    await fireEvent(short, 'layout', { nativeEvent: { layout: { width: 320, height: 320 } } })
    await fireEvent(short, 'contentSizeChange', 320, 120)
    expect(onEndReached).toHaveBeenCalledTimes(1)
  })

  it('InfiniteScroll loads near the end of its ScrollView and announces the new items', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')
    const onLoadMore = jest.fn()
    let resolve = () => {}
    function Feed() {
      const [count, setCount] = useState(10)
      const [loading, setLoading] = useState(false)
      resolve = () => {
        setCount(20)
        setLoading(false)
      }
      return (
        <InfiniteScroll
          aria-label="Orders"
          height="80"
          hasMore
          loading={loading}
          onLoadMore={() => {
            onLoadMore()
            setLoading(true)
          }}
        >
          {Array.from({ length: count }, (_, i) => (
            <Text key={i}>Order {i + 1}</Text>
          ))}
        </InfiniteScroll>
      )
    }
    await renderNative(<Feed />)
    const area = screen.getByLabelText('Orders')
    await fireEvent(area, 'layout', { nativeEvent: { layout: { width: 320, height: 300 } } })
    await fireEvent(area, 'contentSizeChange', 320, 1000)
    expect(onLoadMore).not.toHaveBeenCalled()
    // 1000 − 600 − 300 leaves 100 below, within half the visible height.
    await fireEvent.scroll(area, {
      nativeEvent: {
        contentOffset: { x: 0, y: 600 },
        contentSize: { width: 320, height: 1000 },
        layoutMeasurement: { width: 320, height: 300 },
      },
    })
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Loading more…')).toBeOnTheScreen()
    await act(async () => resolve())
    expect(screen.getByText('Order 20')).toBeOnTheScreen()
    expect(announce).toHaveBeenCalledWith('10 more loaded')
    announce.mockRestore()
  })

  it('EventCalendar days and events are named buttons, with today in words', async () => {
    const onEventPress = jest.fn()
    const day = new Date(2026, 9, 28)
    await renderNative(
      <EventCalendar
        locale="en-US"
        events={[
          {
            id: 'standup',
            title: 'Team standup',
            start: new Date(2026, 9, 28, 9),
            end: new Date(2026, 9, 28, 9, 30),
          },
        ]}
        defaultDate={day}
        today={day}
        onEventPress={onEventPress}
      />,
    )
    // No aria-current on iOS and Android: "today" is in the name.
    await fireEvent.press(
      screen.getByRole('button', { name: 'Wednesday, October 28, 2026, today, 1 event' }),
    )
    // The day view, with the event on its hours.
    expect(screen.getByRole('button', { name: 'Previous day' })).toBeOnTheScreen()
    const event = screen.getByRole('button', {
      name: /^Team standup, Wednesday, October 28, 2026, 9:00\sAM to 9:30\sAM$/,
    })
    await fireEvent.press(event)
    expect(onEventPress).toHaveBeenCalledWith(expect.objectContaining({ id: 'standup' }))
  })

  it('Kanban cards have screen reader actions, and a long press picks one up', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')
    const focus = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent')
    const onItemMove = jest.fn()
    await renderNative(
      <Kanban
        aria-label="Sprint"
        defaultValue={[
          {
            id: 'todo',
            title: 'To do',
            items: [
              { id: 'a', title: 'Write the report', description: 'Due Friday.' },
              { id: 'b', title: 'Clean the data' },
            ],
          },
          { id: 'doing', title: 'Doing', items: [{ id: 'c', title: 'Draw the map' }] },
          { id: 'done', title: 'Done', items: [] },
        ]}
        onItemMove={onItemMove}
      />,
    )
    const actions = (name: string) =>
      screen
        .getByRole('button', { name })
        .props.accessibilityActions.map((action: { label: string }) => action.label)
    // No descriptions on iOS and Android: the description joins the name.
    expect(actions('Write the report, Due Friday.')).toEqual(['Move down', 'Move to Doing'])
    await fireEvent(
      screen.getByRole('button', { name: 'Write the report, Due Friday.' }),
      'accessibilityAction',
      {
        nativeEvent: { actionName: 'moveRight' },
      },
    )
    expect(onItemMove).toHaveBeenCalledWith({
      itemId: 'a',
      from: { columnId: 'todo', index: 0 },
      to: { columnId: 'doing', index: 0 },
    })
    expect(announce).toHaveBeenCalledWith('Write the report: Doing, position 1 of 2.')
    // It mounted again in Doing: the screen reader's focus follows, once the old view has gone.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
    })
    expect(focus).toHaveBeenCalledWith(expect.anything(), 'focus')
    expect(actions('Write the report, Due Friday.')).toEqual([
      'Move down',
      'Move to To do',
      'Move to Done',
    ])

    // A long press picks a card up, and the board stops scrolling until it is let go.
    const board = screen.getByLabelText('Sprint')
    const card = screen.getByRole('button', { name: 'Clean the data' })
    await fireEvent(card, 'longPress', {
      nativeEvent: { pageX: 20, pageY: 20, locationX: 10, locationY: 10 },
    })
    expect(board.props.scrollEnabled).toBe(false)
    await fireEvent(screen.getByRole('button', { name: 'Clean the data' }), 'pressOut')
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(board.props.scrollEnabled).not.toBe(false)
    // Let go where it was: no move.
    expect(onItemMove).toHaveBeenCalledTimes(1)
    announce.mockRestore()
    focus.mockRestore()
  })
})
