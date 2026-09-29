# @advui/data

Components for showing and working with structured data in
[Adv UI](https://github.com/zinmin232/advui), on web, iOS and Android:
Table, Data Table (sorting, selection, pagination), Data Grid (editable cells),
Tree View, Timeline, Stat and KPI Card.

> Not on npm yet: `@advui/data` will be published with the next release.
> Until then, copy the components into your app with the CLI:
> `npx advui add data-table`.

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

**Exports:** DataGrid, DataTable, KpiCard, Stat (with StatLabel, StatValue,
StatHelpText, StatFrame), Table (with its frames), Timeline (with its parts),
TreeView, `flattenTree`, and their prop types.

Docs: https://zinmin232.github.io/advui/docs/components/data-table. License: MIT.
