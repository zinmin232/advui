# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the packages
follow [Semantic Versioning](https://semver.org). All published packages share
one version.

## [Unreleased]

### Breaking: Tamagui 3

Adv UI now runs on Tamagui 3 (`tamagui` `^3.0.18` as the peer dependency).
Install it with Adv UI, and update your own styles as below; Tamagui's
`@tamagui/codemod-flat-values` converts most of them.

- **Tokens and theme keys have no `$` prefix**: `padding="4"`,
  `color="mutedForeground"`, `borderRadius="lg"`. Half steps are named with a
  hyphen: `0-5`, `1-5`, `2-5`, `3-5` (and `-0-5` for margins). The `true`
  space, size and radius tokens and the `transparent` color token are gone
  (Tamagui 3 reserves those names; `transparent` still works as CSS).
- **States and breakpoints are flat values**: `hoverStyle`, `pressStyle`,
  `focusVisibleStyle`, `enterStyle`, `exitStyle` and media props such as
  `$md={{ … }}` become clauses in the value, `backgroundColor="muted hover:accent"`,
  `padding="4 md:6"`, or the object form `{ default: 1, enter: 0 }`.
- **A plain style prop now holds at every breakpoint.** A component's own
  breakpoint styles used to win over it: `<Card.Content padding="3">` was 12px
  on phones and Card's 24px from `sm`. It is now 12px everywhere; write
  `padding="3 sm:6"` to keep the old result.
- **Tamagui's own theme keys are kebab-case** and the neutral ramp has 11 steps:
  `background-hover`, `border-color`, `placeholder-color`, `shadow-color`,
  `color-1`…`color-11` (Tamagui's mapping: `color7` merges into `color-6`, and
  `color8`–`color12` become `color-7`–`color-11`). Adv UI's semantic keys
  (`primary`, `mutedForeground`…) keep their names. Hand-made `themes` passed to
  `createUniversalConfig` need the new names.
- **`responsiveStyle`** returns a conditional value (`{ flexDirection: { default:
'column', md: 'row' } }`) instead of `$md` objects, and
  `gridCellLayout` and `sectionPadding` do the same.
- **Stack**: where a raw style prop and `direction` (or `align`…) both set the
  same breakpoint, the prop written later wins; at the base the raw prop still
  wins in either order. A raw value equal to the stack's own default now counts.
- **Toaster** loses `offset`, which Tamagui 3's toaster no longer takes.
- **Select.Item** takes no `index`: Tamagui 3 tracks the item order itself.
- **Types**: add `"customConditions": ["react-native-legacy-deep-imports"]` to
  your tsconfig if you type press or layout handlers with React Native's
  `GestureResponderEvent` or `LayoutChangeEvent`: it gives Tamagui 3's
  props the same event types.

### Fixed with Tamagui 3

- **A press that slides off is cancelled on iOS and Android.** A finger that
  landed on a Button, FAB, Accordion trigger, List Item row or any other
  pressable and slid off before lifting still pressed it. Tamagui 3 hands
  presses to React Native's Pressability, which cancels them outside the view.
- **Toasts** need no patched `@tamagui/toast` for their label on web.

Tamagui 3 variants hold styles only, so two variants are now set by the
component itself and still work on iOS and Android: Text's `truncate` (one
line with an ellipsis) and Card's `elevated` shadow (Android `elevation`).

### Added

- **Field** `requiredText` and **Calendar** `todayLabel`: the words iOS and
  Android read for a required field ("Email, required") and for today
  ("Tuesday, March 3, 2026, today"), where there is no required state or
  `aria-current`. They default to "required" and "today".
- **Slider** takes a Field's label, help text, error and disabled state like
  the other form controls, a `<Label htmlFor>` names it on iOS and Android,
  and `invalid` draws its thumbs in the error color (`aria-invalid` on web).
