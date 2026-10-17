# Roadmap

Components still to be built are listed in
[`packages/catalog/src/roadmap.ts`](packages/catalog/src/roadmap.ts); the docs
show them as "Planned". Phases 1 to 5 are built; phases 7 to 9 (at the end of
this file) are planned.

## Phases 1–5 (built)

| Phase | Components                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–3   | Foundations, forms, buttons, overlays, navigation and feedback, up to File Upload and File Dropzone (release 0.5.0)                                                    |
| 4     | Stat, KPI Card, List, Timeline, Image, Table, Pagination, Stepper, Data Table, Tree View, Navigation Menu, Sidebar                                                     |
| 5     | Search, Command Palette, Image Gallery, Bar / Line / Area / Pie Chart, Resizable Panel, Data Grid, Video, Audio Player, Rich Text Editor, plus Loading Button and Form |

Everything from phase 4 on is `beta` until the Phase 6 checks below pass on
real devices.

## Phase 6: maintainer checks

These need a person, a Windows machine or a real phone, so CI and AI agents
cannot do them. Tick them off here as they are done.

- [x] **Windows screenshots.** The 146 missing `-win32.png` baselines (the
      examples added in phases 4 and 5, Form and Grid) were added on 2026-10-05.
- [ ] **Real phones.** Run `pnpm install` (the Expo playground uses `expo-video`
      and `expo-audio`; Expo Go SDK 57 includes both, a development build needs
      rebuilding), then start `pnpm --filter @advui/expo-playground android:emulator`.
  - The 26 components from phases 4 and 5 passed on an Android phone on
    2026-10-05, after the fixes listed under Unreleased in the CHANGELOG.
    Labels and states were read from the accessibility tree (`uiautomator`),
    not by ear: Loading Button and Form report "Saving…, busy" on a disabled
    button and save once on a double press, Form's title is a heading, its
    Disabled fields cannot be edited and its Horizontal row fits. Video
    plays and seeks; Audio Player plays, seeks and changes speed (the phone's
    media volume was 0, so the sound itself was not heard). Still to check:
    an iPhone, and TalkBack / VoiceOver by ear.
  - Grid (0.7.0 spans): passed on the Android phone in landscape (914pt) on
    2026-10-05: Two columns splits 8 / 4, Sidebar 3 / 9, the first Offset row
    is centered, and rotating back to portrait stacks them. Still to check:
    an iPhone.
  - Stack, Wrap, Container and Separator (0.9.0): the Android phone was
    checked on 2026-10-04 (column layouts, Wrap, gutter, labelled separator).
    In landscape (2026-10-05) Responsive direction is a row and Toolbar a
    single line. Still to check: an iPhone, and by ear that TalkBack /
    VoiceOver read a labelled Separator with `decorative={false}` once, as
    its label.
  - Show / Hide, Section and Sticky (0.10.0): the Android phone was checked
    on 2026-10-04 (Show / Hide at phone width, inverse and primary Sections,
    Sticky headers pinned and pushed in a ScrollArea). In landscape
    (2026-10-05) Show / Hide shows the links from md and Section spaces out
    with three feature columns. Still to check: an iPhone, and by ear
    TalkBack / VoiceOver reading a named Section.
  - AppShell and AutoGrid (0.11.0): the Android phone was checked on
    2026-10-04 (both examples open their sidebar in a drawer that clears
    the status bar; the back button, the × and an item close it; Main
    scrolls inside the Expo example; AutoGrid is one column). In landscape
    (2026-10-05) the sidebar sits beside Main from md (the Docs example stays
    a drawer below lg), AutoGrid has three columns, and the drawer is named
    "Docs" in the accessibility tree. Still to check: an iPhone, and the
    drawer's name by ear.
  - The components that moved to `@advui/data`, `@advui/charts` and
    `@advui/editor` still open in the Expo app (it now loads them from those
    packages).
  - Copy Button and Code Block (0.14.0): passed on the Android phone on
    2026-10-17, in light and dark mode. A press copies through
    `expo-clipboard` (pasted back into a field to confirm), shows the check
    and Android's own "Copied" preview, and a labelled button keeps its
    width. Code scrolls sideways, wraps with `wrap`, and a `maxHeight` log
    scrolls inside the screen; marked lines show their tint and bar. Two
    fixes came from it: an unwrapped line ending in italic lost its last
    word on Android, and "Link copied" moved the button beside it. This
    phone's system font replaces monospace in every app (a plain React
    Native `fontFamily: 'monospace'` is proportional too), so code is not
    monospaced on it. Still to check: a phone with the stock font, an
    iPhone, and the announcements by ear.
  - Menubar (0.14.0): passed on the Android phone on 2026-10-17 (light
    mode, portrait). Each menu opens as a bottom sheet with its trigger
    highlighted; separators, the dimmed disabled item and the red
    destructive item show; choosing an item closes the sheet and runs it;
    a disabled item and the disabled Tools trigger do nothing; the back
    button and a tap on the scrim close the sheet without leaving the
    screen; checkbox items keep their value and radio items move the
    selection. Shortcuts are web only. Dark mode passed later that day
    (the sheets, the dimmed disabled item, the red destructive item, the
    check and radio marks). Landscape (2400×1080) passed too: the bar keeps
    one row, each menu's sheet fits its items, choosing an item runs it
    and closes the sheet, radio items move the selection, and the back
    button closes the sheet. The Format menu is nearly as tall as the
    screen, so its sheet's top edge and handle went under the status bar;
    menu, Select and Popover sheets now stop below it and their content
    scrolls (checked in landscape with a 12-option Select, Date Picker's
    six-week August, and a vertical drag in Color Picker's sheet, which
    still closes cleanly).
    Still to check: an iPhone, and TalkBack by ear.
  - Link, Input slots, Checkbox Group, Tags Input, Carousel, Rating and
    Color Picker (0.14.0): checked on the Android phone on 2026-10-17
    (light mode, portrait), with names and states read from the
    accessibility tree. Inline links, standalone links and the `href`
    links work (`https:` opens the browser, `tel:` the dialer); slot icons
    and addons focus their field and the ring covers the whole box;
    Checkbox Group toggles items and Select All, and its Field error
    clears; Tags Input adds tags with return, commas and spaces, refuses
    an invalid address with the error, and removes tags with their
    buttons; Carousel moves with swipes, arrows and dots, loops, and its
    autoplay pauses; Rating takes whole and half presses and reads its
    value; Color Picker drags, takes a hex, picks swatches and opens in a
    sheet that the back button closes. Fixes from it: a disabled checkbox
    now reads as disabled; Select All no longer says "mixed" once it is
    checked; pressing a disabled item's label no longer logs a warning;
    the Color Picker sheet no longer stays on screen after a vertical drag
    in the color area (a Tamagui Sheet bug, worked around); the Link
    example's standalone link takes presses only on its text; and Backspace
    in Tags Input's empty text box removes the last tag on Android too
    (Tamagui dropped key presses on native, so its text box there is React
    Native's TextInput). Dark mode passed later that day for all seven.
    The long placeholder ("name@example.com" beside a tag) still wrapped
    onto a cut-off second line, in light mode too: Android wraps every
    TextInput placeholder wider than its box (plain React Native ones as
    well; `numberOfLines` is already 1). The text box now draws a one-line
    copy that ends in "…" and keeps the real placeholder, transparent, for
    TalkBack; checked on the phone. Still to check: an iPhone (Backspace
    included), and the announcements by ear.
  - Form's disabled state, Radio Group items, Password Input and Search
    (on Input's slots), and Date Picker and Date Range Picker after the
    Popover change (0.14.0): checked on the Android phone on 2026-10-17 in
    dark mode. A disabled Form's fields cannot be focused and Save is
    disabled; with a probe added to the example (not committed), a
    checkbox, switch, radio group, rating and Tags Input outside a Field
    ignored presses while Cancel stayed enabled. Radio Group items are
    named by their labels and a press on the label selects the item;
    Password Input shows and hides the text; Search filters as you type
    and its clear button empties the field and keeps focus; both pickers
    open their sheet and close it with the picked date or range. Fixes
    from it, checked again on the phone: a Switch reports on/off and
    disabled (Tamagui's switch sent neither state on native); disabled
    radio items and a disabled chip's remove button, Tags Input's
    included, read as disabled; and Password Input's toggle is a toggle
    button that reads as checked while the password shows (it used
    `aria-pressed`, which React Native ignores). The Switch example's
    switches had no name on Android (a `Label`'s `htmlFor` only moved
    focus); a Label now names the control it targets, read from the
    accessibility tree on the phone for Switch, Checkbox and Input. Hints
    (descriptions, the group's name) go to Android's tooltip text, which
    `uiautomator` does not show, so they are left for TalkBack by ear.
    Still to check: an iPhone, and the announcements by ear.
- [ ] **Rich Text Editor: decide.** It is a Markdown editor (toolbar,
      shortcuts, preview), the same on every platform with no extra
      dependencies. Keep it, or ask for a WYSIWYG editor, which needs new
      libraries (TipTap on web, a WebView-based editor on iOS and Android).
- [x] **Form: decided** on 2026-10-05. Nothing else holds Form back from
      `stable`. Its disabled behavior passed on the Android phone on
      2026-10-17 (see Real phones), after the Switch and Radio Group fixes
      that check led to.
  - A disabled Form disables every form control inside it, in a Field or
    not (through `useFieldControl`); other buttons, such as Cancel, stay
    enabled.
  - The hook is `useParentForm` (type `FormContextValue`); `useFormStatus`
    stays as a deprecated alias for now.
  - The docs page has a Form playground, next to the eight examples.
- [x] **Demo media.** The Video and Audio Player examples play clips made for
      the docs (`apps/docs/public/media`, made by
      `scripts/demo-media/make-demo-media.ps1` with the Windows voices and
      ffmpeg); the handwashing video has an English captions file. They load
      from the published site, so they play once that is deployed.
- [ ] **Promote to stable.** When a component passes the phone check, change
      its `status` from `beta` to `stable` in its `*.meta.ts` and run
      `pnpm catalog`. Done on 2026-10-05 for 24 of the 26. Form can follow
      now that its API is decided; Rich Text Editor stays beta until its
      decision above.
- [x] **Release 0.6.0**: tag `v0.6.0` points at the release commit, and all
      eight public packages are published at 0.6.0.
- [x] **Release 0.7.0** (Grid spans, Field): tagged `v0.7.0` and published.
- [x] **Releases 0.8.0, 0.9.0 and 0.10.0** (Builder metadata; responsive
      Stack props, Wrap, Container gutter, labelled Separator; Show / Hide,
      Section, Sticky and the sub-themes), merged on 2026-10-04 with merge
      commits so the stacked pull requests kept their commits. Tags `v0.8.0`,
      `v0.9.0` and `v0.10.0` point at the merge commits on `main`, for the
      AdvUI Builder. Only 0.10.0 was published to npm (after 0.7.0); 0.8.0 and
      0.9.0 are git tags only.
- [x] **Release 0.11.0** (AppShell, AutoGrid): published on 2026-10-04 and
      merged on 2026-10-05 with a merge commit. Tag `v0.11.0` points at the
      pull request's last commit, which `main` contains, so the AdvUI Builder
      can sync metadata from it.
- [x] **Release 0.12.0** (metadata on npm at `<package>/meta`, Combobox
      fields that open on a click, the Form and accessibility fixes):
      published on 2026-10-06; all eight public packages are on npm at 0.12.0.
      Tag `v0.12.0` points at the merge commit on `main`. The AdvUI Builder
      can now import `components` from `@advui/core/meta` (bundled by Vite)
      instead of syncing `*.meta.ts` from the git tag.
- [x] **Release 0.13.0** (Toolbar, Filter Bar, List Item, Confirm Dialog,
      Loading State, Alert as a callout, the Date Picker fixes): published on
      2026-10-15; all eight public packages are on npm at 0.13.0. Tag
      `v0.13.0` points at the merge commit on `main`. The AdvUI Builder can
      move to 0.13.0 and register Toolbar and Filter Bar.
- [x] **Try the new packages.** 0.6.0 is the first working release of
      `@advui/data`, `@advui/charts` and `@advui/editor`; their 0.5.0,
      published by mistake before the version bump, is deprecated. On
      2026-10-05 a fresh Next.js app with all six packages at 0.11.0 built and
      rendered `DataTable`, `BarChart` and `RichTextEditor` once
      `react-native-web` was added (the install guide now says to add it).
      Within a day of a release, pnpm 11 and later install the previous
      version: its `minimumReleaseAge` default skips newer ones.

## Phases 7–9 (planned)

Common components that other libraries (shadcn/ui, MUI, Mantine, Chakra, Ant
Design) have and Adv UI does not yet. Scaffold one with
`pnpm create-component <slug>`: it takes the name, category and package from
the roadmap entry. Banner, Segmented Control, Avatar Group, Range Slider,
Lightbox and Donut are not listed because Alert, Toggle Group, Avatar, Slider,
Image Gallery and Pie Chart already cover them.

Built so far (the table keeps them for reference): Link, Input Group as
slots on Input (`leading`, `trailing`, `leadingAddon`, `trailingAddon`),
Checkbox Group, Tags Input, Carousel, Rating, Color Picker, Copy Button,
Code Block and Menubar. Phase 7 is complete.

| Phase | Package         | Components                                                                                                                                  |
| ----- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 7     | `@advui/core`   | Link, Input Group, Checkbox Group, Tags Input, Carousel, Rating, Color Picker, Menubar, Code Block, Copy Button                             |
| 8     | `@advui/core`   | Date Time Picker, Description List, Indicator, Tour, Spoiler, Meter, Table of Contents, Back to Top, Transfer List, Visually Hidden, Portal |
| 9     | `@advui/charts` | Scatter Chart, Radar Chart, Radial Chart (radial bars and gauges), Composed Chart (bars and lines on one axis), Heatmap                     |
| 9     | `@advui/data`   | Virtual List, Infinite Scroll, Kanban, Event Calendar                                                                                       |

Notes for whoever picks these up:

- **Input Group** landed as slots on Input; Password Input and Search use them.
  The original note: it may land as prefix and suffix slots on Input rather than a
  new component; Number Input and Password Input should use the same slots.
- **Tags Input** takes free text. Multi Select, which picks from a fixed list,
  stays as it is; both can render Chip.
- **Indicator** is a dot or count pinned to an avatar or icon; Badge has no
  dot mode today.
- **Visually Hidden** and **Portal** exist in Tamagui; they may only need to be
  re-exported and documented, with the native portal pitfalls in AGENTS.md.
