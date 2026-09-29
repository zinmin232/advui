# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the packages
follow [Semantic Versioning](https://semver.org). All published packages share
one version.

## [Unreleased]

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
