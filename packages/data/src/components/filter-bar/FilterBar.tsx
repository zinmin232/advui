import {
  Badge,
  Button,
  Chip,
  Collapsible,
  type ComboboxOption,
  type DateRange,
  DatePicker,
  DateRangePicker,
  Field,
  IconButton,
  Input,
  MultiSelect,
  Search,
  Select,
  Stack,
  type Responsive,
  type StackAlign,
  type StackDirection,
  type StackWrap,
  Text,
  Wrap,
  isTextContent,
  useControllableState,
} from '@advui/core'
import { FilterIcon, XIcon } from '@advui/icons'
import { type ReactNode, forwardRef, useEffect, useRef, useState } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  type ViewProps,
  isWeb,
  styled,
  useComposedRefs,
} from 'tamagui/unstyled'
import {
  type FilterDefinition,
  type FilterFormatLabels,
  type FilterState,
  type FilterValue,
  defaultOf,
  formatFilterValue,
  isDateRange,
  isFilterActive,
  isFilterValueValid,
  normalizeFilterValue,
  resolveFilterState,
  sameFilterState,
  sameFilterValue,
} from './filters'

// Bundlers replace `process.env.NODE_ENV`; this types it for apps without Node's types.
declare const process: { env: { NODE_ENV?: string } }

export type FilterBarLayout = 'horizontal' | 'vertical' | 'responsive'
export type FilterBarVariant = 'default' | 'outline' | 'filled' | 'ghost'
export type FilterBarSize = 'sm' | 'md' | 'lg'

export interface FilterBarLabels extends FilterFormatLabels {
  /** Name of the search field. */
  search: string
  /** Placeholder and unset option of select, multi-select and boolean filters without their own. */
  any: string
  apply: string
  reset: string
  /** The button that shows the advanced filters, and their group's name. */
  moreFilters: string
  /** Name of the group of chips. */
  activeFilters: string
  /** The count badge, also read with "More filters". */
  activeCount: (count: number) => string
  /** Name of a chip's remove button, from the chip's text. */
  removeFilter: (chip: string) => string
  /** Name of the clear button in a text or date filter. */
  clearFilter: (label: string) => string
  /** Error under a date range that ends before it starts. */
  invalidRange: string
}

const defaultLabels: FilterBarLabels = {
  search: 'Search',
  any: 'All',
  yes: 'Yes',
  no: 'No',
  apply: 'Apply',
  reset: 'Reset',
  moreFilters: 'More filters',
  activeFilters: 'Active filters',
  activeCount: (count) => (count === 1 ? '1 filter applied' : `${count} filters applied`),
  removeFilter: (chip) => `Remove ${chip}`,
  clearFilter: (label) => `Clear ${label}`,
  from: (date) => `From ${date}`,
  until: (date) => `Until ${date}`,
  more: (count) => `+${count}`,
  invalidRange: 'The end date is before the start date.',
}

const FilterBarFrame = styled(Stack, {
  name: 'FilterBar',
  borderRadius: "lg",
  variants: {
    variant: {
      default: {
        backgroundColor: "background"
      },
      outline: {
        backgroundColor: "background",
        borderWidth: 1,
        borderColor: "border"
      },
      filled: {
        backgroundColor: "muted"
      },
      // No fill, border or padding: for a bar inside a card or above a table.
      ghost: {},
    },
  } as const
})

// `field` and `wide` are the widths of controls in a row (multi-select and
// date-range filters, and the search field, take `wide`); `control` is their
// height, which leading content is centered on.
const sizes = {
  sm: { gap: '2', padding: '2', field: '40', wide: '56', control: '8', clear: '8' },
  md: { gap: '3', padding: '3', field: '48', wide: '64', control: '10', clear: '9' },
  lg: { gap: '4', padding: '4', field: '56', wide: '72', control: '12', clear: '10' },
} as const

type Sizes = (typeof sizes)[FilterBarSize]

/** A control's box: its width in a row, the full width in a column. */
function controlBox(layout: FilterBarLayout, width: Sizes['field'] | Sizes['wide']): ViewProps {
  if (layout === 'vertical') return { width: '100%' }
  if (layout === 'responsive') return { width: { default: '100%', md: width } } as ViewProps
  return { width, maxWidth: '100%' }
}

