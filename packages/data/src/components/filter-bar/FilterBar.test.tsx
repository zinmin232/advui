import { NumberInput, Text } from '@advui/core'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor, within } from '../../../test/utils'
import { FilterBar, type FilterBarProps } from './FilterBar'
import {
  type CustomFilterDefinition,
  type FilterDefinition,
  type FilterState,
  formatFilterValue,
  isFilterActive,
  isFilterValueValid,
  resolveFilterState,
  sameFilterValue,
} from './filters'

const status: FilterDefinition = {
  key: 'status',
  label: 'Status',
  type: 'select',
  placeholder: 'All statuses',
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending', disabled: true },
  ],
}
const level: FilterDefinition = {
  key: 'level',
  label: 'Level',
  type: 'select',
  options: [
    { label: 'One', value: 1 },
    { label: 'Two', value: 2 },
  ],
}
const department: FilterDefinition = {
  key: 'department',
  label: 'Department',
  type: 'multi-select',
  options: [
    { label: 'Engineering', value: 'engineering' },
    { label: 'Finance', value: 'finance' },
    { label: 'Operations', value: 'operations' },
  ],
}
const verified: FilterDefinition = { key: 'verified', label: 'Verified', type: 'boolean' }
const created: FilterDefinition = { key: 'created', label: 'Created', type: 'date' }
const period: FilterDefinition = { key: 'period', label: 'Period', type: 'date-range' }
const reference: FilterDefinition = {
  key: 'reference',
  label: 'Reference',
  type: 'text',
  placeholder: 'Enter reference…',
}
const amount: CustomFilterDefinition<number> = {
  key: 'amount',
  label: 'Minimum amount',
  type: 'custom',
  format: (value) => `≥ ${value}`,
  render: ({ value, onValueChange, disabled }) => (
    <NumberInput value={value} onValueChange={onValueChange} disabled={disabled} />
  ),
}

const dates = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const formatLabels = {
  yes: 'Yes',
  no: 'No',
  from: (date: string) => `From ${date}`,
  until: (date: string) => `Until ${date}`,
  more: (count: number) => `+${count}`,
}

/** The last state reported to `onValueChange`. */
const lastState = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls.at(-1)?.[0] as FilterState

/** A parent that owns the state, as an app would. */
function Controlled({
  initial,
  onState,
  ...props
}: Omit<FilterBarProps, 'value' | 'onValueChange'> & {
  initial: FilterState
  onState?: (state: FilterState) => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <FilterBar
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onState?.(next)
      }}
    />
  )
}

async function pickOption(
  user: ReturnType<typeof renderWithProvider>['user'],
  field: string,
  option: string,
) {
  await user.click(await screen.findByRole('combobox', { name: field }))
  await user.click(await screen.findByRole('option', { name: option }))
}

afterEach(() => vi.restoreAllMocks())

