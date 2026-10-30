# Roadmap

Components still to be built are listed in
[`packages/catalog/src/roadmap.ts`](packages/catalog/src/roadmap.ts); the docs
show them as "Planned". Phases 1 to 9 are done, so the list is empty. Phase
10, at the end of this file, holds the checks and decisions still open.

## Phases 1–5 (built)

| Phase | Components                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–3   | Foundations, forms, buttons, overlays, navigation and feedback, up to File Upload and File Dropzone (release 0.5.0)                                                    |
| 4     | Stat, KPI Card, List, Timeline, Image, Table, Pagination, Stepper, Data Table, Tree View, Navigation Menu, Sidebar                                                     |
| 5     | Search, Command Palette, Image Gallery, Bar / Line / Area / Pie Chart, Resizable Panel, Data Grid, Video, Audio Player, Rich Text Editor, plus Loading Button and Form |

## Phase 6: maintainer checks (done)

Closed on 2026-10-19; what is still open moved to Phase 10.

- **Android phone check.** Every component in `beta` was checked on an
  Android phone (TECNO KM9, Expo Go 57) between 2026-10-04 and 2026-10-19,
  in batches: every example in light and dark mode, sheets and layouts in
  landscape, and names, roles and states read from the accessibility tree
  (`uiautomator`). What the checks found is fixed, with native tests: the
  fixes are in the CHANGELOG, and the platform pitfalls in AGENTS.md.
- **Promoted to stable.** Every component except Rich Text Editor, as its
  batch passed (2026-10-05 to 2026-10-19).
- **Windows screenshots.** The missing `-win32.png` baselines were added on
  2026-10-05.
- **Form, decided** on 2026-10-05: a disabled Form disables every form
  control inside it, in a Field or not; other buttons stay enabled. The hook
  is `useParentForm`; `useFormStatus` is a deprecated alias.
- **Demo media.** Video and Audio Player play clips made for the docs
  (`apps/docs/public/media`, made by
  `scripts/demo-media/make-demo-media.ps1`).
- **Releases 0.6.0 to 0.13.0** are tagged on `main`, and all eight public
  packages are on npm at 0.13.0 (0.8.0 and 0.9.0 are git tags only; the
  0.5.0 of `@advui/data`, `@advui/charts` and `@advui/editor` is
  deprecated). Within a day of a release, pnpm 11 and later install the
  previous version: its `minimumReleaseAge` default skips newer ones.

## Phases 7–9 (built)

Common components that other libraries (shadcn/ui, MUI, Mantine, Chakra, Ant
Design) have and Adv UI does not yet. Scaffold one with
`pnpm create-component <slug>`: it takes the name, category and package from
the roadmap entry. Banner, Segmented Control, Avatar Group, Range Slider,
Lightbox and Donut are not listed because Alert, Toggle Group, Avatar, Slider,
Image Gallery and Pie Chart already cover them.

All three phases are built; the table keeps them for reference. Input
Group landed as slots on Input (`leading`, `trailing`, `leadingAddon`,
`trailingAddon`).

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
- **Indicator** landed as a wrapper around what it is pinned to rather than
  a dot mode on Badge, since a dot needs that element's corner. The mark is
  centered on a zero-size point at the corner by flex layout, with no
  transform.
- **Visually Hidden** landed as Adv UI's own Text rather than a re-export.
  On iOS and Android, Tamagui's shows its words inside another Text (a
  nested Text takes no box styles) and marks itself `accessible`, a stop of
  its own.
- **Portal** landed as a thin wrapper of Tamagui's rather than a plain
  re-export: Tamagui's host takes no touches and stops touch scrolling, so
  the wrapper adds a layer whose children take touches, and takes `zIndex`
  as a layer of the theme's scale. In the native test renderer, React
  context from above does not reach its children and the theme does.