- **Link**: a text link to another page, a section or an outside site,
  inside a sentence (nested in Text, it takes the text's size and font) or
  on its own (`size`, `weight`). On web it renders a real `<a href>`, or a
  `<button>` with the `link` role when there is only `onPress`; `render`
  takes your router's link. On iOS and Android an absolute `href`
  (`https:`, `mailto:`, `tel:`) opens with `Linking.openURL` after `onPress`,
  unless `onPress` calls `event.preventDefault()`; a path needs `onPress`.
  `external` adds an icon and, on web, opens a new tab with
  `rel="noopener noreferrer"` and ends the name with "(opens in a new tab)"
  (`labels.external` translates it). `tone` (`primary`, `muted`, `inherit`)
  and `underline` (`always` by default, `hover`, `none`).
- **Input slots** (the roadmap's Input Group): `leading` and `trailing` put
  an icon, a small button or short text ("$", "kg") inside the field, and
  `leadingAddon` and `trailingAddon` join shaded boxes to it ("https://",
  ".com"). Icons and buttons sit in a square the height of the field. With
  slots, the focus ring and the invalid and disabled styles cover the whole
  box, layout and box props (`width`, `margin`, `flex`, `backgroundColor`,
  `border*`) apply to the box, and pressing an icon or addon focuses the
  field. Slot and addon text is read with the field: in its description on
  web (`aria-describedby`, after any help text), in its hint on iOS and
  Android. An Input without slots renders exactly as before. Pass `null` for
  a slot that is empty for now, so the field is not re-created while typing.
- **Checkbox Group**: checkboxes that share one value, the list of checked
  options (`value`, `defaultValue`, `onValueChange`). `CheckboxGroup.Item`
  takes a `label` and a `description`, or none for your own layout.
  `CheckboxGroup.SelectAll` checks or clears every enabled item and is mixed
  while only some are checked. `orientation` (`vertical`, or `horizontal` in a
  row that wraps), `size`, `disabled` and `invalid` apply to every item, and
  on web each checked item submits its value under the group's `name`. It is
  a `role="group"`; inside a Field the field's label names it and the error
  marks every box invalid. On iOS and Android, where screen readers have no
  group names, each item reads the group's name and help text as its hint.
- **Radio Group**: `RadioGroup.Item` takes a `label` and a `description`,
  like Checkbox Group's items. The label names the radio on every platform
  (a `Label htmlFor` only moves focus on iOS and Android), pressing it
  selects the item, and the description is linked as its description on web
  and read as its hint on iOS and Android. Items without them render as
  before.
- **Tags Input**: a text field that turns what you type into tags (`value`,
  `defaultValue`, `onValueChange`). Enter or a separator (`separators`,
  a comma by default) adds the typed text, a pasted list adds every part,
  and Backspace in the empty text box removes the last tag. Each tag is a
  Chip with a named remove button. `max`, `allowDuplicates` and `validate`
  refuse tags, which then stay in the text box to be fixed; `addOnBlur` (on
  by default) keeps half-typed text from being lost when a form is
  submitted. Added and removed tags are announced to screen readers, and
  `labels` translates the button names and announcements. It takes a
  Field's label, help and error like Input, `size` matches Input's heights,
  and on web each tag submits under the field's `name`. A placeholder too
  long for the text box stays on one line and ends in "…" on iOS and
  Android, as Android would otherwise wrap it onto a cut-off second line.
- **Carousel**: a row of slides shown one or a few at a time
  (`slidesPerView`, a number or a mobile-first map; a fraction such as 1.2
  shows part of the next slide), with previous and next buttons, a dot per
  stop, and swipes: CSS scroll snap on web (touch, trackpads, the scroll
  wheel) and a snapping ScrollView on iOS and Android, one slide per swipe.
  `index`, `defaultIndex` and `onIndexChange` control it, `loop` wraps at
  the ends, `gap` spaces the slides, and `showArrows` and `showDots` hide
  the controls. `autoplay` (`true` for 5 seconds, or a delay in ms) adds a
  pause button, waits while the pointer, focus or a finger is on the
  carousel, and starts paused for users who ask for less motion. It follows
  the WAI-ARIA carousel pattern on web (a named region of named slides, the
  arrow keys, Home and End on the slide area), announces the new slide after
  a user moves it, and `labels` translates every name and announcement.
- **Rating**: a row of stars, or any `icon`, to give a score (`value`,
  `defaultValue`, `onValueChange`, from 0 to `count`, 5 by default) or to
  show one with `readOnly`, where a fraction part-fills an icon (4.3 fills
  30% of the fifth). `allowHalf` gives each half of an icon its own value.
  It is a slider, as in the WAI-ARIA rating slider example: the arrow keys
  step (swapped in RTL), Home clears and End picks the top score, VoiceOver
  and TalkBack adjust it with swipes, and `getValueText` sets what they read
  ("3 of 5" by default). A read-only rating is an image named by its value.
  On web hovering previews a value. `size` (16, 24 or 32px icons), `color`
  (amber with a darker outline by default) and `emptyColor`; it takes a
  Field's label, help and error, and on web it submits under `name`.
- **Icons** (`@advui/icons`): a `fill` prop paints the inside of an icon, as
  in Lucide: a theme token or any color. Icons stay outlines without it.
  Rating needs it, so a Rating copied from the registry needs `@advui/icons`
  0.14.0.
- **Color Picker**: a field that shows the color and opens a picker in a
  popover (a bottom sheet on phones), or the picker itself with `inline`.
  Drag over the saturation and brightness area, slide the hue and, with
  `alpha`, the opacity over a transparency grid, type hex (with or without
  `#`), `rgb()` or `hsl()`, press one of the `swatches`, or, in Chrome and
  Edge, pick from the screen with the eyedropper. `onValueChange` follows
  every drag with a lowercase `#rrggbb` (`#rrggbbaa` when translucent), and
  `onValueCommit` fires once a drag, key, swatch or typed color is done. The
  hue of a gray is kept, so desaturating and saturating again brings the
  color back. The area is one slider with `aria-roledescription="2D slider"`
  (left and right change saturation, up and down brightness), hue and
  opacity are sliders, and swatches are toggle buttons with a check mark;
  on iOS and Android they are adjustable with swipes, the area's saturation
  is in the actions menu, and a drag keeps the touch from the sheet. It takes
  a Field's label, help and error, on web it submits under `name`, and
  `labels` translates every name and value text.
- **Icons**: `PipetteIcon`.
- **Color utilities** (`@advui/utils`): `toHsv` and `fromHsv`.
- **Copy Button**: copies a `value` and confirms it: the icon turns into a
  check for `timeout` ms (2 seconds) and screen readers hear "Copied" (a
  polite live region on web, `announceForAccessibility` on iOS and
  Android), or "Couldn't copy" when the clipboard refuses. Without children
  it is an icon button named "Copy" with the result in its tooltip; with
  children it is a Button whose label shows the result, keeping the
  button's width so the buttons beside it stay put. `onCopy`,
  `onCopyError`, Button's `variant`, `size` and `disabled`, and `labels`
  for translation. On web it uses the Clipboard API, with a fallback for
  pages not served over HTTPS. iOS and Android need the app's clipboard,
  registered once with `setClipboard` (e.g. `expo-clipboard`);
  `useClipboard` (`copy`, `status`) and `writeClipboard` build your own
  copy controls.
- **Code Block**: code or a command in a monospace block on `$muted` with a
  Copy Button. `title` and `language` add a header; `lineNumbers` (from
  `firstLineNumber`), `highlightLines` (a tint and a bar), `wrap` for long
  lines (they scroll sideways by default) and `maxHeight`. `tokens` takes
  the code as colored tokens from a highlighter such as Shiki, so it stays
  free of highlighting dependencies. On web it is a focusable
  `<pre><code>` group named by its title; line numbers are not selected or
  read, and a selection copies the code as written.
- **Menubar**: a bar of menus that stays on screen, as at the top of a
  desktop app. Each `Menubar.Menu` holds a `Menubar.Trigger` and a
  `Menubar.Content` with Dropdown Menu's items (`Item`, `CheckboxItem`,
  `RadioGroup`, `Label`, `Separator`, `Group`). One menu is open at a time;
  `value`, `defaultValue` and `onValueChange` give the open menu's `value`,
  or null. On web it follows the WAI-ARIA menubar pattern: the bar is one
  Tab stop, the arrow keys move between triggers and, in an open menu, to
  the previous or next menu, and focus goes back to the trigger after a
  choice or Escape. With a menu open, pointing at another trigger opens its
  menu. On iOS and Android the triggers are buttons and each menu opens as a
  bottom sheet that the Android back gesture closes.

### Changed

- Stable after the Android phone check: Form, Wrap, Show / Hide, Section,
  Sticky, AppShell, AutoGrid, Copy Button, Code Block, Menubar, Link,
  Checkbox Group, Tags Input, Carousel, Rating and Color Picker. Rich Text
  Editor stays beta until its editor is decided.
- Stable after the Android phone check of the overlays: Alert Dialog,
  Confirm Dialog, Drawer, Sheet, Popover, Hover Card, Menu, Context Menu,
  Dropdown Menu, Toast and Snackbar.
- Stable after the Android phone check of the form controls: Field, Password
  Input, Number Input, OTP Input, Select, Multi Select, Combobox,
  Autocomplete, Slider, Toggle, Toggle Group, File Upload, File Dropzone,
  Time Picker, Calendar, Date Picker and Date Range Picker.
- Stable after the Android phone check of the navigation and layout
  components: Breadcrumb, Button Group, Toolbar, Navigation Bar, FAB,
  Accordion, Collapsible, Scroll Area, Aspect Ratio and List Item.
- **FAB** `size="sm"` on iOS and Android takes touches 2 points around it,
  so it is 44 high to a finger, like a small Button.
- **Label** on iOS and Android also names a control that points at it with
  `aria-labelledby` (its `id`), which iOS ignores and Android reads
  unreliably.
- **UniversalProvider** on iOS and Android wraps the app in a view that fills
  the screen, so it can hide the app from screen readers behind an open
  overlay (see Fixed).
- **Password Input** and **Search** are built on Input's slots instead of
  positioning their buttons and icon over the field. They behave as before;
  the text and buttons sit a few pixels differently, and Password Input
  accepts `leading` and the addons.
- **Radio Group** on iOS and Android: each item reads the group's name and
  help text (a Field's label, help and error, or the group's `aria-label`)
  as its hint, after its own description. Screen readers there do not
  announce group names, so inside a Field the group's label was never read.
  Items also get a generated `id` when you give none.

### Fixed

- **Disabled controls** on iOS and Android take touches, so TalkBack finds
  them by touch and reads them as disabled: Button, Toggle, FAB, Chip,
  Checkbox, Switch, Radio Group, Select and the date pickers' triggers. Their
  disabled style blocked touches (`pointerEvents: 'none'`), which left them
  reachable only by swiping; it is web only now, and Tamagui gives a disabled
  view no press handlers.
- **Chip**: after a remove button removes its chip, focus moves to the next
  input chip in the row, or the previous one after the last, on every
  platform. TalkBack started again from the top of the screen. Tags Input's
  tags do the same on iOS and Android.
- **Copy Button** on Android 13 and later: "Copied" is read once. The system
  confirms every copy itself, and TalkBack reads it, so only a failure is
  announced there.
- **Carousel** on iOS and Android: after a move TalkBack reads "Slide 2 of
  4", not every dot as well. The current dot says "current" in its name
  (new `labels.current`) instead of a selected state, which made TalkBack
  read the row whenever it moved.
- **Audio Player** on iOS and Android: TalkBack reaches its skip and speed
  buttons by touch. The frame was named by the title, and TalkBack made it
  one stop that caught touches meant for the buttons inside.
- **Tabs** on Android: TalkBack reads a disabled tab as a disabled tab, and
  reads a panel's content once. Tamagui sets a tab's disabled state on web
  only, so a disabled tab was plain text; and the panel took a tab stop,
  which made it a focusable view named after its own text.
- **Circular Progress** and **Progress** on Android: TalkBack reads the
  value ("Storage used, 82%"). Android reads a value only as text: the
  minimum, maximum and current value became range info, which TalkBack reads
  for its own progress bar class but not for the view a `progressbar` role
  gets, so it heard only the name.
- **Empty State** and **Loading State** with `bordered`, and **File
  Dropzone**, on Android: the border is dashed. Android dashes a rounded
  border only when it has `borderWidth` and `borderColor` for all sides, and
  Tamagui splits both into per-side props, so it was drawn solid.
- **Select** at `size="sm"`: the trigger is 32px tall, like the other small
  fields. Tamagui's trigger kept its own 40px minimum height, so it was
  taller than a small Input or Date Picker beside it (Filter Bar's compact
  example, Time Picker at `sm`) and grew from 32 to 40 when the page
  hydrated.
- **Multi Select**, **Combobox** and **Autocomplete** on iOS and Android:
  the placeholder or value is centered in the field. Yoga starts wrapping
  lines at the top, so text shorter than the field sat above the middle.
- **Toolbar** on iOS and Android: a `center` that grows (a search field
  with `flex={1}`) takes only the space beside `leading` and `trailing`.
  Yoga sized it at the whole bar, so a title in `leading` shrank to a
  letter or two a line. A bar with `wrap` lays out as before.
- **Accordion** on iOS and Android: a disabled item's trigger reads as
  disabled (Tamagui set the state on web only). An open section is no longer
  a region named by its trigger there: React Native labels a view with a
  role and no name with its children's text, so TalkBack could read the
  section twice. On web it stays a region.
- **Scroll Area** on iOS and Android: `aria-label` names the scroll view.
  React Native's ScrollView drops `aria-label`, so it had no name.
- **Navigation Bar** on iOS and Android: items take the `activate` action,
  as Toggle Group's do. Android does not mark tab views clickable, so a
  screen reader's double-tap arrives as that action.
- **OTP Input** on Android: TalkBack reaches the field. Its hidden text box
  had an opacity of 0, and Android leaves such views out of the
  accessibility tree, so the code could not be entered with a screen reader.
- **Select** on iOS and Android: the trigger and the options in its sheet are
  reachable and work with a double-tap (they reacted to touches only), and
  the trigger reads the chosen option, or the placeholder, as its value
  ("Plan, Team"). Time Picker's selects too.
- **Multi Select**, **Combobox** and **Autocomplete** on iOS and Android: the
  field reads its picks as its value ("Labels, Bug, Docs" instead of "2
  selected"), or its placeholder while empty, and an option's description is
  part of its name ("Yangon, UTC+06:30"), as on web.
- **Slider** on iOS and Android: one named with `aria-labelledby` read only
  its value ("40%").
- **Time Picker** on iOS and Android: each select's name starts with the
  field's label ("Start time, Hour"), and the hour select reads the field's
  help text. Screen readers there do not read group names, so the label was
  never heard.
- **Field** on iOS and Android: a required field says so in its name (see
  `requiredText`). **Calendar** says which day is today (see `todayLabel`).
- The `setFilePicker` example (getting-started guide, File Upload's usage
  and the Expo playground): an `accept` with an extension, such as
  `image/*,.pdf`, opens the picker unfiltered. It filtered by the MIME types
  alone, so File Dropzone's PDFs could not be picked.
- **Dialog**, **Alert Dialog**, **Confirm Dialog**, **Drawer**, **Sheet** and
  every overlay that opens a sheet (Dropdown Menu, Menubar, Context Menu,
  Select, Popover, Combobox, the pickers) on iOS and Android: while one is
  open, the screen behind it is hidden from TalkBack and VoiceOver, so they
  stay in the overlay. They could move on to the page under it, as overlays
  render in a portal beside the app. Navigation Menu's panel, which opens in
  place, leaves the screen readable.
- **Dialog** and **Drawer** on iOS and Android: a press on the overlay
  closes them, as on web and as their docs say. Tamagui closes a dialog from
  an outside press on web only. Alert Dialog still needs a choice.
- **Sheet** and **Popover** (and Date Picker, Date Range Picker and Color
  Picker) on iOS and Android: the sheet rises above the keyboard, so a
  focused field near the bottom stays in view.
- **Toaster** on iOS and Android: TalkBack reaches the toasts and their
  buttons (Undo, Dismiss). They sat outside their region's bounds, which
  Android reports as off-screen. The region is named "Notifications", without
  the web keyboard shortcut ("alt+T").
- **Radio Group** spaces its items 12px apart (`gap="$3"`), as intended.
  The gap was set on a frame that Tamagui's radio group does not render, so
  items sat flush unless you passed `gap`.
- **Popover** (and Date Picker, Date Range Picker and Color Picker, which
  open one) on web: focus goes back to the trigger when it closes, also
  after an open from the keyboard alone. It fell to the page body:
  Tamagui's trigger learns its element from pointer and focus events, and
  with `asChild` its focus handler never ran, so keyboard users lost their
  place on Escape, `Popover.Close` or a picked date.
- **Tooltip** on web: the trigger no longer has `aria-expanded`, so screen
  readers stop reading every button with a tooltip as "collapsed" (or
  "expanded" while the tooltip shows). Tamagui's tooltip trigger is a popover
  trigger and set it; Hover Card already removed it the same way.
- **Checkbox** on iOS and Android: a disabled checkbox reads as disabled
  (Tamagui set the state on web only), and a checkbox that leaves the mixed
  state, such as Checkbox Group's Select All, no longer goes on saying
  "mixed" to TalkBack once it is checked or cleared.
- **Label** on iOS and Android: a Label with `htmlFor` names the control
  with that id, such as a Switch, Checkbox or Input beside it, unless the
  control has its own `aria-label`; the Label is then hidden from screen
  readers so the name is not read twice. `htmlFor` only moved focus there,
  so TalkBack read the Switch example's switches as "switch" with no name.
  Your own controls get this by calling `useFieldControl`.
- **Switch** on iOS and Android: screen readers hear whether it is on and
  whether it is disabled. Tamagui's switch sends neither state on native,
  so TalkBack read only "switch"; the value is now held by Switch itself.
- **Radio Group** on iOS and Android: the items of a disabled group, and a
  disabled item, read as disabled (Tamagui set the state on web only).
- **Chip**: a disabled input chip's remove button reads as disabled and
  shows no hover or press color. It already did nothing when pressed. Tags
  Input's remove buttons in a disabled field read the same way.
- **Password Input** on iOS and Android: the show/hide button is a toggle
  button that reads as checked while the password shows. React Native has
  no `aria-pressed`, so its state was never announced.
- **Dropdown Menu**, **Menubar**, **Select** and **Popover** (and Date
  Picker, Date Range Picker and Color Picker, which open one) on iOS and
  Android: a sheet taller than the screen allows (a long list, or a
  calendar on a phone in landscape) stops below the status bar and scrolls
  its content. Tamagui grows a sheet that fits its content up to the whole
  screen, so its top edge and handle went under the status bar.
- **Checkbox Group** and **Radio Group** on iOS and Android: pressing a
  disabled item's label no longer logs "No input found" in development.
- **Color Picker** on iOS and Android: the picker sheet closes after a
  vertical drag in the color area. Tamagui's Sheet took the drag as its
  own, though the area kept it, and then stayed on screen without its
  backdrop.

## [0.13.0] - 2026-10-15

### Added

- **Filter Bar** (`@advui/data`): search, filter controls built from
  definitions, active-filter chips, a count, and Apply and Reset, above a
  table, list or dashboard. Each filter is a labelled Field around a core
  control: `select` (Select, with an "All" option that unsets it),
  `multi-select` (Multi Select), `boolean` (All, Yes, No: `false` stays apart
  from unset), `date` (Date Picker), `date-range` (Date Range Picker; a range
  that ends before it starts is marked invalid, never swapped), `text`
  (Input) or `custom` (any control, with a typed value and its own chip
  text). Option values go into the state as given, numbers included. The
  state is one object (`value` / `defaultValue` / `onValueChange`): a missing
  key reads as the filter's `defaultValue`, unset is always `null`, the search
  text sits under `searchKey`, and keys that are not filters are passed back
  untouched. `showApplyButton` keeps edits in a draft until Apply
  (`onApply`); Reset (`onReset`) and chip removal go back to the defaults and
  apply at once. `collapsible` puts filters marked `advanced` behind a "More
  filters" button that counts the active ones. `layout` (`horizontal`,
  `vertical`, `responsive`), `size`, `variant` (`default`, `outline`,
  `filled`, `ghost`), `showLabels`, `leading` / `trailing`, `locale` and
  `labels` for translation; style props override the variant. Filter Bar
  never fetches or filters data itself.
- **Toolbar**: a row or column of related controls (actions, filters,
  formatting). Controls go in as children, unwrapped, or in `leading`,
  `center` and `trailing` regions: the center takes the free space, else
  trailing does and keeps its content at the end edge; a region left out
  adds no box. `Toolbar.Group` keeps related controls together and
  `Toolbar.Separator` (a decorative Separator) divides them, both following
  the toolbar's `orientation`. `variant` (`default`, `outline`, `filled`,
  `ghost`) and `size` (`sm`, `md`, `lg`) style the container only, never the
  controls; `align` and `distribute` take Stack's values and breakpoint maps,
  and `wrap` moves controls and regions onto new lines on narrow screens.
  Style props such as `padding`, `gap`, `backgroundColor` and `borderRadius`
  override the variant and size. By default it is a named `group`;
  `role="toolbar"` makes it the WAI-ARIA toolbar on web: one Tab stop, with
  the arrow keys, Home and End moving between enabled controls, while text
  fields, selects and sliders keep their own Tab stop and arrow keys.