/** The search field takes the free space of the row. */
function searchBox(layout: FilterBarLayout, spacing: Sizes): ViewProps {
  if (layout === 'vertical') return { width: '100%' }
  if (layout === 'responsive') return { width: { default: '100%', md: spacing.wide }, flexGrow: { md: 1 } } as ViewProps
  return { width: spacing.wide, flexGrow: 1, maxWidth: '100%' }
}

const present = (node: ReactNode) => node !== undefined && node !== null && node !== false

const none: FilterDefinition[] = []
const emptyState: FilterState = {}
const emptyRange: DateRange = { start: null, end: null }

let warnedKeys = false

/** The filters to render: the first of each key, and none that takes the search key. */
function usableFilters(filters: readonly FilterDefinition[], searchKey: string | undefined) {
  const seen = new Set<string>(searchKey === undefined ? [] : [searchKey])
  const usable: FilterDefinition[] = []
  let repeated: string | undefined
  for (const filter of filters) {
    if (seen.has(filter.key)) repeated ??= filter.key
    else {
      seen.add(filter.key)
      usable.push(filter)
    }
  }
  if (repeated !== undefined && process.env.NODE_ENV !== 'production' && !warnedKeys) {
    warnedKeys = true
    console.warn(
      `FilterBar: filter keys must be unique and differ from \`searchKey\`; only the first use of "${repeated}" is rendered.`,
    )
  }
  return usable
}

type Focusable = { focus?: () => void } | null

/** A text or date field with a clear button over its end while it has a value. */
function Clearable({
  label,
  onClear,
  children,
}: {
  label: string | null
  onClear: () => void
  children: ReactNode
}) {
  return (
    <View position="relative" justifyContent="center">
      {children}
      {label !== null ? (
        <View position="absolute" right="1" top={0} bottom={0} justifyContent="center">
          <IconButton size="sm" icon={<XIcon />} aria-label={label} onPress={onClear} />
        </View>
      ) : null}
    </View>
  )
}

interface FilterControlProps {
  filter: FilterDefinition
  value: FilterValue
  onChange: (value: FilterValue) => void
  onReset: () => void
  /** Enter in a text filter: applies, when there is an Apply button. */
  onSubmit: (() => void) | undefined
  size: FilterBarSize
  disabled: boolean
  showLabels: boolean
  labels: FilterBarLabels
  locale: string | undefined
  box: ViewProps
}