- **Date Time Picker** landed as a Date Picker and a Time Picker side by
  side rather than one panel with a calendar and time selects, so no
  overlay opens inside another (a sheet inside a sheet on phones). Its
  `min` and `max` limit the days only: limiting the times on those days
  needs a `min` and `max` on Time Picker first.
- **Tour** is built on Portal rather than Popover: it needs a dimmed
  screen with a hole at the target, and Popover becomes a bottom sheet on
  phones. Steps point at elements with refs. On iOS and Android targets are
  measured from the root view (`measure`) but not scrolled to. The card's
  place was checked on Android (2026-10-29); TalkBack and VoiceOver were not.
- **Table of Contents** follows the window's scroll on web only. React
  Native has no anchors, so apps there pass `activeId` and scroll in
  `onItemPress`. **Back to Top** watches the page on web; on iOS and
  Android it needs `useBackToTop` on a ScrollArea.
- **Spoiler** cuts content off by height, not by lines, so it takes any
  content. **Meter** colors by range as the HTML `meter` element does.
- **Phase 9 charts** share the chart frame (legend, tooltip, table view,
  arrow keys) with the first four. **Radial Chart** is one component for
  radial bars and gauges (`variant`), rather than two. **Heatmap** takes the
  same wide rows as Bar Chart (one column per series) and shades one palette
  color in round steps rather than a gradient, so the legend can name each
  shade's range; it has no diverging scale for negative values yet.
  **Scatter Chart**'s points are found by distance, so a tap on a phone
  must land within about 16px of one. None was checked on a phone yet.
- **Virtual List** takes known row heights (`itemHeight`, a number or a
  function of the index) rather than measuring rows, so FlatList can place
  them without layout passes and web can size the scrollbar. Rows that size
  themselves would need measuring first.
- **Infinite Scroll** wraps its items in a ScrollArea rather than watching
  the window, since iOS and Android have no page to scroll. For thousands of
  rows, Virtual List's `onEndReached` and `footer` do the same work.
- **Event Calendar** has month, week, day and agenda views. A month day
  lists its events rather than drawing bars across days; on phones it shows
  dots, and the agenda suits phones best. Days and events are reached with
  Tab, not arrow keys. It has no drag to move or resize events, and no
  current-time line.
- **Kanban** is `experimental`: dragging on iOS and Android (long press,
  then the board claims the finger) works on an Android phone when the
  finger starts slowly; a quick first move lets a screen that scrolls
  around the board take the gesture and cancel the drag (Phase 10), as
  React Native cannot stop it there without a gesture library. Screen
  readers move cards with actions on native and with the keyboard on web.

## Phase 10: open checks and decisions

Carried over from Phase 6. They need a person, a phone or a decision, so CI
and AI agents cannot close them. The checks are grouped by platform; run
`pnpm install` before the playground commands in each group.

Tamagui 3 (unreleased) is behind most of them: it changed how every
component styles itself (flat values, unstyled primitives) and hands
presses to React Native's Pressability, which cancels a press when the
finger slides off the view. Native tests cover that for Button, FAB,
Accordion trigger and List Item row (`press.native.test.tsx`), but only a
phone shows it. Tamagui 3.1.3 then made its styled HOCs (Checkbox, Radio
Group, Switch, Tabs, Dialog and Sheet parts, Text) follow theme changes on
native.

### Decision

- [x] **Rich Text Editor: decided** on 2026-10-29: both. The Markdown
      editor is now Markdown Editor (stable), and Rich Text Editor is a new
      WYSIWYG editor that saves HTML: TipTap on web, and TipTap in a WebView
      (TenTap) on iOS and Android. It is `experimental` until it is checked
      on a phone (below).

### Android