describe('filter state helpers', () => {
  it('treats empty strings, empty arrays and empty ranges as unset, and false as a value', () => {
    const state = resolveFilterState(
      [reference, department, period, verified],
      { reference: '', department: [], period: { start: null, end: null }, verified: false },
      'search',
    )
    expect(state).toEqual({
      reference: null,
      department: null,
      period: null,
      verified: false,
      search: null,
    })
    expect(isFilterActive(verified, false)).toBe(true)
    expect(isFilterActive(verified, null)).toBe(false)
    expect(isFilterActive(reference, '')).toBe(false)
    expect(isFilterActive(department, [])).toBe(false)
  })

  it('reads a missing key as the default, and does not count the default as active', () => {
    const withDefault = { ...status, defaultValue: 'active' } as FilterDefinition
    expect(resolveFilterState([withDefault], {}, undefined)).toEqual({ status: 'active' })
    expect(resolveFilterState([withDefault], { status: null }, undefined)).toEqual({
      status: null,
    })
    expect(isFilterActive(withDefault, 'active')).toBe(false)
    expect(isFilterActive(withDefault, 'inactive')).toBe(true)
  })

  it('compares dates by time, multi-select values as sets and ranges by both ends', () => {
    expect(sameFilterValue(new Date(2026, 0, 1), new Date(2026, 0, 1))).toBe(true)
    expect(sameFilterValue(['a', 'b'], ['b', 'a'])).toBe(true)
    expect(sameFilterValue(['a'], ['a', 'b'])).toBe(false)
    expect(
      sameFilterValue(
        { start: new Date(2026, 0, 1), end: null },
        { start: new Date(2026, 0, 1), end: null },
      ),
    ).toBe(true)
    expect(sameFilterValue(1, '1')).toBe(false)
  })

  it('never changes the state it is given', () => {
    const state = Object.freeze({ reference: '', other: 'kept' })
    const resolved = resolveFilterState([reference], state, undefined)
    expect(resolved).not.toBe(state)
    expect(resolved).toEqual({ reference: null, other: 'kept' })
  })

  it('marks a range that ends before it starts invalid', () => {
    const reversed = { start: new Date(2026, 5, 10), end: new Date(2026, 5, 1) }
    expect(isFilterValueValid(period, reversed)).toBe(false)
    expect(isFilterValueValid(period, { start: new Date(2026, 5, 1), end: null })).toBe(true)
    expect(isFilterValueValid(period, { ...reversed, end: new Date(2026, 5, 10) })).toBe(true)
  })

  it('formats values for chips', () => {
    expect(formatFilterValue(status, 'inactive', formatLabels, dates)).toBe('Inactive')
    expect(
      formatFilterValue(
        department,
        ['engineering', 'finance', 'operations', 'legacy'],
        formatLabels,
        dates,
      ),
    ).toBe('Engineering, Finance +2')
    expect(formatFilterValue(verified, false, formatLabels, dates)).toBe('No')
    expect(
      formatFilterValue(period, { start: new Date(2026, 9, 1), end: null }, formatLabels, dates),
    ).toBe('From Oct 1, 2026')
    expect(
      formatFilterValue(period, { start: null, end: new Date(2026, 9, 1) }, formatLabels, dates),
    ).toBe('Until Oct 1, 2026')
    expect(formatFilterValue(amount as FilterDefinition, 50, formatLabels, dates)).toBe('≥ 50')
  })

  it('writes dates with plain spaces, so server and browser text match', () => {
    // Newer ICU puts thin and narrow no-break spaces in dates; older ones do not.
    const icu = {
      format: () => 'Oct 1, 2026',
      formatRange: () => 'Oct 1 – 5, 2026',
    } as unknown as Intl.DateTimeFormat
    const range = { start: new Date(2026, 9, 1), end: new Date(2026, 9, 5) }
    expect(formatFilterValue(period, range, formatLabels, icu)).toBe('Oct 1 – 5, 2026')
    expect(formatFilterValue(created, new Date(2026, 9, 1), formatLabels, icu)).toBe(
      'Oct 1, 2026',
    )
  })
})