/** One filter: its control in a Field, which names it and shows a range error. */
function FilterControl({
  filter,
  value,
  onChange,
  onReset,
  onSubmit,
  size,
  disabled: barDisabled,
  showLabels,
  labels,
  locale,
  box,
}: FilterControlProps) {
  const controlRef = useRef<TamaguiElement>(null)
  const disabled = barDisabled || (filter.disabled ?? false)
  // Hidden labels name the control instead; a Field without a label adds none.
  const name = showLabels ? undefined : filter.label
  const clearLabel = (set: boolean) => (set && !disabled ? labels.clearFilter(filter.label) : null)
  const clear = () => {
    onChange(null)
    ;(controlRef.current as Focusable)?.focus?.()
  }
  const clearSpace = { paddingRight: sizes[size].clear }

  let control: ReactNode = null
  switch (filter.type) {
    case 'select': {
      const unset = filter.placeholder ?? labels.any
      const index = filter.options.findIndex((option) => sameFilterValue(option.value, value))
      // Select items take strings, so each option is keyed by its index and
      // its own value (a number, a boolean) goes into the state.
      control = (
        <Select
          size={size}
          aria-label={name}
          placeholder={unset}
          value={index < 0 ? '' : String(index)}
          onValueChange={(key) =>
            onChange(key === '' ? null : (filter.options[Number(key)]?.value ?? null))
          }
        >
          <Select.Item value="">{unset}</Select.Item>
          {filter.options.map((option, i) => (
            <Select.Item
              key={`${typeof option.value}:${String(option.value)}`}
              value={String(i)}
              disabled={option.disabled}
            >
              {option.label}
            </Select.Item>
          ))}
        </Select>
      )
      break
    }
    case 'boolean': {
      const unset = filter.placeholder ?? labels.any
      control = (
        <Select
          size={size}
          aria-label={name}
          placeholder={unset}
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onValueChange={(key) => onChange(key === 'true' ? true : key === 'false' ? false : null)}
        >
          <Select.Item value="">{unset}</Select.Item>
          <Select.Item value="true">{filter.trueLabel ?? labels.yes}</Select.Item>
          <Select.Item value="false">{filter.falseLabel ?? labels.no}</Select.Item>
        </Select>
      )
      break
    }
    case 'multi-select': {
      const keys: string[] = []
      // Values that are not among the options stay in the state.
      const others: Array<string | number> = []
      for (const item of Array.isArray(value) ? value : []) {
        const index = filter.options.findIndex((option) => option.value === item)
        if (index < 0) others.push(item)
        else if (!keys.includes(String(index))) keys.push(String(index))
      }
      const options: ComboboxOption[] = filter.options.map((option, i) => ({
        value: String(i),
        label: option.label,
        disabled: option.disabled,
      }))
      control = (
        <MultiSelect
          size={size}
          aria-label={name}
          placeholder={filter.placeholder ?? labels.any}
          options={options}
          value={keys}
          onValueChange={(next) =>
            onChange([...others, ...next.map((key) => filter.options[Number(key)]!.value)])
          }
        />
      )
      break
    }
    case 'date': {
      const date = value instanceof Date ? value : null
      const label = clearLabel(date !== null)
      control = (
        <Clearable label={label} onClear={clear}>
          <DatePicker
            ref={controlRef}
            size={size}
            aria-label={name}
            placeholder={filter.placeholder}
            locale={locale}
            value={date}
            onValueChange={onChange}
            // The clear button takes the calendar icon's place.
            {...(label !== null && { icon: null, ...clearSpace })}
          />
        </Clearable>
      )
      break
    }
    case 'date-range': {
      const range = isDateRange(value) ? value : emptyRange
      const label = clearLabel(range.start !== null || range.end !== null)
      control = (
        <Clearable label={label} onClear={clear}>
          <DateRangePicker
            ref={controlRef}
            size={size}
            aria-label={name}
            placeholder={filter.placeholder}
            locale={locale}
            value={range}
            onValueChange={onChange}
            {...(label !== null && { icon: null, ...clearSpace })}
          />
        </Clearable>
      )
      break
    }
    case 'text': {
      const text = typeof value === 'string' ? value : value === null ? '' : String(value)
      const label = clearLabel(text !== '')
      control = (
        <Clearable label={label} onClear={clear}>
          <Input
            ref={controlRef}
            size={size}
            aria-label={name}
            placeholder={filter.placeholder}
            value={text}
            onChangeText={onChange}
            onSubmitEditing={onSubmit}
            {...(label !== null && clearSpace)}
          />
        </Clearable>
      )
      break
    }
    case 'custom':
      control = filter.render({
        value,
        onValueChange: onChange,
        reset: onReset,
        size,
        disabled,
        ...(name !== undefined && { 'aria-label': name }),
      })
      break
  }

  return (
    <Field
      label={showLabels ? filter.label : undefined}
      disabled={disabled}
      error={isFilterValueValid(filter, value) ? undefined : labels.invalidRange}
      {...box}
    >
      {control}
    </Field>
  )
}

type FrameProps = GetProps<typeof FilterBarFrame>

export interface FilterBarProps extends Omit<
  FrameProps,
  'variant' | 'direction' | 'wrap' | 'align' | 'distribute' | 'role' | 'children' | 'defaultValue'
