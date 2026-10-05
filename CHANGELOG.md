# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the packages
follow [Semantic Versioning](https://semver.org). All published packages share
one version.

## [Unreleased]

### Added

- **`ariaState(on)`** in `@advui/core`, for components built on core: a
  boolean `aria-disabled`, `aria-busy` or `aria-selected` that is left out
  when off on web and sent as `false` on iOS and Android.
- **Video `crossOrigin`** (`'anonymous'` or `'use-credentials'`, web): browsers
  only load caption files from another origin when the video is fetched with
  CORS.
- Docs: a **Form playground** (title, description, direction, gap, loading,
  disabled, full width), also on the Playground page. Text props in every
  playground now appear in the generated JSX even when unchanged.

### Changed

- **A disabled Form disables every form control inside it**, in a Field or
  not: Input, Textarea, Select, Checkbox, Switch, Radio Group, the pickers
  and any control that calls `useFieldControl`. Buttons other than
  `Form.Submit` stay enabled, so Cancel still works.
- **`useFormStatus` is now `useParentForm`**, and its type `FormStatus` is
  `FormContextValue`, so it is not mistaken for React DOM's `useFormStatus`
  (Server Actions). The old names still work as deprecated aliases.
- The Video and Audio Player examples play clips made for these docs instead
  of MDN's samples: a handwashing video with English captions (a WebVTT
  file), a square silent loop, a flood-safety radio message and a voice
  message. They are served from the docs site (`/media`) and made by
  `scripts/demo-media/make-demo-media.ps1`.

- Stable after the Android phone check: Stat, KPI Card, List, Timeline,
  Image, Table, Pagination, Stepper, Data Table, Tree View, Navigation Menu,
  Sidebar, Search, Command Palette, Image Gallery, Bar / Line / Area / Pie
  Chart, Resizable Panel, Data Grid, Video, Audio Player and Loading Button.
  Form and Rich Text Editor stay beta until their open API questions are
  settled.

### Fixed

- TalkBack kept reading a cleared state on Android: "Page 1, selected" and
  "Previous page, disabled" after paging, or a disabled button after it was
  enabled again. React Native keeps the last value of an accessibility prop
  that is removed, so disabled, busy and selected states are now sent as
  `false` when they turn off (Button, Pagination, Input, Textarea, Slider,
  Toggle, Toggle Group, Chip, Fab, List, Menu, Navigation Bar, Sidebar,
  Calendar, Combobox, pickers, File Dropzone, Search, Circular Progress and
  Tree View).
- Button and Loading Button on Android: while loading, TalkBack read only
  "busy", and went on reading "busy" after loading ended. A text button now
  names itself with its text on native, so it reads "Saving…, busy" and then
  its label again. Data Table and KPI Card set `aria-busy` on web only, since
  a native container cannot report it without a name.
- Table with `minWidth` on iOS and Android: the columns did not line up from
  row to row, because each row sized its columns to its own text inside the
  sideways scroll view. The table now gets a set width there.
- Data Grid on Android: tapping a cell opened the editor without the
  keyboard, and the cell could stay off screen. The editor is now focused and
  its column scrolled into view. The Done key no longer blurs the editor, so
  an invalid value shows its error instead of being dropped.
- Charts on iOS and Android: the plot's name ended with "Use the arrow keys
  to read each value", which a phone cannot do. The hint is web only now.
- Image: the fallback example used a relative path, which never fails on
  Android, so the fallback did not show there. It now uses an address that
  fails on every platform.
- Table: the basic example squeezed its columns on phones and broke words
  mid-way; it scrolls sideways below 480 pt now.
- Sidebar: the App sidebar example squeezed its page into a 60 pt column on
  phones, so the heading and text broke letter by letter. Below `md` it now
  starts as an icon rail, and opening the sidebar pushes the page aside
  instead of squeezing it. Desktop looks the same.
- Select on web: every page with a Select logged "React does not recognize
  the `accessibilityHint` prop on a DOM element". Select, and Rich Text Editor
  when given a hint, now set this native-only prop on iOS and Android only.
- Docs: the install steps said React Native Web is installed automatically.
  It is not; web apps add `react-native-web` themselves.
- Docs: component pages without a playground rendered their first example twice
  (as the preview and again under Examples), duplicating the element ids the
  example sets, so fields were named twice ("Full name Full name"). The first
  example is now only the preview. The react-native-web stylesheet was also
  inserted once per streamed chunk under the same id. An e2e test now checks
  every component page for duplicate ids.

## [0.11.0] - 2026-10-04

### Added