- **List Item**: one row of content, on its own or as `List.Item` (the same
  component). `leading`, `title`, `description`, `trailing` and custom
  children, plus `actions`: buttons beside the pressable row that keep their
  own presses. `selected` marks the current item (`aria-current`) with a fill
  and an edge bar; `selectable` with `onSelectedChange` makes a toggle button
  (`aria-pressed`, "checked" on native) whose state the parent can control.
  `href` makes a link on web. `variant` (`plain`, `filled`, `outline`), `size`
  (`sm`, `md`, `lg`), `divider` and `color`; padding and gap go to the
  pressable row, and other style props such as `backgroundColor` and
  `borderRadius` override the variant.
- **Confirm Dialog**: asks the user to confirm one action, in one element:
  `title`, `description`, `confirmLabel`, `cancelLabel`, `tone`
  (`destructive` for the confirm button), an optional `trigger`, and
  `onConfirm` / `onCancel`. When `onConfirm` returns a Promise, the dialog
  stays open with a busy confirm button until it resolves, and stays open if
  it rejects so the user can retry; Escape and the Android back button wait
  for it too. Built on Alert Dialog, which remains the way to compose a
  confirmation with more content.
- **Loading State**: shown in place of content while it loads, with a
  spinner, a title, a description and optional actions such as Cancel. It
  lays out like Empty State and Error State, so the three can swap in place.
  `delay` keeps fast loads from flashing a spinner. On web the text is a
  polite `status` region.