> {
  /** The filters, in order. Keys must be unique. */
  filters?: FilterDefinition[]
  /**
   * Each filter's value by key (controlled). A missing key reads as the
   * filter's default; `null` is unset. With `showApplyButton`, the applied
   * filters.
   */
  value?: FilterState
  /** The starting state when uncontrolled. Default: every filter's default. */
  defaultValue?: FilterState
  /**
   * Called with the whole state: on every change, or with `showApplyButton`
   * on Apply. Reset and chip removal call it too.
   */
  onValueChange?: (value: FilterState) => void
  /** Apply was pressed (`showApplyButton`), with the state just applied. */
  onApply?: (value: FilterState) => void
  /** Reset was pressed, after the filters went back to their defaults. */
  onReset?: () => void
  /** Adds a search field. Its text is in the state under `searchKey`. */
  searchable?: boolean
  /** The search text's key in the state. Default `'search'`. */
  searchKey?: string
  /** Default: the search label, "Search". */
  searchPlaceholder?: string
  /** `responsive`: a column on phones, a row from the `md` breakpoint. Default `horizontal`. */
  layout?: FilterBarLayout
  /** Gap, padding and the size of every control. Default `md`. */
  size?: FilterBarSize
  variant?: FilterBarVariant
  /** In a row, controls wrap onto new lines when they do not fit. Default true. */
  wrap?: boolean
  /** Visible labels above the controls. When false, the labels name the controls. Default true. */
  showLabels?: boolean
  /** Changes stay a draft until Apply is pressed. */
  showApplyButton?: boolean
  /** A Reset button that puts every filter and the search back to their defaults. */
  showResetButton?: boolean
  /** A badge with the number of active filters. */
  showActiveCount?: boolean
  /** Active filters as chips that remove them. */
  showActiveFilters?: boolean
  /**
   * Puts the filters marked `advanced` (or, when none is, every filter)
   * behind a "More filters" button.
   */
  collapsible?: boolean
  disabled?: boolean
  /** Content at the start, such as a title. A string is shown as Text. */
  leading?: ReactNode
  /** Content at the end, after the actions, such as an Export button. */
  trailing?: ReactNode
  /** Extra controls after the filters. */
  children?: ReactNode
  /** Locale of the date pickers and of dates in chips. Default: the device's. */
  locale?: string
  labels?: Partial<FilterBarLabels>
  /** Names the bar. Default "Filters". */
  'aria-label'?: string
}

/**
 * Search, filter controls built from definitions, active-filter chips, and
 * Apply and Reset, for a table, list or dashboard. It holds the filter values;
 * your app filters the data with them.
 */