Run `pnpm --filter @advui/expo-playground android:emulator` (a phone over
USB or an emulator). Checked so far on a TECNO KM9 (Android 16, Expo Go).
Expo Go must match the project's SDK (57): install its APK with `adb push`
and `adb shell pm install`, since a 200 MB `adb install` dropped the USB
link. The Play Store updates Expo Go to the next SDK on its own, and
Android refuses the older version over it (even with `pm uninstall -k`):
uninstall Expo Go first, which clears its data. Start Metro without
`CI=1`, which turns off its file watching, so edits never reach the phone.
Time and scroll checks on a production bundle (`expo start --no-dev
--minify`): in a development one Virtual List draws blank rows while it
flings and a color mode switch takes twice as long.

- [x] **Tamagui 3.1.3.** Passed on 2026-10-29 in light and dark mode:
      Checkbox, Radio Group, Switch, Tabs, Button, Dialog, Text and Home,
      mounted under the Theme screen, all followed each switch; Dialog,
      Sheet, Select and Dropdown Menu opened and closed in both modes; a
      finger that slid off a Toast button showed no toast, and a tap did.
      Not covered: a switch while a Dialog or Sheet is open, which needs
      the system's dark mode with the playground on `system`.
- [x] **Color mode switch is slow.** Fixed on 2026-10-30. On the TECNO, on
      a production bundle, the Theme screen took about 2 seconds to switch,
      with the screen half in the old mode for a second. Profiled on a
      development bundle, 1.4 of its 2 seconds went to the layout effect of
      Tamagui's React Native animation driver, which restarted 462 springs:
      Button-like frames animated every style (`transition: 'quick'`),
      height and radii included, so the driver ran on the JS thread and
      flushed the whole style at each start. They now animate their state
      colors and opacity (`colorsOpacity`): 80 springs, and the switch is
      done within 0.3 seconds. Left: Tamagui 3.1.3's driver looks for
      `global.__nativeFabricUIManager`, which React Native 0.86 does not set,
      so it never uses the native driver. Passing `useNativeDriver: true` to
      `createAnimations` would take these springs off the JS thread, but
      the native driver throws on styles it does not support (border
      widths), so every `transition` must name its properties first; report
      the check upstream.