- **Alert** does what a callout needs, without breaking existing alerts:
  `title`, `description` and `actions` props; `size` (`sm`, `md`, `lg`);
  a `destructive` variant (a solid fill, announced as an alert);
  `dismissible` with `onDismiss`, `dismissLabel` and an optional controlled
  `open`; and `color` for the title, description and icons. Style props
  such as `backgroundColor`, `borderRadius`, `padding` and `borderWidth`
  override the variant and size. On iOS and Android, an alert with actions or
  a dismiss button keeps its text as one accessible element and each button
  as its own.
- The docs playground can switch element props on and off, such as an
  Alert's icon and actions.

### Changed

- **Toggle Group** inside a Toolbar with `role="toolbar"` leaves its Tab
  stop and arrow keys to the toolbar, so the arrow keys move out of the
  group to the next control. There they move focus without choosing; Space
  or Enter chooses. Toggle Groups anywhere else are unchanged.
- `List.Item` is now `ListItem`, so it gains every List Item prop. Existing
  lists look and behave the same. A `List.Item` rendered outside a `List`
  no longer has the `listitem` role, which is invalid outside a list.
  `List` accepts `size="lg"`.
- `Alert.Title` and `Alert.Description` no longer take a `variant` prop. It
  was undocumented: the alert sets their color, now through `color`.

