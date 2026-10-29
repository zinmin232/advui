# @advui/data

Components for showing and working with structured data in
[Adv UI](https://github.com/zinmin232/advui), on web, iOS and Android:
Table, Data Table (sorting, selection, pagination), Data Grid (editable cells),
Filter Bar (search, filters, active-filter chips), Tree View, Timeline, Stat,
KPI Card, Virtual List, Infinite Scroll, Event Calendar and Kanban.

```bash
pnpm add @advui/data @advui/core @advui/theme @advui/icons tamagui
```

```tsx
import { DataTable, type DataTableColumn } from '@advui/data'

const columns: DataTableColumn<Project>[] = [
  { id: 'organization', header: 'Organization', sortable: true },
  { id: 'beneficiaries', header: 'Reached', sortable: true, align: 'end' },
]

<DataTable aria-label="Projects" data={projects} columns={columns} pageSize={10} searchable selectable />
```

The components render inside the app's `UniversalProvider` from
`@advui/core`, which is a peer dependency, as are `react`, `react-native` and
`tamagui`. No other libraries are added.

**Exports:** DataGrid, DataTable, EventCalendar (with its event and label
types), FilterBar (with its filter definition and state types),
InfiniteScroll, Kanban (with KanbanCardFrame, `moveItem` and `findItem`),
KpiCard, Stat (with StatLabel, StatValue, StatHelpText, StatFrame), Table
(with its frames), Timeline (with its parts), TreeView, `flattenTree`,
VirtualList, and their prop types.

**Metadata:** `@advui/data/meta` exports `components`, the metadata of these
components (types in `@advui/core/meta`), for tools such as the AdvUI Builder.

Docs: https://zinmin232.github.io/advui/docs/components/data-table. License: MIT.