- [ ] **Visually Hidden: TalkBack by ear.** Seen on 2026-10-25 in light
      and dark mode: nothing shows where the hidden words are, after a fix
      (Android drew them in the text's color, since it reads `transparent`
      as no color). The accessibility tree has the links as “Read more about
      plans for teams” and the prices as “Was $120” and “Now $84”. Left:
      each link also holds a virtual link button named “Read more” alone
      (React Native adds them once a link's text has more than one run), so
      listen for whether TalkBack stops on it and what it says there.
- [ ] **Indicator: TalkBack by ear.** Seen on 2026-10-25 in light and
      dark mode: each dot sits on the edge of its round avatar and each
      count, whole, on the corner of its icon; pressing Notifications clears
      its count. The accessibility tree has “Maya Chen” then “Online”, and
      “Notifications, 3 unread”, with no count. Seen on 2026-10-29 with
      `androidRipple` on (`EXPO_PUBLIC_ADVUI_STYLE=material`): both counts
      are cut off where they pass the button's corner, as `useRipple` gives
      the pressable `overflow: 'hidden'` to keep the ripple inside its
      corners. Left: decide the fix (clip the ripple's own view to the
      button's radius, or pin the Indicator outside the button), and hear
      it.
- [ ] **Rich Text Editor: TalkBack by ear.** Checked on 2026-10-29: the
      WebView loads in Expo Go, grows with the text inside the scrolling
      screen, keeps the keyboard up when a tool is pressed, and follows
      light and dark mode, also while mounted under a switch. The link field
      adds a link at the caret and on selected text, removes it, and gives
      the selection back on Cancel, after fixes (see the CHANGELOG). The
      page's editable element has `aria-label` (“Report”, “Comment”), which
      `uiautomator` does not show, and an empty editor's text is its
      placeholder (TipTap draws it with `::before`). Left: hear whether
      TalkBack reads the field's name, and the placeholder as a hint or as
      text. Then move it to `beta`.
- [ ] **Phase 9: TalkBack by ear.** Checked on 2026-10-29. Kanban: a long
      press picks a card up and a drag moves it within and across columns,
      and the card drops under the finger (after a fix). The board does not
      scroll during a drag, and does not scroll sideways at its edge either,
      so a column wholly off screen takes two drags. A finger that moves
      more than Android's touch slop (about 8dp) before the board claims it
      lets the screen's ScrollView take the gesture, and the drag is
      cancelled: `adb` moves of 15px kept the drag, 27px and more lost it.
      Decide whether to block the screen's scrolling (React Native's JS
      responder only does it once the board is granted, which is too late)
      or take a gesture library. Virtual List: no blank rows while flinging
      through the ten thousand rows on a production bundle, and Load more
      at the end loads pages up to “All 150 orders”. Infinite Scroll: pages
      load at the end up to the end message, and the failing page loads on
      Try again. Event Calendar: the week view opens at its `scrollToHour`
      (9 in the example) under the pinned days, which stay as the hours
      scroll. The five Phase 9 charts draw in light and dark mode, and a tap
      shows a point's tooltip and puts it in the chart's name (Scatter,
      Composed, Heatmap, Radar, Radial). Left: TalkBack's Move actions on a
      Kanban card and Infinite Scroll's announcement, by ear.
- [x] **Phase 8 on a phone.** Checked on 2026-10-29 in light and dark mode:
      Back to Top, Date Time Picker, Description List, Meter, Portal,
      Spoiler, Table of Contents, Tour and Transfer List, with their names
      and states read from the accessibility tree. Tour's ring and card were
      a status bar too high, Table of Contents kept “current” on the item
      before, and Transfer List's long list names pushed the count out: all
      fixed.
- [ ] **A phone with the stock font.** The TECNO's system font replaces
      monospace in every app, so Code Block, `Text mono` and Kbd were never
      seen monospaced on Android.
- [x] **Tamagui 3.** Passed on 2026-10-22 in light and dark mode: press,
      hover-free touch feedback and the ripple, dashed borders (Empty State,
      Loading State, File Dropzone), sheets (Select, Dropdown Menu,
      Combobox), Drawer and Dialog motion, and TalkBack names and roles
      (Select options, Password Input's toggle). It took fixes to sheet
      handles, Select's sheet, Dialog and Drawer motion and Tabs, then
      Text's `truncate` and Card's `elevated` shadow.
- [x] **TalkBack by ear.** Done on 2026-10-22: Copy Button, Tags Input and
      Carousel announcements, a labelled Separator, named Sections,
      AppShell's drawer, List rows, focus after a chip is removed, and
      Video and Audio Player's sound. The fixes are in the CHANGELOG: Copy
      Button's "Copied" was read twice, Carousel read every dot after a
      move, Chip lost focus after a removal, disabled controls could not be
      found by touch, and Audio Player's frame caught touches meant for its
      buttons.

### iOS

Run `pnpm --filter @advui/expo-playground ios` (macOS). Nothing has been
checked on an iPhone yet.

- [ ] **Every component.** Go through every example in light and dark mode,
      as Android was in Phase 6. Look closely at Tags Input's Backspace, the
      sheets that stop below the status bar, and the announcements made with
      `AccessibilityInfo`.
- [ ] **Tamagui 3.1.3.** What Android passed: press and touch feedback, a
      finger that slides off a button cancels the press, dashed borders
      (Empty State, Loading State, File Dropzone), sheets (Select, Dropdown
      Menu, Combobox), Drawer and Dialog motion, and VoiceOver names and
      roles (Select options, Password Input's toggle). Then switch light and
      dark mode with the styled HOCs on screen.
- [ ] **VoiceOver by ear.** The list TalkBack was checked with: Copy
      Button, Tags Input and Carousel announcements, a labelled Separator,
      named Sections, AppShell's drawer, List rows, focus after a chip is
      removed, and Video and Audio Player's sound.