### Fixed

- **Date Picker** and **Date Range Picker**: the placeholder of an empty
  field ("Pick a date") is drawn in `$mutedForeground` instead of
  `$placeholderColor`. It is text in a button, not an input's placeholder,
  and failed the 4.5:1 contrast check (3.8:1 in the default theme).
- **Date Range Picker**: a server-rendered field with a range no longer fails
  hydration. Node's ICU puts thin spaces around the dash ("Oct 1 – 14, 2026")
  and Chrome's does not, so React threw the server text away and rendered the
  tree again. The field now shows plain spaces in place of thin and narrow
  no-break ones, through **`plainSpaces(text)`**, a new `@advui/core` export
  that Filter Bar's chips use too.

## [0.12.0] - 2026-10-06

### Added

- **`ariaState(on)`** in `@advui/core`, for components built on core: a
  boolean `aria-disabled`, `aria-busy` or `aria-selected` that is left out
  when off on web and sent as `false` on iOS and Android.
- **Metadata on npm.** Every component package publishes the metadata of its
  components as `components` at `<package>/meta`: `@advui/core/meta`,
  `@advui/data/meta`, `@advui/charts/meta` and `@advui/editor/meta`. Core's
  entry also exports the `ComponentMeta` types, `categories` and
  `defineMeta`. Tools such as the AdvUI Builder can import it instead of
  reading the repository at a git tag. It is a separate entry point, so apps
  that don't import it don't bundle it; core's installed size grows by about
  1 MB.