export const FilterBar = forwardRef<TamaguiElement, FilterBarProps>(function FilterBar(
  {
    filters = none,
    value: valueProp,
    defaultValue = emptyState,
    onValueChange,
    onApply,
    onReset,
    searchable = false,
    searchKey = 'search',
    searchPlaceholder,
    layout = 'horizontal',
    size = 'md',
    variant = 'default',
    wrap = true,
    showLabels = true,
    showApplyButton = false,
    showResetButton = false,
    showActiveCount = false,
    showActiveFilters = false,
    collapsible = false,
    disabled = false,
    leading,
    trailing,
    children,
    locale,
    labels: labelsProp,
    'aria-label': ariaLabel = 'Filters',
    gap,
    ...props
  },
  forwardedRef,
) {
  const labels = { ...defaultLabels, ...labelsProp }
  const search = searchable ? searchKey : undefined
  const defs = usableFilters(filters, search)
  const spacing = sizes[size]
  const space = gap ?? spacing.gap
  const ref = useRef<TamaguiElement>(null)
  const composedRef = useComposedRefs(ref, forwardedRef)
  const chipsRef = useRef<TamaguiElement>(null)
  const pendingFocus = useRef<number | null>(null)

  // The applied state. Read through `resolveFilterState`, so a missing key
  // is the filter's default and empty values are null.
  const [stored, setStored] = useControllableState({
    value: valueProp,
    defaultValue: resolveFilterState(defs, defaultValue, search),
    onChange: onValueChange,
  })
  const committed = resolveFilterState(defs, stored, search)

  // With an Apply button, edits go to a draft. The draft follows the applied
  // state whenever that changes (by content, not identity), as when the
  // parent sets new filters; a commit made here moves `base` first, so it
  // keeps the edits still pending.
  const [draftState, setDraftState] = useState(committed)
  const [base, setBase] = useState(committed)
  if (showApplyButton && !sameFilterState(base, committed)) {
    setBase(committed)
    setDraftState(committed)
  }
  const draft = showApplyButton ? resolveFilterState(defs, draftState, search) : committed
  const defaults = resolveFilterState(defs, emptyState, search)
  const atDefaults = (state: FilterState) => sameFilterState({ ...state, ...defaults }, state)

  const commit = (next: FilterState) => {
    if (showApplyButton) setBase(next)
    if (!sameFilterState(next, committed)) setStored(next)
  }
  const change = (key: string, next: FilterValue) => {
    const updated = { ...draft, [key]: normalizeFilterValue(next) }
    if (showApplyButton) setDraftState(updated)
    else commit(updated)
  }

  const invalid = defs.some((filter) => !isFilterValueValid(filter, draft[filter.key]))
  const dirty = showApplyButton && !sameFilterState(draft, committed)
  const canReset = !atDefaults(committed) || !atDefaults(draft)

  const apply = () => {
    if (disabled || !dirty || invalid) return
    commit(draft)
    onApply?.(draft)
  }
  const reset = () => {
    if (disabled) return
    commit({ ...committed, ...defaults })
    if (showApplyButton) setDraftState({ ...draft, ...defaults })
    onReset?.()
  }
  // A chip shows an applied filter, so removing it applies at once.
  const remove = (filter: FilterDefinition, index: number) => {
    if (disabled) return
    const fallback = defaultOf(filter)
    commit({ ...committed, [filter.key]: fallback })
    if (showApplyButton) setDraftState({ ...draft, [filter.key]: fallback })
    pendingFocus.current = index
  }

  // Web: a removed chip's button takes focus with it, so focus moves to the
  // chip that took its place (or the one before), else to the bar.
  useEffect(() => {
    const index = pendingFocus.current
    if (index === null || !isWeb) return
    pendingFocus.current = null
    const chips = chipsRef.current as unknown as HTMLElement | null
    const buttons = chips ? Array.from(chips.querySelectorAll<HTMLElement>('button')) : []
    const target = buttons[Math.min(index, buttons.length - 1)] ?? (ref.current as Focusable)
    target?.focus?.()
  })

  const active = defs.filter((filter) => isFilterActive(filter, committed[filter.key]))
  const advanced = collapsible
    ? defs.some((filter) => filter.advanced)
      ? defs.filter((filter) => filter.advanced)
      : defs
    : none
  const inline = advanced.length ? defs.filter((filter) => !advanced.includes(filter)) : defs
  const hiddenActive = active.filter((filter) => advanced.includes(filter)).length

  // Labels sit above the controls, so a row lines controls up by their bottom edge.
  const rowAlign: StackAlign = showLabels ? 'end' : 'center'
  const rowProps: {
    direction: Responsive<StackDirection>
    wrap: StackWrap
    align: Responsive<StackAlign>
    gap: typeof space
  } = {
    direction:
      layout === 'horizontal'
        ? 'row'
        : layout === 'vertical'
          ? 'column'
          : { base: 'column', md: 'row' },
    wrap: wrap && layout !== 'vertical' ? 'wrap' : 'nowrap',
    align:
      layout === 'horizontal'
        ? rowAlign
        : layout === 'vertical'
          ? 'stretch'
          : { base: 'stretch', md: rowAlign },
    gap: space,
  }

  const control = (filter: FilterDefinition) => (
    <FilterControl
      key={filter.key}
      filter={filter}
      value={draft[filter.key] ?? null}
      onChange={(next) => change(filter.key, next)}
      onReset={() => change(filter.key, defaultOf(filter))}
      onSubmit={showApplyButton ? apply : undefined}
      size={size}
      disabled={disabled}
      showLabels={showLabels}
      labels={labels}
      locale={locale}
      box={controlBox(
        layout,
        filter.type === 'multi-select' || filter.type === 'date-range'
          ? spacing.wide
          : spacing.field,
      )}
    />
  )

  const searchText = search === undefined ? null : draft[search]
  const dates = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
  const actions = [
    showActiveCount && active.length > 0 ? (
      <Badge key="count" variant="secondary" size={size === 'sm' ? 'sm' : 'md'} alignSelf="center">
        {labels.activeCount(active.length)}
      </Badge>
    ) : null,
    advanced.length ? (
      <Collapsible.Trigger key="more">
        <Button
          size={size}
          variant="outline"
          icon={<FilterIcon />}
          disabled={disabled}
          iconAfter={
            hiddenActive > 0 ? (
              <Badge size="sm" variant="secondary" alignSelf="center" aria-hidden>
                {hiddenActive}
              </Badge>
            ) : undefined
          }
          {...(hiddenActive > 0 && {
            'aria-label': `${labels.moreFilters}, ${labels.activeCount(hiddenActive)}`,
          })}
        >
          {labels.moreFilters}
        </Button>
      </Collapsible.Trigger>
    ) : null,
    showResetButton ? (
      <Button
        key="reset"
        size={size}
        variant="ghost"
        disabled={disabled || !canReset}
        onPress={reset}
      >
        {labels.reset}
      </Button>
    ) : null,
    showApplyButton ? (
      <Button key="apply" size={size} disabled={disabled || !dirty || invalid} onPress={apply}>
        {labels.apply}
      </Button>
    ) : null,
    present(trailing) ? (
      <Stack key="trailing" direction="row" align="center" gap={space}>
        {isTextContent(trailing) ? <Text>{trailing}</Text> : trailing}
      </Stack>
    ) : null,
  ].filter(present)

  const main = (
    <Stack {...rowProps}>
      {present(leading) ? (
        <View justifyContent="center" minHeight={spacing.control} flexShrink={1}>
          {isTextContent(leading) ? <Text>{leading}</Text> : leading}
        </View>
      ) : null}
      {search !== undefined ? (
        <View {...searchBox(layout, spacing)}>
          <Search
            size={size}
            aria-label={labels.search}
            placeholder={searchPlaceholder ?? labels.search}
            value={typeof searchText === 'string' ? searchText : ''}
            onValueChange={(text) => change(search, text)}
            onSearch={showApplyButton ? apply : undefined}
            disabled={disabled}
          />
        </View>
      ) : null}
      {inline.map(control)}
      {isTextContent(children) ? <Text>{children}</Text> : children}
      {actions.length ? (
        <Stack
          direction="row"
          wrap="wrap"
          align="center"
          gap={space}
          {...(layout === 'horizontal'
            ? { marginInlineStart: 'auto' }
            : layout === 'vertical'
              ? { distribute: 'end' }
              : { distribute: 'end', marginInlineStart: 'md:auto' })}
        >
          {actions}
        </Stack>
      ) : null}
    </Stack>
  )

  return (
    <FilterBarFrame
      ref={composedRef}
      role="group"
      aria-label={ariaLabel}
      variant={variant}
      gap={space}
      padding={variant === 'ghost' ? 0 : spacing.padding}
      // The focus target once the last chip is removed; not a Tab stop.
      {...(isWeb && { tabIndex: -1 })}
      // Style props given here win over the variant and size.
      {...props}
    >
      {advanced.length ? (
        <Collapsible gap={space}>
          {main}
          <Collapsible.Content>
            <Stack {...rowProps} role="group" aria-label={labels.moreFilters}>
              {advanced.map(control)}
            </Stack>
          </Collapsible.Content>
        </Collapsible>
      ) : (
        main
      )}
      {showActiveFilters && active.length ? (
        <Wrap ref={chipsRef} role="group" aria-label={labels.activeFilters} gap="2">
          {active.map((filter, index) => {
            const text = `${filter.label}: ${formatFilterValue(filter, committed[filter.key] ?? null, labels, dates)}`
            return (
              <Chip
                key={filter.key}
                maxWidth="100%"
                disabled={disabled}
                onRemove={() => remove(filter, index)}
                removeLabel={labels.removeFilter(text)}
              >
                {text}
              </Chip>
            )
          })}
        </Wrap>
      ) : null}
    </FilterBarFrame>
  )
})