- **AppShell** (beta): the frame of an app screen, with `AppShell.Header`,
  `AppShell.Sidebar`, `AppShell.Main` and `AppShell.Footer`. It fills the
  screen (`100dvh` on web, `flex: 1` on iOS and Android) and only Main
  scrolls, between the header and footer. `layout="header-full"` (default)
  or `"sidebar-full"` chooses which spans its edge. Below
  `sidebarBreakpoint` (default `md`) the sidebar's children move into a
  Drawer from the left, `drawerWidth` wide (default 280), opened by
  `AppShell.SidebarTrigger`; a drawer left open closes when the window
  widens past the breakpoint. `sidebarOpen` / `defaultSidebarOpen` /
  `onSidebarOpenChange` control it, and `useAppShell()` reads it.
  `stickyHeader={false}` lets the header scroll away with Main. Web
  landmarks: banner, navigation (named by the sidebar's `aria-label`),
  main and contentinfo. On iOS and Android the bars pad the safe areas
  (`safeArea={false}` turns that off under a navigation header or above a
  tab bar) and the back button closes the drawer.
- **AutoGrid** (beta): equal-width cells, as many columns as fit at
  `minChildWidth` (default 240), up to `maxColumns`, with no breakpoints:
  `<AutoGrid minChildWidth={240} gap="$4" maxColumns={4}>`. On web it is CSS
  grid (`repeat(auto-fill, minmax(…))`), so server-rendered HTML has the
  right columns; on iOS and Android it measures its width and picks the same
  count. **`autoGridColumns(width, minChildWidth, gap, maxColumns)`** returns
  that count.

### Changed

- Sidebar inside `AppShell.Sidebar` drops its own navigation landmark, since
  the area is one. In the AppShell's phone drawer it fills the drawer, does
  not collapse (Sidebar.Toggle renders nothing there), and pressing an item
  closes the drawer. Sidebars elsewhere are unchanged.

## [0.10.0] - 2026-10-04

### Added

- **Show and Hide** (beta): `<Show above="md">`, `<Show below="md">`,
  `<Show above="sm" below="lg">` and `<Hide below="sm">`. On web they are
  CSS media queries around a `display: contents` wrapper, so the server
  renders the right content for every width (no flash, no hydration
  mismatch) and hidden content stays mounted. On iOS and Android they read
  the window size and leave hidden content out.
- **`useBreakpoint()`** (the largest matching breakpoint, or `'base'`) and
  **`useBreakpointValue(map)`** (the value of a responsive map now, with the
  same cascade as the layout props). They see a phone on the first server
  render, so use them for behavior and Show / Hide or responsive props for
  layout.
- **Section** (beta): a `<section>` band with `spacing` (`none` … `xl`,
  larger from md, or a map), `background` (`muted`, `card`, `primarySoft`,
  `primary`, `inverse`…) and a `container` size. It passes `id`,
  `aria-label` and `aria-labelledby` through, so a named Section is a region
  landmark and `#features` links jump to it.
- **Sticky** (beta): keeps a header in view while its container scrolls,
  with `edge`, `offset` and `zIndex` (default `$sticky`). On web it is
  `position: sticky`. On iOS and Android a ScrollArea pins a top Sticky that
  is a direct child of its content element, with `stickyHeaderIndices`.
- **Primary and inverse sub-themes** in `@advui/theme`: `light_primary`,
  `dark_primary`, `light_inverse` and `dark_inverse`, for content on a
  primary or other-mode surface (`<Theme name="primary">`). Their text meets
  WCAG AA in every preset. `primarySurfaceTheme()` and `withSubThemes()`
  build them for your own themes.

### Changed

- `createThemeColors` and `createMaterialThemes` return the sub-themes too.
  If you swap themes at runtime, update every entry
  (`for (const [name, theme] of Object.entries(themes)) updateTheme({ name, theme })`),
  not only `light` and `dark`. `createUniversalConfig({ themes })` adds
  them to hand-made light and dark themes.
- ScrollArea on Android scrolls inside a scrolling screen: it turns on
  `nestedScrollEnabled`. Before, the screen took every vertical drag.
- ScrollArea on iOS and Android: when the content element's children
  include a top Sticky, they become the ScrollView's own children and the
  element's style props style the scroll content, so the Sticky can be
  pinned. Other ScrollAreas are unchanged.

## [0.9.0] - 2026-10-04

### Added

- **Responsive Stack props**: `direction`, `wrap`, `align` and `distribute`
  on Stack, HStack and VStack, each a value or a mobile-first map:
  `<Stack direction={{ base: 'column', md: 'row' }} align="center" distribute="between">`.
  `align` and `distribute` take short values (`start`, `end`, `between`,
  `around`, `evenly`). They are media props underneath, so on web they are
  CSS media queries (no flash during SSR) and they work in
  `styled(Stack, …)`. The raw style props still work and win when both set
  the same style: `flexDirection` over `direction`, `$md={{ flexDirection }}`
  over `direction`'s md value, in either order. On a stack, `direction` is now
  the layout prop. It replaces React Native's text-direction style of the
  same name in the types; `direction="rtl"` still sets the text direction at
  run time, so existing code keeps working.
- **Wrap** (beta): a row that wraps, for chips and tags: centered items and a
  `$2` gap, with the Stack props.
- **Container**: `gutter` sets the side padding with a token or a map
  (`gutter="$0"` removes it; the default stays 16 / 24 / 32px),
  `centerContent` centers the children, and `size="xxl"` (1536px). There is
  no `fluid` prop: `size="full"` is Bootstrap's `container-fluid`.
- **Labelled Separator**: `<Separator label="or" />`, with
  `labelPosition="start" | "center" | "end"` and `children` for richer
  content. Horizontal only. A decorative one hides its lines and leaves the
  label as text; with `decorative={false}` it is a `separator` named by the
  label.
- `Responsive<T>` and `responsiveStyle(prop, value, map?)`, the helper behind
  these props, for your own components. Grid uses it too, and
  `ResponsiveColumns` is now `Responsive<number>`.

### Changed

- Container's default side padding comes from its `gutter` variant instead
  of base styles. The CSS is the same.

## [0.8.0] - 2026-10-04

No component changes at run time: this release is about the metadata that
tools read.

### Added

- **Metadata for tools** such as the AdvUI Builder, which builds prop editors
  and drop rules from each component's `*.meta.ts`. The new fields are
  optional (`@advui/core/meta`):
  - On a prop: `options`, the closed list of values; `responsive`, when it
    also takes a `{ base, sm, md, … }` map; `token`, the theme scale its value
    comes from (`space`, `size`, `color`, `radius`, `zIndex`); `min`, `max`
    and `step` for numbers; and `platforms`, when it works on some platforms
    only. A new `Breakpoint` type names the breakpoints.
  - On a part: `children` (what may go inside: `'any'`, `'text'`, `'none'`
    or a list of parts, with `min` and `max`), `parents` (it must be a direct
    child of one of these), `within` (it must sit inside this part, because it
    reads its context) and `kind` (`hook`, `function` or `type` for documented
    parts that are not components).

  Every component fills them in: `options` for each closed list and child
  rules for each part. For example, Tooltip wraps exactly one trigger,
  `Tabs.List` takes `Tabs.Trigger`s, `Grid.Item` must be a direct child of
  `Grid`, and Button takes text.

- A metadata check (`packages/catalog/src/validate.ts`) that `pnpm catalog`
  and `pnpm test` run. It fails on duplicate `options`, a literal default that
  is not one of them, a closed type without `options`, child rules that name
  a part that does not exist, and rows that combine props, naming the
  component, part and prop.
- Docs: the props tables say which props also take a breakpoint map and which
  work on some platforms only.

### Fixed

- Select in a Field had no accessible name until the page hydrated: the
  server-rendered trigger is a `div`, which the Field's `<label for>` cannot
  name, so it now points at the label with `aria-labelledby`.

### Changed

- Component metadata lists one prop per row and one part per entry
  (`value`, `defaultValue` and `onValueChange`, not
  `value / defaultValue`; `Dialog.Header` and `Dialog.Footer`, not
  `Dialog.Header / Footer`), with no `…` and no aliases such as `FlexAlign`,
  `ButtonVariant` or `TextSize` in place of the values. The Stack page lists
  `flexDirection`, `alignItems`, `justifyContent`, `flexWrap` and `gap` with
  every value, for Stack, HStack and VStack. Responsive props show the
  value's own type (`columns: number`) and set `responsive`.

## [0.7.0] - 2026-10-03

### Changed

- **Form Field is now Field** (`import { Field } from '@advui/core'`), and it
  does more:
  - `optional` adds "(optional)" to the label (`optionalText` translates it);
    `required` wins when both are set.
  - `orientation="horizontal"` puts the label beside the control, with the
    help and error text under the control.
  - `fullWidth`, `gap`, and `id` for the control's id.
  - `label` is optional, and the label, help and error text take elements.
  - The control can sit inside a layout, such as an Input next to a Button.

  `FormField` and `FormFieldProps` still work as deprecated aliases. The docs
  page moved to `/docs/components/field`, and the CLI item is now
  `advui add field`.

- Field reaches its control through context instead of cloning its only
  child. Every core form control reads it; **a custom control** now calls the
  new `useFieldControl(props)` to get the id, state and descriptions it used to
  receive as props.
- `error=""` no longer marks a field invalid, like `undefined`, `null` and
  `false`.
- Field on iOS and Android: a label, help or error given as elements now
  names and describes the control too (only plain strings did), and the
  visible label is hidden from screen readers, which read the control's name
  instead. TalkBack used to read the label again, split into stray buttons
  such as "Email" and "*".
- Grid: `columnGap` is now the space between columns. It used to reach the
  row as CSS `column-gap`, which pushed cells onto new rows.

### Fixed

- Textarea: `disabled` did not stop typing on iOS and Android.

### Added

- **Grid spans and offsets**: `Grid.Item` (also exported as `GridItem`)
  covers `span` columns of the grid and leaves `offset` empty columns before
  it, each a number or a mobile-first map such as `{ base: 12, md: 8 }`. So a
  12-column Grid lays out 8 / 4 or 3 / 9 from a breakpoint and stacks on
  phones. A `span` map without `base` is the full row below its first
  breakpoint, as in Bootstrap, so `span={{ md: 8 }}` stacks on phones.
  `span="full"` covers every column, `span="auto"` sizes to the content;
  spans and offsets are clamped to the column count, and offsets mirror in
  right-to-left layouts. Grid also takes `rowGap`, `columnGap` and
  `alignItems`. It stays flex-wrap with percentage widths (not CSS grid), so
  web, iOS and Android lay out the same, and plain children keep their
  one-column cells: existing grids render the same markup.
- Docs: the Grid page has a playground, four new examples and a "From
  Bootstrap" table (`col-md-8` → `span={{ md: 8 }}`). Component
  metadata can carry reference `tables`.
- `useFieldControl`, for custom controls inside a Field.
- Select takes `aria-describedby`, `aria-required` and `accessibilityHint`, so
  a Field's help and error text describe it. A Radio Group in a Field is named
  by the label (`aria-labelledby`), and a Switch reports `aria-invalid`.

## [0.6.0] - 2026-09-29

`@advui/data`, `@advui/charts` and `@advui/editor` 0.5.0 were published by
mistake before this release. They need `@advui/core` and `@advui/icons` 0.6.0
and do not work; use 0.6.0 or later.

### Changed

- **Components ship in four packages**, so apps install only what they use:
  - `@advui/core`: general-purpose components, `UniversalProvider` and hooks
  - `@advui/data` (new): Table, Data Table, Data Grid, Tree View, Timeline,
    Stat and KPI Card
  - `@advui/charts` (new): Bar, Line, Area and Pie Chart
  - `@advui/editor` (new): Rich Text Editor and Rich Text Content

  Import these from their package (`import { DataTable } from '@advui/data'`).
  They were all added after 0.5.0, so no import from a published
  `@advui/core` changes. The new packages take `@advui/core` as a peer
  dependency (charts also take `@advui/data`, for the table view) and add no
  other libraries. CLI items (`advui add data-table`) keep their names, files
  and dependencies.

- `@advui/core` exports `isTextContent`, for components built on core.
- Repository: the docs catalog moved from `@advui/core/meta` to the private
  `@advui/catalog` package; `@advui/core/meta` (never published) keeps the
  metadata types and `defineMeta`.

### Fixed

- Docs: props and keyboard tables that overflow sideways can now take focus,
  so keyboard users can scroll them (axe `scrollable-region-focusable`).

### Added

- **Stat** (beta): one figure with its label, change and a note
  (`Stat.Label`, `Stat.Value`, `Stat.Delta`, `Stat.HelpText`). The delta's
  arrow is hidden from screen readers and its direction is read as words
  ("Increased by 12.5%", translatable with `trendLabel`); `tone` colors a
  drop as good news when it is.
- **KPI Card** (beta): a Card for one dashboard figure, with the change, a
  note, a decorative icon, a `loading` state (placeholders and `aria-busy`)
  and room for extra content such as a Progress bar.
- **List** (beta): rows with a leading visual, title, description and
  trailing meta, as a `list` of `listitem`s. With `onPress` a row is one
  button (Enter / Space on web); `divided`, `outline` and two sizes.
- **Timeline** (beta): events along a vertical line, with a dot or an icon
  marker in six tones, a time, a description and any extra content.
- **Image** (beta): a picture in a box of a set size or `ratio`, with a muted
  placeholder while loading and a fallback on error that keeps the `alt`
  name. `alt` is required; `alt=""` hides a decorative image on every
  platform.
- **Table** (beta): rows and columns with ARIA table roles on every platform
  (`Table.Header`, `Table.Body`, `Table.Footer`, `Table.Row`, `Table.Head`,
  `Table.Cell`). Named by `caption` or `aria-label`; `striped`, `outline`,
  two densities, `align` for numbers, and `minWidth` to scroll sideways on
  phones. A header with `sortDirection` is a sort button with `aria-sort`.
- **Pagination** (beta): previous and next buttons around the page numbers,
  with gaps that keep the item count steady (`getPaginationItems`). The
  current page has `aria-current="page"`; a `compact` variant reads
  "Page 3 of 10". Fits a phone by shrinking below the `xs` breakpoint.
- **Stepper** (beta): progress through a multi-step flow, horizontal or
  vertical (with the current step's content). Each step reads its number,
  title and status ("Step 1 of 3: Account, completed"); `onStepPress` makes
  reached steps buttons, and `status="error"` marks a failed step.
- **Data Table** (beta): a Table driven by `data` and `columns`, with
  sorting (ascending, descending, none), a search field that ignores case and
  accents, row selection with a page-wide checkbox, pagination, loading and
  empty states, and a polite status line ("1 selected · 1–5 of 7"). Each
  feature can be controlled for server-side data.
- **Tree View** (beta): a hierarchy that opens and closes, following the
  WAI-ARIA tree pattern (one Tab stop, arrow keys, Home / End, type-ahead).
  On native each item is a button that reports expanded and selected.
- **Navigation Menu** (beta): site navigation with links and buttons that
  open panels of links (the WAI-ARIA disclosure pattern, so links stay normal
  Tab stops). Escape, a press outside or following a link closes the panel.
  On iOS and Android the open panel shows under the bar, and the back button
  closes it.
- **Sidebar** (beta): app navigation with a header, labelled groups of links
  (icon, badge, `aria-current="page"`) and a footer. It collapses to an icon
  rail that keeps every name for screen readers; on phones it goes in a
  Drawer. `useSidebar()` exposes the collapsed state.
- **Search** (beta): a search field with a magnifier, a clear button, a
  loading spinner (`aria-busy`) and an optional `search` landmark. Enter runs
  `onSearch`; Escape clears on web.
- **Command Palette** (beta): a searchable list of actions in a dialog,
  opened with ⌘K / Ctrl+K on web (`hotkey`). Ranked, accent-insensitive
  matching on labels and keywords, grouped results, and a WAI-ARIA combobox
  with `aria-activedescendant` on web; buttons on native.
- **Image Gallery** (beta): a grid of named thumbnail buttons that open a
  viewer dialog with previous / next (and the arrow keys on web), a caption
  and a live "3 of 12".
- **Bar Chart**, **Line Chart**, **Area Chart** and **Pie Chart** (beta),
  drawn with SVG on web and react-native-svg on native. Each is a named
  `figure` with a legend (for two or more series), a tooltip on hover, tap or
  the arrow keys (read out by a live region on web, and as the plot's
  accessibility value on native), and a "Show table" view of the same data.
  Bars can be grouped, stacked or horizontal; lines break at missing values;
  areas can stack; pies fold small slices into "Other".
- **Chart colors** in the theme: `$chart1`–`$chart8`, a categorical palette in
  a fixed order that keeps neighboring series apart for color-blind readers,
  with its own steps for dark mode (in `@advui/theme` as `chartPalette`).
- **Resizable Panel** (beta): panels side by side or stacked (`Resizable`,
  `Resizable.Panel`, `Resizable.Handle`) with sizes in percent, limits and
  collapsible panels. Handles follow the WAI-ARIA window splitter (arrow
  keys, Home / End, Enter to collapse) on web and are adjustable elements
  on iOS and Android; drag with a mouse, pen or finger.
- **Data Grid** (beta): a spreadsheet-like grid on the WAI-ARIA grid pattern.
  Arrow keys, Home / End and Page Up / Down move between cells; Enter, F2
  or typing edits in place; `validate` rejects a value with a message in a
  live region. Number columns parse and right-align.
- **Video** (beta): the platform's own player in a fixed-ratio frame, with
  captions and a poster on web and an error message. On iOS and Android it
  uses the player registered with `setVideoView` (the Expo playground uses
  `expo-video`).
- **Audio Player** (beta): play / pause, a seek slider that reads "1:05 of
  3:20", skip buttons and a speed button, the same on every platform. Web
  uses `HTMLAudioElement`; native uses the engine registered with
  `setAudioEngine` (the Expo playground uses `expo-audio`).
- **Rich Text Editor** (beta): a Markdown editor with a WAI-ARIA toolbar
  (bold, italic, strikethrough, heading, lists, quote, link, code), ⌘B / ⌘I /
  ⌘K, a preview and a character count. **Rich Text Content** shows the
  Markdown with the same styles; only `http(s)` and `mailto` links are kept.
- Icons: grip, heading, link, numbered list, pause, play, quote, rotate,
  strikethrough and volume.
- **Loading Button** (beta): a Button for asynchronous actions. While
  `loading` it shows a spinner (or your own `spinner`) on the left or right
  in place of that side's icon, can swap the label for `loadingText`, sets
  `aria-busy` and ignores presses, clicks and keys, so an action cannot be
  submitted twice. The parent owns the `loading` state.
- **Form** (beta): lays out a form (optional title and description, the
  fields with a consistent `gap`, and a `footer` for actions), vertical or
  `horizontal`, and wires up submit: a `<form>` on web, where Enter in a field
  submits, and `Form.Submit` on every platform. `loading`, `loadingText` and
  `disabled` flow to `Form.Submit` and Form Field through context
  (`useFormStatus()` for your own controls); children are never cloned.
  Field state and validation stay with the app or a form library.
- Form Field is also disabled while the surrounding Form is `disabled`.

## [0.5.0] - 2026-09-28

### Added

- **OTP Input** (beta): a one-time-code field drawn as separate slots. It is
  one text box underneath, so pasting a code, SMS autofill (`one-time-code` /
  `sms-otp`) and screen readers work. Numeric or alphanumeric, with optional
  groups and `onComplete`.
- **Calendar** (beta): a month grid for a day or a range, with `min` / `max`,
  `isDateDisabled`, `weekStartsOn` and locale-aware names. On web it is a
  WAI-ARIA grid (arrow keys, Home / End, Page Up / Page Down); on native every
  day is a labelled button.
- **Date Picker** and **Date Range Picker** (beta): field-shaped buttons that
  open a Calendar in a popover, or a bottom sheet on phones, and close once
  the day or range is picked.
- **Time Picker** (beta): hour, minute and optional AM/PM selects in a group,
  producing a 24-hour `"HH:mm"` value.
- **Combobox** (beta): a select you can type in. The text filters the options
  (ignoring case and accents), and only an option can be picked. On web it
  is a WAI-ARIA combobox (focus stays in the text box, `aria-activedescendant`
  follows the arrow keys) with a listbox that floats in a portal and flips
  when there is no room; on phones it opens a searchable bottom sheet.
- **Autocomplete** (beta): a text field with suggestions, where any text is a
  valid value; picking a suggestion fills it in.
- **Multi Select** (beta): picks several options into chips, from a listbox
  that stays open (`aria-multiselectable`) on web or a sheet of checkbox rows
  on phones. Chips have named remove buttons, and Backspace removes the last.
- **File Upload** (beta): a button that opens the file picker, with the
  picked files listed below (named remove buttons). `accept`, `maxSize` and
  `maxFiles` are checked on every platform, and refused files are reported
  through `onReject`.
- **File Dropzone** (beta): a large area that takes dropped files on web and
  is one labelled button everywhere (Enter / Space or tap opens the picker).
- **`setFilePicker`**: registers the app's native file picker once (e.g.
  with `expo-document-picker`); web uses the browser's dialog. Core adds no
  file-picker dependency.

### Fixed

- Form Field: on iOS and Android its control had no accessible name, because
  a Label's `htmlFor` only moves focus there. The field now names the control
  with its label (when the label is text and the control has no `aria-label`).

## [0.4.0] - 2026-09-28

### Added

- **Form Field** (beta): a label, one control, help text and an error message
  wired together. The control gets the label's `id`, `invalid`, `disabled`
  and `aria-required`; help and error text describe it (`aria-describedby` on
  web, the accessibility hint on native).
- **Password Input** (beta): a password field with a show/hide toggle button
  (`aria-pressed`, fixed name), controlled or uncontrolled.
- **Number Input** (beta): a `spinbutton` field with − and + buttons, `min`,
  `max` and `step`. Arrow keys, Home and End step on web; screen readers get
  increment / decrement actions on native. Typed values clamp on blur.
- **Empty State** (beta): an icon, a heading, a short explanation and actions
  for empty lists, searches and pages, optionally with a dashed border.
- **Error State** (beta): Empty State's layout for a failed load, with an
  error icon, a default title and a retry button (`onRetry`, `retrying`). It
  is an `alert` on web.

### Fixed

- Input: text at `size="sm"` was clipped on Android, where `TextInput` adds
  its own vertical padding.

## [0.3.0] - 2026-09-28

### Added

- **Button Group** (beta): groups Buttons and IconButtons as a labelled
  `group`, joined into one control (square inner corners, shared borders) or
  spaced apart with `attached={false}`, in a row or a column. Buttons take the
  group's `variant` and `size` unless they set their own.
- **Collapsible** (beta): one trigger that shows and hides a section, with
  `aria-expanded` and `aria-controls` on the trigger. Closed content stays
  mounted, so text typed inside survives closing.
- **Circular Progress** (beta): a progress ring for tight spaces, with
  `progressbar` semantics, an optional percentage in the middle, four tones,
  and a spinning indeterminate state (slower with reduced motion).
- **Aspect Ratio** (beta): keeps images, video or maps at a fixed ratio as the
  width changes.
- **Scroll Area** (beta): a box that scrolls within a set size, with thin
  scrollbars in theme colors on web. It takes keyboard focus, and becomes a
  named region with `aria-label`.
- **Menu** (beta): an always-visible list of actions or destinations with
  icons, groups, trailing counts and a selected item (`value` /
  `onValueChange`). On web it is one Tab stop with arrow-key navigation; items
  are buttons, or links with `href` / `render`, and the selected one has
  `aria-current`.
- **Context Menu** (beta): actions for an area, opened with a right-click (or
  Shift+F10) on web and a long-press on touch screens. It has the same parts
  as Dropdown Menu; on iOS and Android it opens Dropdown Menu's bottom sheet,
  and screen readers reach it through the "long press" action.
- **Drawer** (beta): a modal panel that slides in from any edge (`side`), with
  three widths, a scrolling `Drawer.Body`, and Dialog's focus trap, Escape and
  labelling. On native its attached edges keep clear of the safe-area insets,
  and Android's back button closes it instead of leaving the screen.
- **Hover Card** (beta): a preview card for a link that opens on hover and on
  keyboard focus, stays open while the pointer moves into it, and describes
  the link while open. Touch screens show only the link.

### Changed

- Dropdown Menu: its web items and its native bottom sheet moved into shared
  modules (`menuParts.tsx`, `sheetMenu.tsx`) that Context Menu reuses. The API
  and the rendered output are unchanged.

### Fixed

- IconButton: square corners in every theme, because it passed
  `borderRadius={undefined}` to Button. It now uses the theme's button radius
  (`$button`), so icon buttons match buttons, including Material's pill shape.
- Android back button: with a Dialog, Alert Dialog, Sheet, Popover, Select,
  Dropdown Menu or Context Menu open, back left the screen and the overlay went
  with it, although the docs said back closes it. Back now closes the open
  overlay (Alert Dialog: cancels), innermost first, and the next press goes back
  as usual. Tamagui's overlays have no back handling, so each root calls a new
  internal hook, `useBackToClose`.

## [0.2.0] - 2026-09-27

### Added

- **Android press ripple**: with `androidRipple` in the config (on in
  `material()`), pressables show Android's native ripple from the touch point
  instead of a pressed color: Button, IconButton, Toggle, Toggle Group, Chip,
  FAB, Tabs, Navigation Bar (in the indicator's pill), Accordion, Android menu
  and Select rows, interactive Card, and Snackbar and toast actions. Web and
  iOS are unchanged. `useRipple()` adds it to your own pressables.

- **Floating Action Button** (beta, `Fab`): a screen's primary action. It has
  `soft` (Material's primary container), `primary`, `secondary` and `surface`
  variants, 40/56/96 sizes, an extended FAB with `label`, and `placement` to
  pin it to a corner.
- **Snackbar** (beta): a brief bottom message with one optional action such
  as Undo. It uses a persistent polite live region (announced on iOS with
  `AccessibilityInfo`), and its timer pauses on hover and focus and runs
  longer when there is an action. `duration={null}` keeps it open with a
  close button.
- **Chip** (beta): filter chips (toggle buttons with a check), input chips
  with a named remove button, and action chips.
- **Navigation Bar** (beta): 3–5 bottom destinations with Material's pill
  indicator and badges ("Inbox, 3 new"). It is a `nav` with `aria-current` on
  web and a tab bar with a selected state on iOS and Android.
- Theme: an `inversePrimary` role for primary-colored text on inverse
  surfaces, contrast-checked in every preset and in Material themes.
- **Material 3 theme** (`@advui/theme/material`): `material({ seed })` gives
  every component Google's Material 3 look with no component changes. It
  generates color roles from one seed color with Google's
  `material-color-utilities` (the tonal-spot scheme behind Android dynamic
  color), and adds Material's shapes (pill buttons, 4px fields, 12px cards,
  28px dialogs and sheets) and Roboto. The same WCAG AA contrast checks as the
  presets run for several seeds. It is a separate entry, so apps that don't
  import it don't ship the color library. The docs customizer has a
  **Style → Material 3** switch, and the Expo playground runs Material with
  `EXPO_PUBLIC_ADVUI_STYLE=material`.
- Theme: role radius tokens `$button`, `$buttonLg` and `$dialog` (buttons, icon
  buttons and toggles; dialogs and sheets). They keep today's values in every
  preset. `radius` also accepts exact values per token, and
  `createUniversalConfig` accepts prebuilt `themes`. Components copied with
  `advui add` need `@advui/theme` 0.2.0 or later for these tokens.
- **Accordion** (beta): single or multiple open sections, `default` and `card`
  variants, disabled items. Triggers sit in headings (`level`, default 3) and
  follow the WAI-ARIA accordion keyboard pattern (arrows, Home, End).
- **Slider** (beta): one value or a range, `sm`/`md`/`lg`, horizontal or
  vertical, `step`, `getValueText` and per-thumb labels. On iOS and Android
  thumbs have 44pt touch targets and respond to screen-reader
  increment/decrement gestures.
- **Popover** (beta): a non-modal dialog anchored to a trigger, named by
  `Popover.Title`, with `side`/`align`/`offset`. On phones and on native it
  opens as a bottom sheet.
- **Dropdown Menu** (beta): items with icons, shortcuts and destructive
  styling, checkbox and radio items, labels, groups and separators. On iOS and
  Android it opens as a bottom sheet of 48dp rows exposed as menu items,
  checkboxes and radios.
- **Alert Dialog** (beta): confirms important or destructive actions. An
  `alertdialog` named and described by its text, focus starts on Cancel, and
  presses outside are ignored; Escape cancels.
- **Sheet** (beta): a bottom sheet on web, iOS and Android, with fit or
  `snapPoints` heights and `Sheet.ScrollView`. On web it is a modal dialog with
  a focus trap and Escape; while closed its content is hidden from screen
  readers and the tab order.
- **Toggle** (beta): a two-state button (`aria-pressed` on web, a toggle
  button with a checked state on iOS and Android).
- **Toggle Group** (beta): `single` (a radio group) or `multiple` (toggle
  buttons), with one Tab stop and arrow-key navigation on web.
- **Breadcrumb** (beta): a `nav` landmark with an ordered list, the current
  page marked, `render` for router links, and `maxItems` to collapse deep
  paths behind a “Show N more” button.
- Icons: `align-left`, `align-center`, `align-right`, `bold`, `italic`,
  `underline`, `folder`, `layout-grid` and `list` (65 icons in total).
- Registry: a `utils` item for shared helpers. `build-registry` now fails if a
  component imports a file that no registry item ships.
- e2e: axe checks for the new component pages, and open-state tests for Popover,
  Dropdown Menu, Alert Dialog, Sheet and Toggle Group.

### Fixed

- Toast: pressing the action button no longer turns it gray (Tamagui's
  default pressed color); it darkens like a primary button. The dismiss
  button has a visible focus ring.
- Avatar on iOS and Android: every size rendered at 40pt, because Tamagui's
  Avatar reads its own `size` prop as a size token. Sizes are now passed as
  tokens (xs 24 → xl 64).
- Button, Badge, Tabs: children made of several text pieces (for example
  `Status ({count})`) crashed on iOS and Android with "Text strings must be
  rendered within a \<Text\> component". They are now wrapped in `Text`.
- Popover, Select and Dropdown Menu: their phone bottom sheets now use the same
  corner radius as Sheet (`$dialog`).
- Dropdown Menu on iOS and Android: the closed menu's rows could be reached by
  screen readers, because the sheet stays mounted while closed. They are now
  hidden until it opens.
- Docs: the four components added since 0.1.0 said “Since v0.1.0”; they
  first ship in 0.2.0.
- Toasts logged “React does not recognize the `accessibilityLabel` prop” in
  development: `@tamagui/toast` 2.7.7 passes that React Native prop to a DOM
  element. This repo now carries a `pnpm patch` (`patches/`) that passes it as
  `aria-label` instead. Apps installing `@advui/core` still see the dev-only
  warning until Tamagui fixes it upstream.
- Docs: the Login example collapsed to a thin strip in the Desktop frame. An
  e2e test now checks that no app example is clipped there.

## [0.1.0] - 2026-09-26

First release of **Adv UI**. Repository: https://github.com/zinmin232/advui.

### Added

- **Components** (`@advui/core`): Button, IconButton, Input, Textarea,
  Label, Checkbox, Radio Group, Switch, Select (beta), Card, Badge, Avatar,
  Separator, Dialog, Toast (beta), Tabs, Tooltip, Alert, Progress, Spinner,
  Skeleton, Typography (Text, Heading, Kbd), Stack (Box, Stack, HStack, VStack,
  Center, Spacer), Grid, Container.
- `UniversalProvider` with color mode (`light`/`dark`/`system`), an icon
  registry, a built-in toaster and safe-area `insets` passthrough.
  `useColorMode`, `useControllableState` and `useReducedMotion` hooks.
- **Theme** (`@advui/theme`): `createUniversalConfig` with 10 presets,
  any brand color (OKLCH scale generation), WCAG AA contrast enforcement,
  global radius and font scale, media queries, shadows and z-index layers.
- **Icons** (`@advui/icons`): 56 Lucide icons for web (SVG) and native
  (react-native-svg), with `IconDefaults` for size and color.
- **Utils** (`@advui/utils`): color parsing, OKLCH, contrast and event
  helpers.
- **CLI** (`advui`): `init`, `add` and `list`, backed by a generated
  registry. `list` works before `init` by reading the published registry.
- **Docs site**, published at https://zinmin232.github.io/advui/: component
  pages with live previews, API tables, accessibility and platform notes; a
  playground; a theme customizer; ⌘K search; app examples; and the component
  registry at `/r`. The sidebar has collapsible sections, a guide line with
  category markers, an accent bar on the current page and status badges.
- **Expo playground**: every component, seven app screens and runtime theme
  switching. Runs in Expo Go.
- **Tooling**: `create-component` generator, `rename` script, catalog
  validation, release scripts, Vitest, jest-expo, Playwright e2e with axe, and
  visual regression on Windows and Linux (CI).

### Fixed during pre-release verification

- Toasts were drawn beneath the screen on Android, because the portal zIndex
  overflowed 32 bits.
- Tabs showed no active indicator on native.
- Inputs crashed on Android when given animated border styles.
- On the web, the input icons in the examples and the example badges were
  positioned against the page instead of their own container.