describe('FilterBar rendering', () => {
  it('is a named group, and renders with no filters or optional content', () => {
    renderWithProvider(<FilterBar />)
    expect(screen.getByRole('group', { name: 'Filters' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  it('renders a labelled control for every filter type and the search field', async () => {
    renderWithProvider(
      <FilterBar
        searchable
        searchPlaceholder="Search users…"
        filters={[status, department, verified, created, period, reference, amount]}
      />,
    )
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveAttribute(
      'placeholder',
      'Search users…',
    )
    expect(await screen.findByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'All statuses',
    )
    expect(screen.getByRole('combobox', { name: 'Department' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Verified' })).toHaveTextContent('All')
    expect(screen.getByRole('button', { name: 'Created' })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    )
    expect(screen.getByRole('button', { name: 'Period' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Reference' })).toHaveAttribute(
      'placeholder',
      'Enter reference…',
    )
    // A custom control inside the filter's Field takes its label.
    expect(screen.getByRole('spinbutton', { name: 'Minimum amount' })).toBeInTheDocument()
  })

  it('renders leading, trailing and extra content around the filters', () => {
    renderWithProvider(
      <FilterBar
        leading="Users"
        trailing={<Text>Export</Text>}
        filters={[reference]}
        showResetButton
        showApplyButton
      >
        <Text>Extra</Text>
      </FilterBar>,
    )
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Extra')).toBeInTheDocument()
    // Nothing to apply or reset yet.
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
  })

  it('names controls with their labels when labels are hidden', async () => {
    renderWithProvider(<FilterBar showLabels={false} filters={[status, reference, created]} />)
    expect(await screen.findByRole('combobox', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Reference' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Created' })).toBeInTheDocument()
    expect(screen.queryByText('Reference', { selector: 'label' })).not.toBeInTheDocument()
  })

  it('styles the container by variant with theme tokens', () => {
    renderWithProvider(
      <>
        <FilterBar aria-label="Outline" variant="outline" />
        <FilterBar aria-label="Ghost" variant="ghost" />
      </>,
    )
    const outline = getComputedStyle(screen.getByRole('group', { name: 'Outline' }))
    const ghost = getComputedStyle(screen.getByRole('group', { name: 'Ghost' }))
    expect(outline.borderTopWidth).toBe('1px')
    expect(ghost.paddingTop).toBe('0px')
  })

  it('renders in dark mode', async () => {
    renderWithProvider(
      <FilterBar filters={[status]} showActiveFilters value={{ status: 'active' }} />,
      {
        colorMode: 'dark',
      },
    )
    expect(await screen.findByRole('combobox', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByText('Status: Active')).toBeInTheDocument()
  })
})

describe('FilterBar state', () => {
  it('reflects a controlled value and reports the whole state, keeping other keys', async () => {
    const onValueChange = vi.fn()
    const value = Object.freeze({ status: 'active', page: 3 })
    const filters = Object.freeze([status, reference]) as unknown as FilterDefinition[]
    const { user } = renderWithProvider(
      <FilterBar filters={filters} value={value} onValueChange={onValueChange} />,
    )
    expect(await screen.findByRole('combobox', { name: 'Status' })).toHaveTextContent('Active')
    await user.type(screen.getByRole('textbox', { name: 'Reference' }), 'A')
    expect(onValueChange).toHaveBeenLastCalledWith({ status: 'active', page: 3, reference: 'A' })
    // Controlled: nothing changes until the parent passes the new value.
    expect(screen.getByRole('textbox', { name: 'Reference' })).toHaveValue('')
    expect(value).toEqual({ status: 'active', page: 3 })
  })

  it('does not call any callback while rendering', () => {
    const onValueChange = vi.fn()
    const onApply = vi.fn()
    const onReset = vi.fn()
    renderWithProvider(
      <FilterBar
        filters={[status, department]}
        value={{ status: 'active', department: [] }}
        onValueChange={onValueChange}
        onApply={onApply}
        onReset={onReset}
        showApplyButton
        showResetButton
        showActiveFilters
      />,
    )
    expect(onValueChange).not.toHaveBeenCalled()
    expect(onApply).not.toHaveBeenCalled()
    expect(onReset).not.toHaveBeenCalled()
  })

  it('starts from defaultValue and keeps its own state when the parent re-renders', async () => {
    const onValueChange = vi.fn()
    function Parent() {
      const [count, setCount] = useState(0)
      return (
        <>
          <Text onPress={() => setCount(count + 1)}>Re-render {count}</Text>
          <FilterBar
            filters={[reference]}
            // A new object on every render, with the same content.
            defaultValue={{ reference: 'INV' }}
            onValueChange={onValueChange}
          />
        </>
      )
    }
    const { user } = renderWithProvider(<Parent />)
    const field = screen.getByRole('textbox', { name: 'Reference' })
    expect(field).toHaveValue('INV')
    await user.type(field, '-1')
    await user.click(screen.getByText('Re-render 0'))
    expect(screen.getByText('Re-render 1')).toBeInTheDocument()
    expect(field).toHaveValue('INV-1')
    expect(onValueChange).toHaveBeenLastCalledWith({ reference: 'INV-1' })
  })

  it('keeps the search text when a filter changes, and the filters when search clears', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled
        initial={{ status: 'inactive' }}
        onState={onState}
        searchable
        filters={[status, reference]}
      />,
    )
    await user.type(screen.getByRole('searchbox'), 'ada')
    expect(onState).toHaveBeenLastCalledWith({ status: 'inactive', reference: null, search: 'ada' })
    await user.type(screen.getByRole('textbox', { name: 'Reference' }), 'R')
    expect(lastState(onState)).toMatchObject({ search: 'ada', reference: 'R' })
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    // An emptied search is null, like every other empty value.
    expect(lastState(onState)).toEqual({ status: 'inactive', reference: 'R', search: null })
  })

  it('keeps the search under searchKey only, with one source of truth', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled initial={{ q: 'ad' }} onState={onState} searchable searchKey="q" />,
    )
    const search = screen.getByRole('searchbox')
    expect(search).toHaveValue('ad')
    await user.type(search, 'a')
    expect(onState).toHaveBeenLastCalledWith({ q: 'ada' })
  })
})

describe('FilterBar controls', () => {
  it('keeps option values as given, numbers included, and unsets with the first option', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled initial={{}} onState={onState} filters={[status, level]} />,
    )
    await pickOption(user, 'Level', 'Two')
    expect(lastState(onState)).toEqual({ status: null, level: 2 })
    await pickOption(user, 'Status', 'Inactive')
    expect(lastState(onState)).toEqual({ status: 'inactive', level: 2 })
    await pickOption(user, 'Status', 'All statuses')
    expect(lastState(onState)).toEqual({ status: null, level: 2 })
  })

  it('shows disabled options as disabled', async () => {
    const { user } = renderWithProvider(<FilterBar filters={[status]} />)
    await user.click(await screen.findByRole('combobox', { name: 'Status' }))
    expect(await screen.findByRole('option', { name: 'Pending' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('keeps an explicit false apart from unset in a boolean filter', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled initial={{}} onState={onState} filters={[verified]} showActiveCount />,
    )
    await pickOption(user, 'Verified', 'No')
    expect(lastState(onState)).toEqual({ verified: false })
    expect(screen.getByText('1 filter applied')).toBeInTheDocument()
    await pickOption(user, 'Verified', 'All')
    expect(lastState(onState)).toEqual({ verified: null })
    expect(screen.queryByText(/applied/)).not.toBeInTheDocument()
  })

  it('picks several values without repeats and removes them one by one', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled initial={{}} onState={onState} filters={[department]} />,
    )
    const field = screen.getByRole('combobox', { name: 'Department' })
    await user.click(field)
    await user.keyboard('{ArrowDown}')
    await user.click(screen.getByRole('option', { name: 'Engineering' }))
    await user.click(screen.getByRole('option', { name: 'Finance' }))
    expect(lastState(onState)).toEqual({ department: ['engineering', 'finance'] })
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Remove Engineering' }))
    expect(lastState(onState)).toEqual({ department: ['finance'] })
    await user.click(screen.getByRole('button', { name: 'Remove Finance' }))
    // An empty selection is null.
    expect(lastState(onState)).toEqual({ department: null })
  })

  it('picks and clears a date without converting it', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled
        initial={{ created: new Date(2026, 9, 14) }}
        onState={onState}
        locale="en-US"
        filters={[created]}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Created' })
    expect(trigger).toHaveAccessibleDescription('Oct 14, 2026')
    await user.click(trigger)
    await user.click(await screen.findByRole('gridcell', { name: /October 20, 2026/ }))
    // The local calendar day, as the Calendar gives it: midnight, local time.
    expect(lastState(onState)).toEqual({ created: new Date(2026, 9, 20) })
    // The calendar closes before the clear button is used.
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Clear Created' }))
    expect(lastState(onState)).toEqual({ created: null })
    expect(screen.getByRole('button', { name: 'Created' })).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Clear Created' })).not.toBeInTheDocument()
  })

  it('keeps an incomplete range, and clears it', async () => {
    const onState = vi.fn()
    const start = new Date(2026, 11, 1)
    const { user } = renderWithProvider(
      <Controlled
        initial={{ period: { start, end: null } }}
        onState={onState}
        locale="en-US"
        filters={[period]}
        showActiveFilters
      />,
    )
    expect(screen.getByText('Period: From Dec 1, 2026')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Period' }))
    await user.click(await screen.findByRole('gridcell', { name: /December 5, 2026/ }))
    expect(lastState(onState)).toEqual({ period: { start, end: new Date(2026, 11, 5) } })
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Clear Period' }))
    expect(lastState(onState)).toEqual({ period: null })
  })

  it('shows an error for a range that ends before it starts, and never swaps it', async () => {
    const onApply = vi.fn()
    const reversed = { start: new Date(2026, 5, 10), end: new Date(2026, 5, 1) }
    const { user } = renderWithProvider(
      <FilterBar
        filters={[period, reference]}
        defaultValue={{ period: reversed }}
        showApplyButton
        onApply={onApply}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Period' })
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAccessibleDescription(/The end date is before the start date\./)
    // A pending change cannot be applied while the range is invalid.
    await user.type(screen.getByRole('textbox', { name: 'Reference' }), 'R')
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    await user.keyboard('{Enter}')
    expect(onApply).not.toHaveBeenCalled()
  })

  it('clears a text filter with its button and keeps the other filters', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled
        initial={{ reference: 'INV', status: 'active' }}
        onState={onState}
        filters={[status, reference]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear Reference' }))
    expect(lastState(onState)).toEqual({ status: 'active', reference: null })
    expect(screen.getByRole('textbox', { name: 'Reference' })).toHaveFocus()
  })

  it('gives a custom control its value, a setter and its chip text', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled initial={{}} onState={onState} filters={[amount]} showActiveFilters />,
    )
    await user.type(screen.getByRole('spinbutton', { name: 'Minimum amount' }), '50')
    expect(lastState(onState)).toEqual({ amount: 50 })
    expect(screen.getByText('Minimum amount: ≥ 50')).toBeInTheDocument()
  })
})

describe('FilterBar apply and reset', () => {
  it('keeps changes as a draft until Apply, then reports them once', async () => {
    const onValueChange = vi.fn()
    const onApply = vi.fn()
    const { user } = renderWithProvider(
      <FilterBar
        searchable
        filters={[status, reference]}
        onValueChange={onValueChange}
        onApply={onApply}
        showApplyButton
        showActiveFilters
      />,
    )
    const apply = screen.getByRole('button', { name: 'Apply' })
    expect(apply).toBeDisabled()
    await pickOption(user, 'Status', 'Active')
    await user.type(screen.getByRole('searchbox'), 'ada')
    expect(onValueChange).not.toHaveBeenCalled()
    // Chips show applied filters only.
    expect(screen.queryByText('Status: Active')).not.toBeInTheDocument()
    expect(apply).toBeEnabled()
    await user.click(apply)
    const applied = { status: 'active', reference: null, search: 'ada' }
    expect(onApply).toHaveBeenCalledTimes(1)
    expect(onApply).toHaveBeenCalledWith(applied)
    expect(onValueChange).toHaveBeenCalledWith(applied)
    expect(screen.getByText('Status: Active')).toBeInTheDocument()
    // The values stay, and there is nothing left to apply.
    expect(screen.getByRole('searchbox')).toHaveValue('ada')
    expect(apply).toBeDisabled()
  })

  it('applies with Enter in the search field', async () => {
    const onApply = vi.fn()
    const { user } = renderWithProvider(<FilterBar searchable showApplyButton onApply={onApply} />)
    await user.type(screen.getByRole('searchbox'), 'ada{Enter}')
    expect(onApply).toHaveBeenCalledWith({ search: 'ada' })
  })

  it('takes a new applied value from the parent and drops the draft', async () => {
    function Parent() {
      const [value, setValue] = useState<FilterState>({ reference: 'A' })
      return (
        <>
          <Text onPress={() => setValue({ reference: 'B' })}>Load B</Text>
          <FilterBar filters={[reference]} value={value} onValueChange={setValue} showApplyButton />
        </>
      )
    }
    const { user } = renderWithProvider(<Parent />)
    const field = screen.getByRole('textbox', { name: 'Reference' })
    await user.type(field, '1')
    expect(field).toHaveValue('A1')
    await user.click(screen.getByText('Load B'))
    expect(field).toHaveValue('B')
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
  })

  it('resets filters and search to their defaults, keeping keys that are not filters', async () => {
    const onState = vi.fn()
    const onReset = vi.fn()
    const withDefault = { ...status, defaultValue: 'active' } as FilterDefinition
    const { user } = renderWithProvider(
      <Controlled
        initial={{ status: 'inactive', reference: 'INV', search: 'ada', page: 4 }}
        onState={onState}
        onReset={onReset}
        searchable
        filters={[withDefault, reference]}
        showResetButton
      />,
    )
    const reset = screen.getByRole('button', { name: 'Reset' })
    await user.click(reset)
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(lastState(onState)).toEqual({ status: 'active', reference: null, search: null, page: 4 })
    expect(await screen.findByRole('combobox', { name: 'Status' })).toHaveTextContent('Active')
    expect(screen.getByRole('searchbox')).toHaveValue('')
    // Nothing left to reset.
    expect(reset).toBeDisabled()
    expect(withDefault).toMatchObject({ defaultValue: 'active' })
  })

  it('resets a pending draft too, and applies the reset at once', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <FilterBar
        filters={[reference]}
        onValueChange={onValueChange}
        showApplyButton
        showResetButton
      />,
    )
    await user.type(screen.getByRole('textbox', { name: 'Reference' }), 'R')
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('textbox', { name: 'Reference' })).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    // The applied state was already the default.
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('FilterBar active filters', () => {
  const all = [status, department, verified, created, period, reference]

  it('counts set filters once each, not defaults, empties or the search', () => {
    renderWithProvider(
      <FilterBar
        searchable
        filters={[{ ...status, defaultValue: 'active' } as FilterDefinition, ...all.slice(1)]}
        value={{
          search: 'ada',
          status: 'active',
          department: ['engineering', 'finance', 'operations'],
          verified: false,
          created: null,
          period: { start: new Date(2026, 0, 1), end: null },
          reference: '',
        }}
        showActiveCount
      />,
    )
    // Department, Verified (false) and Period; not the default status or the search.
    expect(screen.getByText('3 filters applied')).toBeInTheDocument()
  })

  it('shows readable chips that remove one filter each and update the count', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled
        initial={{
          status: 'active',
          department: ['engineering', 'finance', 'operations'],
          verified: true,
          created: new Date(2026, 9, 1),
          search: 'ada',
        }}
        onState={onState}
        locale="en-US"
        searchable
        filters={all}
        showActiveCount
        showActiveFilters
      />,
    )
    const chips = screen.getByRole('group', { name: 'Active filters' })
    expect(within(chips).getByText('Status: Active')).toBeInTheDocument()
    expect(within(chips).getByText('Department: Engineering, Finance +1')).toBeInTheDocument()
    expect(within(chips).getByText('Verified: Yes')).toBeInTheDocument()
    expect(within(chips).getByText('Created: Oct 1, 2026')).toBeInTheDocument()
    expect(screen.getByText('4 filters applied')).toBeInTheDocument()

    await user.click(within(chips).getByRole('button', { name: 'Remove Verified: Yes' }))
    expect(lastState(onState)).toEqual({
      status: 'active',
      department: ['engineering', 'finance', 'operations'],
      verified: null,
      created: new Date(2026, 9, 1),
      period: null,
      reference: null,
      search: 'ada',
    })
    expect(screen.getByText('3 filters applied')).toBeInTheDocument()
    // Focus moves to the chip that took the removed one's place.
    expect(within(chips).getByRole('button', { name: 'Remove Created: Oct 1, 2026' })).toHaveFocus()
  })

  it('moves focus to the bar when the last chip is removed by keyboard', async () => {
    const { user } = renderWithProvider(
      <FilterBar filters={[reference]} defaultValue={{ reference: 'INV' }} showActiveFilters />,
    )
    screen.getByRole('button', { name: 'Remove Reference: INV' }).focus()
    await user.keyboard('{Enter}')
    expect(screen.queryByRole('group', { name: 'Active filters' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Filters' })).toHaveFocus()
  })

  it('resets a removed chip to its default, which is then not shown', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled
        initial={{ status: 'inactive' }}
        onState={onState}
        filters={[{ ...status, defaultValue: 'active' } as FilterDefinition]}
        showActiveFilters
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove Status: Inactive' }))
    expect(lastState(onState)).toEqual({ status: 'active' })
    expect(screen.queryByRole('group', { name: 'Active filters' })).not.toBeInTheDocument()
  })
})

describe('FilterBar collapsible', () => {
  it('hides advanced filters behind a button that counts the active ones', async () => {
    const { user } = renderWithProvider(
      <FilterBar
        collapsible
        filters={[status, { ...reference, advanced: true }, { ...verified, advanced: true }]}
        defaultValue={{ reference: 'INV', verified: false }}
      />,
    )
    const toggle = screen.getByRole('button', { name: 'More filters, 2 filters applied' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('textbox', { name: 'Reference' })).not.toBeInTheDocument()
    expect(await screen.findByRole('combobox', { name: 'Status' })).toBeVisible()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByRole('group', { name: 'More filters' })
    expect(toggle).toHaveAttribute('aria-controls', panel.parentElement?.id)
    expect(within(panel).getByRole('textbox', { name: 'Reference' })).toHaveValue('INV')

    // Closing keeps the values.
    await user.click(toggle)
    await user.click(toggle)
    expect(screen.getByRole('textbox', { name: 'Reference' })).toHaveValue('INV')
  })

  it('puts every filter in the panel when none is marked advanced', () => {
    renderWithProvider(<FilterBar collapsible searchable filters={[status, reference]} />)
    expect(screen.getByRole('searchbox')).toBeVisible()
    expect(screen.getByRole('button', { name: 'More filters' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Reference' })).not.toBeInTheDocument()
  })
})

describe('FilterBar disabled and invalid configuration', () => {
  it('disables every control and action', async () => {
    const onState = vi.fn()
    const { user } = renderWithProvider(
      <Controlled
        initial={{ reference: 'INV' }}
        onState={onState}
        disabled
        searchable
        filters={[status, reference]}
        showResetButton
        showActiveFilters
      />,
    )
    expect(screen.getByRole('searchbox')).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Reference' })).toBeDisabled()
    expect(await screen.findByRole('combobox', { name: 'Status' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Clear Reference' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Reference: INV' }))
    expect(onState).not.toHaveBeenCalled()
  })

  it('warns once about repeated keys and renders the first use only', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithProvider(
      <FilterBar
        searchable
        filters={[
          reference,
          { ...reference, label: 'Reference again' },
          { key: 'search', label: 'Search filter', type: 'text' },
        ]}
      />,
    )
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toMatch(/keys must be unique/)
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(screen.queryByRole('textbox', { name: 'Search filter' })).not.toBeInTheDocument()
  })
})

describe('FilterBar keyboard', () => {
  it('reaches every control and action with Tab, in order', async () => {
    const { user } = renderWithProvider(
      <FilterBar
        searchable
        filters={[reference]}
        defaultValue={{ reference: 'INV' }}
        showResetButton
      />,
    )
    await user.tab()
    expect(screen.getByRole('searchbox')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('textbox', { name: 'Reference' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Clear Reference' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('textbox', { name: 'Reference' })).toHaveValue('')
  })

  it('applies with Enter in a text filter', async () => {
    const onApply = vi.fn()
    const { user } = renderWithProvider(
      <FilterBar filters={[reference]} showApplyButton onApply={onApply} />,
    )
    await user.type(screen.getByRole('textbox', { name: 'Reference' }), 'R-7{Enter}')
    expect(onApply).toHaveBeenCalledWith({ reference: 'R-7' })
  })
})