- **Video `crossOrigin`** (`'anonymous'` or `'use-credentials'`, web): browsers
  only load caption files from another origin when the video is fetched with
  CORS.
- Docs: a **Form playground** (title, description, direction, gap, loading,
  disabled, full width), also on the Playground page. Text props in every
  playground now appear in the generated JSX even when unchanged.

### Changed

- **Combobox, Autocomplete and Multi Select open on a click or tap** on web,
  as a select does; before, only typing or ArrowDown opened the list. Tab
  focus still leaves it closed, and removing a Multi Select chip does not open
  it. The chevron still toggles it.
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
- **BarChart, LineChart and AreaChart** are generic over the row type, like
  DataTable: `data` is `T[]` (any object type), and `index` and each series
  `key` must be fields of `T`. Rows typed with an `interface` now compile
  (they failed with "Index signature for type 'string' is missing"), and a
  misspelled `index` or series key is a type error. Rows typed as
  `Record<string, unknown>` take any field name, as before. A `series` array
  declared apart from the chart needs `as const` (or a
  `BarChartProps<Row>['series']` annotation) so its keys stay literal; a plain
  `{ key: string }[]` no longer type-checks against typed rows.

- Stable after the Android phone check: Stat, KPI Card, List, Timeline,
  Image, Table, Pagination, Stepper, Data Table, Tree View, Navigation Menu,
  Sidebar, Search, Command Palette, Image Gallery, Bar / Line / Area / Pie
  Chart, Resizable Panel, Data Grid, Video, Audio Player and Loading Button.
  Form and Rich Text Editor stay beta until their open API questions are
  settled.

### Fixed

- Combobox, Autocomplete and Multi Select on web: options could not be
  picked with the mouse. The list sits in a portal that ignores the pointer,
  and the list inherited that, so clicks went to the page underneath and the
  list closed. The list also showed a sideways scrollbar on Windows.
- Docs: the KPI Card and Table playgrounds showed "Unknown component", because
  the playground only looked in `@advui/core`. The List and Table playgrounds
  now have rows to show.
- Docs on phones: in every playground the preview and JSX collapsed to nothing
  and drew under the props, so the component looked missing. A `flex={1}` box
  that only shares a row on wide screens has a 0 px basis in the phone column.
  The same bug clipped the product example to a sliver, and an example's long
  description widened the page instead of wrapping.
- Button, Toggle, Toggle Group and Fab on native: holding them did not
  show the pressed color. Tamagui's React Native animation driver updated
  press colors without a render, so the view never received the new color. The
  driver now re-renders on press, hover and focus changes.
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
- CLI registry: the hooks, utils and chart files came out in a different
  order on Windows than on Linux, since NTFS lists files ignoring case. They
  are sorted now, so the registry is the same on every machine.

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
