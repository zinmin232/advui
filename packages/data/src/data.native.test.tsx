import { describe, expect, it, jest } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import { PlusIcon } from '@advui/icons'
import { StyleSheet } from 'react-native'
import { renderNative } from '../test/native-utils'
import { DataGrid, DataTable, KpiCard, Stat, Table, Timeline, TreeView } from './index'

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
})
