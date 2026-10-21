import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Filter Bar',
  slug: 'filter-bar',
  category: 'advanced',
  description:
    'Search, filter controls built from definitions, active-filter chips, and Apply and Reset, above a table, list or dashboard.',
  status: 'stable',
  since: '0.13.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'FilterBar',
    'FilterBarProps',
    'FilterBarLabels',
    'FilterDefinition',
    'FilterOption',
    'FilterState',
    'FilterValue',
    'CustomFilterDefinition',
    'CustomFilterContext',
  ],
  files: [
    'components/filter-bar/FilterBar.tsx',
    'components/filter-bar/filters.ts',
    'components/filter-bar/index.ts',
  ],
  keywords: [
    'filter',
    'filters',
    'filter bar',
    'faceted search',
    'search',
    'query',
    'chips',
    'date range',
    'data table',
    'dashboard',
  ],
  usage: `import { FilterBar, type FilterState } from '@advui/data'

const [filters, setFilters] = useState<FilterState>({})

<FilterBar
  searchable
  filters={[
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    { key: 'created', label: 'Created', type: 'date-range' },
  ]}
  value={filters}
  onValueChange={setFilters}
  showActiveFilters
  showResetButton
/>`,
  parts: [
    {
      name: 'FilterBar',
      description:
        'Also takes Stack style props (`width`, `margin`…), which win over the variant and size.',
      props: [
        {
          name: 'filters',
          type: 'FilterDefinition[]',
          default: '[]',
          description:
            'The filters, in order: each one a labelled control. Keys must be unique and differ from `searchKey`; a repeated key logs a warning in development and only its first use is rendered. Definitions are never changed.',
        },
        {
          name: 'value',
          type: 'FilterState',
          description:
            'Each filter value by key (controlled). A missing key reads as the filter default; `null` is unset. Keys that are not filters are kept and passed back. With `showApplyButton`, the applied filters.',
        },
        {
          name: 'defaultValue',
          type: 'FilterState',
          default: 'every filter default',
          description:
            'The starting state when uncontrolled, read once: a new object with the same content does not reset it.',
        },
        {
          name: 'onValueChange',
          type: '(value: FilterState) => void',
          description:
            'Called with the whole state, every filter key present: on each change, or with `showApplyButton` on Apply. Reset and chip removal call it too.',
        },
        {
          name: 'onApply',
          type: '(value: FilterState) => void',
          description:
            'Apply was pressed (or Enter in the search or a text filter) with `showApplyButton`; gets the state just applied.',
        },
        {
          name: 'onReset',
          type: '() => void',
          description:
            'Reset was pressed, once per press, after the filters went back to their defaults. Refresh your data here if you need to; Filter Bar fetches nothing.',
        },
        {
          name: 'searchable',
          type: 'boolean',
          default: 'false',
          description: 'Adds a search field. Its text is in the state under `searchKey`.',
        },
        {
          name: 'searchKey',
          type: 'string',
          default: "'search'",
          description:
            'The key of the search text in the state: the one place it is kept. `null` when empty.',
        },
        {
          name: 'searchPlaceholder',
          type: 'string',
          default: "'Search'",
          description: 'Placeholder of the search field.',
        },
        {
          name: 'layout',
          type: "'horizontal' | 'vertical' | 'responsive'",
          options: ['horizontal', 'vertical', 'responsive'],
          default: "'horizontal'",
          description:
            '`horizontal`: a row of controls that wraps. `vertical`: a column of full-width controls, for a side panel. `responsive`: a column on phones and a row from the `md` breakpoint.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Gap, padding, control widths, and the size of every control and button.',
        },
        {
          name: 'variant',
          type: "'default' | 'outline' | 'filled' | 'ghost'",
          options: ['default', 'outline', 'filled', 'ghost'],
          default: "'default'",
          description:
            'The container only: `default` the page background, `outline` adds a border, `filled` a muted surface, `ghost` no fill, border or padding (above a table or inside a card).',
        },
        {
          name: 'wrap',
          type: 'boolean',
          default: 'true',
          description:
            'In a row, controls that do not fit move onto new lines. Turn off only when the bar always has room.',
        },
        {
          name: 'showLabels',
          type: 'boolean',
          default: 'true',
          description:
            'Visible labels above the controls. When false the labels still name the controls, and the bar is one line high.',
        },
        {
          name: 'showApplyButton',
          type: 'boolean',
          default: 'false',
          description:
            'Changes stay a draft until Apply: `value` and `onValueChange` are then the applied state. Apply is disabled while nothing changed or a range is invalid.',
        },
        {
          name: 'showResetButton',
          type: 'boolean',
          default: 'false',
          description:
            'A Reset button that puts every filter and the search back to their defaults (the "clear all" action). Disabled when there is nothing to reset.',
        },
        {
          name: 'showActiveCount',
          type: 'boolean',
          default: 'false',
          description:
            'A badge with the number of active filters ("2 filters applied"), hidden at zero.',
        },
        {
          name: 'showActiveFilters',
          type: 'boolean',
          default: 'false',
          description:
            'Active filters as chips ("Status: Active"); each chip removes its filter (back to its default).',
        },
        {
          name: 'collapsible',
          type: 'boolean',
          default: 'false',
          description:
            'Puts the filters marked `advanced` behind a "More filters" button that counts the active ones. With none marked, every filter goes behind it.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables every control, chip and action.',
        },
        {
          name: 'leading',
          type: 'ReactNode',
          description: 'Content at the start, such as a title. A string is shown as Text.',
        },
        {
          name: 'trailing',
          type: 'ReactNode',
          description: 'Content at the end, after the actions, such as an Export button.',
        },
        {
          name: 'locale',
          type: 'string',
          default: "the device's",
          description: 'Locale of the date pickers and of the dates in chips.',
        },
        {
          name: 'labels',
          type: 'Partial<FilterBarLabels>',
          description:
            'Every text Filter Bar writes (Apply, Reset, "More filters", the count, remove and clear button names, "All", "Yes", "No"…), for translation.',
        },
        {
          name: 'aria-label',
          type: 'string',
          default: "'Filters'",
          description: 'Names the bar, a `group`. Name it when a page has several.',
        },
        {
          name: 'gap',
          type: 'SpaceTokens | number',
          token: 'space',
          default: 'from `size`',
          description: 'Space between controls and between rows.',
        },
        {
          name: 'padding',
          type: 'SpaceTokens | number',
          token: 'space',
          default: 'from `size`, none for `ghost`',
          description: '`paddingHorizontal`, `paddingVertical` and the shorthands work too.',
        },
        {
          name: 'backgroundColor',
          type: 'ColorTokens',
          token: 'color',
          default: 'from `variant`',
          description: 'Overrides the variant surface.',
        },
        {
          name: 'borderColor',
          type: 'ColorTokens',
          token: 'color',
          default: "'border' (outline)",
          description: 'Overrides the outline color. Other variants show it with a `borderWidth`.',
        },
        {
          name: 'borderRadius',
          type: 'RadiusTokens | number',
          token: 'radius',
          default: "'lg'",
          description: 'Corner radius of the container.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'FilterDefinition',
      kind: 'type',
      description:
        'One filter. `type` picks the control: `select` (Select), `multi-select` (Multi Select), `boolean` (a Select of All, Yes and No), `date` (Date Picker), `date-range` (Date Range Picker), `text` (Input) or `custom`.',
      props: [
        {
          name: 'key',
          type: 'string',
          required: true,
          description: 'Unique and stable: the filter key in the state.',
        },
        {
          name: 'label',
          type: 'string',
          required: true,
          description: 'Names the control and starts its chip.',
        },
        {
          name: 'type',
          type: "'select' | 'multi-select' | 'boolean' | 'date' | 'date-range' | 'text' | 'custom'",
          options: ['select', 'multi-select', 'boolean', 'date', 'date-range', 'text', 'custom'],
          required: true,
          description: 'The control, and the shape of the value (see Values).',
        },
        {
          name: 'options',
          type: 'FilterOption[]',
          description:
            '`select` and `multi-select`: `{ label, value, disabled? }`. Values may be strings or numbers (and booleans in a select); they go into the state as given, never their labels.',
        },
        {
          name: 'defaultValue',
          type: 'FilterValue',
          default: 'null',
          description:
            'What a missing key reads as, what Reset and a chip restore, and a value that is not counted as active.',
        },
        {
          name: 'placeholder',
          type: 'string',
          description:
            'Shown while unset. For `select` and `boolean` also the first option, which unsets the filter. Default "All" for those and `multi-select`.',
        },
        {
          name: 'trueLabel',
          type: 'string',
          default: "'Yes'",
          description: '`boolean`: the option and chip text for `true`.',
        },
        {
          name: 'falseLabel',
          type: 'string',
          default: "'No'",
          description: '`boolean`: the option and chip text for `false`.',
        },
        {
          name: 'advanced',
          type: 'boolean',
          default: 'false',
          description: 'With `collapsible`, the filter sits behind "More filters".',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables this filter.',
        },
        {
          name: 'render',
          type: '(context: CustomFilterContext) => ReactNode',
          description:
            '`custom`: the control. The context has `value`, `onValueChange`, `reset`, `size`, `disabled` and, while labels are hidden, `aria-label`. Core form controls inside take the label from the filter Field.',
        },
        {
          name: 'format',
          type: '(value) => string',
          description: '`custom`: how the value reads in its chip. Default: the value as text.',
        },
      ],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Search and a status filter',
      description: 'Uncontrolled: the bar keeps its own state.',
    },
    {
      name: 'data-table',
      title: 'Filtering a data table',
      description:
        'Controlled. The app filters the rows with the state; `ghost` sits flush above the table.',
    },
    {
      name: 'multi-select',
      title: 'Multi-select filter',
      description:
        'Picks show as chips in the field, removable one by one; a disabled option cannot be picked.',
    },
    {
      name: 'apply',
      title: 'Date range with Apply and Reset',
      description:
        'Changes are a draft until Apply. Reset puts the defaults back and applies at once.',
    },
    {
      name: 'active-filters',
      title: 'Active filters and count',
      description:
        'Chips remove one filter each; the count and Reset follow. A Verified filter set to No counts.',
    },
    {
      name: 'dashboard',
      title: 'Dashboard filters',
      description:
        '`layout="responsive"`: stacked on phones, a row from `md`, on a `filled` surface.',
    },
    {
      name: 'custom-content',
      title: 'Leading and trailing content',
      description: 'A title at the start and an Export button after the filters.',
    },
    {
      name: 'collapsible',
      title: 'Advanced filters',
      description:
        'Filters marked `advanced` wait behind "More filters", which counts the active ones; closing keeps their values.',
    },
    {
      name: 'custom-filter',
      title: 'Custom filter control',
      description: 'A Number Input as a typed `custom` filter, with its own chip text.',
    },
    {
      name: 'compact',
      title: 'Compact, without labels',
      description: '`showLabels={false}` and `size="sm"`: one line, the labels name the controls.',
    },
    {
      name: 'variants',
      title: 'Variants',
      description: '`default`, `outline`, `filled` and `ghost` style the container only.',
    },
  ],
  playground: {
    component: 'FilterBar',
    controls: [
      {
        prop: 'sample',
        type: 'select',
        options: ['users', 'orders', 'transactions', 'analytics'],
        default: 'users',
      },
      {
        prop: 'layout',
        type: 'select',
        options: ['horizontal', 'vertical', 'responsive'],
        default: 'horizontal',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      {
        prop: 'variant',
        type: 'select',
        options: ['default', 'outline', 'filled', 'ghost'],
        default: 'default',
      },
      { prop: 'searchable', type: 'boolean', default: false },
      { prop: 'showLabels', type: 'boolean', default: true },
      { prop: 'showApplyButton', type: 'boolean', default: false },
      { prop: 'showResetButton', type: 'boolean', default: false },
      { prop: 'showActiveCount', type: 'boolean', default: false },
      { prop: 'showActiveFilters', type: 'boolean', default: false },
      { prop: 'collapsible', type: 'boolean', default: false },
      { prop: 'wrap', type: 'boolean', default: true },
      { prop: 'disabled', type: 'boolean', default: false },
      { prop: 'gap', type: 'text', default: '' },
      { prop: 'padding', type: 'text', default: '' },
      { prop: 'backgroundColor', type: 'text', default: '' },
      { prop: 'borderColor', type: 'text', default: '' },
      { prop: 'borderRadius', type: 'text', default: '' },
    ],
  },
  accessibility: [
    'The bar is a `group` named by `aria-label` ("Filters" by default). Every control keeps its own Tab stop and its own keyboard behavior; Filter Bar adds no arrow-key handling.',
    'Each filter is a Field: its visible label is linked to the control, or, with `showLabels={false}`, names it with `aria-label`. Select, Multi Select, Date Picker and Date Range Picker keep their own roles, states and keyboard support; disabled options are announced as disabled.',
    'The search field is a named `searchbox` with its own clear button. Text and date filters get a clear button ("Clear Created") once they have a value; clearing moves focus back to the control.',
    'Chips sit in a `group` named "Active filters". Each remove button is named from the chip ("Remove Status: Active"). On web, removing one moves focus to the chip that took its place, or to the bar when none is left.',
    'The count is text ("2 filters applied"), not a color or a dot. The "More filters" button has `aria-expanded` and `aria-controls`, and its name includes the count of active filters behind it.',
    'A date range that ends before it starts is marked invalid (`aria-invalid`) with an error linked to the field; it is never swapped. Apply, Reset and Clear are disabled, not hidden, when they would do nothing.',
    'Nothing is a live region: the controls announce their own changes, so the bar adds no second announcement.',
  ],
  keyboard: [
    {
      keys: 'Tab',
      action:
        'Moves through the search field, each filter (and its clear button), the chips, and the actions.',
    },
    {
      keys: 'Enter',
      action:
        'In the search field or a text filter with `showApplyButton`: applies. On a chip remove button: removes the filter.',
    },
    {
      keys: 'Escape',
      action: 'In the search field: clears it (web). Closes an open list or calendar.',
    },
  ],
  responsive:
    'In a row, each control has a width from `size` (wider for multi-select and date-range filters), never wider than the bar, and the search field takes the free space. With `wrap` (on by default) controls that do not fit move onto new lines, and the actions stay at the end edge. `layout="vertical"` stacks full-width controls for a side panel or sheet, and `layout="responsive"` does so below the `md` breakpoint (768px) and switches to a row above it. Chips wrap. Nothing has a fixed height, so long labels and larger text grow the bar instead of being clipped. For many filters on phones, mark the less used ones `advanced` and set `collapsible`.',
  tables: [
    {
      id: 'values',
      title: 'Values',
      description:
        'Unset is always `null`: an emptied text field, an empty multi-select, and a range with neither end are reported as `null`. `false` is a value, not unset.',
      columns: ['Type', 'Value', 'Counted and shown as a chip when'],
      rows: [
        ['`select`', 'the option value (string, number or boolean)', 'set and not its default'],
        [
          '`multi-select`',
          'an array of option values, no repeats',
          'one or more picked; counts once',
        ],
        [
          '`boolean`',
          '`true` or `false`',
          'either one, `false` included, unless it is the default',
        ],
        [
          '`date`',
          'a `Date` at local midnight, as Calendar gives it; never converted to UTC',
          'set',
        ],
        [
          '`date-range`',
          '`{ start: Date | null, end: Date | null }`; one end may be open',
          'either end set; counts once',
        ],
        ['`text`', 'the text as typed (no trimming or case changes)', 'not empty'],
        ['`custom`', 'any `FilterValue`', 'set and not its default'],
        ['search', 'the text under `searchKey`', 'never: it has its own field and clear button'],
      ],
    },
    {
      id: 'actions',
      title: 'Apply, Reset and chips',
      description:
        'Filter Bar never fetches or queries: it reports the state, and your app filters its data.',
      columns: ['Action', 'Without Apply button', 'With `showApplyButton`'],
      rows: [
        ['Change a control', '`onValueChange` at once', 'Changes the draft only'],
        ['Apply', '—', '`onValueChange` and `onApply` with the draft'],
        [
          'Reset',
          'Defaults for every filter and the search; `onValueChange`, then `onReset`',
          'The same, applied at once; the draft is reset too',
        ],
        [
          'Remove a chip',
          'That filter back to its default; `onValueChange`',
          'The same, applied at once; other pending edits stay',
        ],
        [
          'Parent sets `value`',
          'Shown',
          'Shown, and replaces the draft (when the content differs)',
        ],
      ],
    },
    {
      id: 'definitions',
      title: 'Changing definitions',
      columns: ['Change', 'What happens'],
      rows: [
        ['A filter is added', 'Its key reads as its default until it is set.'],
        [
          'A filter is removed',
          'Its value stays in the state like any other key, and is no longer shown, counted or reset.',
        ],
        [
          'Options change',
          'The value is kept. A value no longer among the options shows the placeholder in the control and its raw value in the chip.',
        ],
        [
          'A default changes',
          'Reset and the count use the new default; the current state is not changed.',
        ],
      ],
    },
  ],
  platformNotes: {
    web: 'A `div` with `role="group"`. Selects open a listbox, and the date pickers a popover. Removing a chip moves focus (DOM focus).',
    ios: 'Selects and the multi-select open bottom sheets; on a phone the multi-select field is one button, and picks are removed by unchecking them in the sheet (or with the bar chips). The container is not one accessible element, so VoiceOver reaches each control.',
    android:
      'Same as iOS, for TalkBack; the back button closes an open sheet or calendar. Focus is not moved after a chip is removed: TalkBack moves on by itself.',
  },
  related: [
    'data-table',
    'toolbar',
    'search',
    'select',
    'multi-select',
    'date-range-picker',
    'chip',
  ],
})
