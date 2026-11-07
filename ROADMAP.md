# Roadmap

Components still to be built are listed in
[`packages/catalog/src/roadmap.ts`](packages/catalog/src/roadmap.ts); the docs
show them as "Planned". Phases 1 to 9 are done, so the list is empty. Phase
10 holds the checks and decisions still open, and Phase 11, at the end of
this file, the work planned beyond components: routing on native, getting
started, and checks that run without a person.

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
- **Releases 0.6.0 to 0.14.0** are tagged on `main`, and all eight public
  packages are on npm at 0.14.0 (0.8.0 and 0.9.0 are git tags only; the
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
  `min` and `max` limit the days, and the times on those two days through
  Time Picker's own `min` and `max`.
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
  shade's range. `scale="diverging"` shades two colors away from a
  `midpoint`, for changes, in steps that are the same on both sides.
  **Scatter Chart**'s points are found by distance, so a tap on a phone
  must land within about 16px of one. None was checked on a phone yet.
- **Virtual List** takes known row heights (`itemHeight`, a number or a
  function of the index) rather than measuring rows, so FlatList can place
  them without layout passes and web can size the scrollbar. Without
  `itemHeight`, rows size themselves: web measures them as they are drawn
  (an estimate until then) and keeps the view in place when a row above it
  grows; FlatList measures them on iOS and Android.
- **Infinite Scroll** wraps its items in a ScrollArea rather than watching
  the window, since iOS and Android have no page to scroll. For thousands of
  rows, Virtual List's `onEndReached` and `footer` do the same work.
- **Event Calendar** has month, week, day and agenda views. A month day
  lists its events rather than drawing bars across days; on phones it shows
  dots, and the agenda suits phones best. Days and events are reached with
  Tab, not arrow keys. With `onEventChange`, timed events in the week and
  day views move by dragging, by their bottom edge, with the arrow keys or
  with screen reader actions, as Kanban's cards do. A month day's events do
  not move, and on iOS and Android a drag does not scroll the hours, so it
  reaches the hours in view. A line marks the current time across today.
- **Kanban** is `experimental`: dragging on iOS and Android (long press,
  then the board claims the finger) worked on an Android phone only when the
  finger started slowly: a quick first move let the screen's scroll view
  take the gesture and cancel the drag. **Decided** on 2026-11-01: block the
  screen's scrolling rather than take a gesture library. React Native's JS
  responder claims a move only after Android's native scroll view has seen
  it, but a scroll view whose `scrollEnabled` is off never takes it, and the
  board's own ScrollArea already turned it off at pickup. So the pickup now
  stops every ScrollArea and AppShell Main around the board as well
  (`useScrollLock`), before the finger moves; apps with another scroll view
  stop it in `onItemDragStart`. A gesture library would be a native
  dependency and a root view every app must add, for one component. Screen
  readers move cards with actions on native and with the keyboard on web.

## Phase 10: open checks and decisions

Carried over from Phase 6. They need a person, a phone or a decision, so CI
and AI agents cannot close them. The checks are grouped by platform; run
`pnpm install` before the playground commands in each group.

Tamagui 3 (released in 0.14.0) is behind most of them: it changed how every
component styles itself (flat values, unstyled primitives) and hands
presses to React Native's Pressability, which cancels a press when the
finger slides off the view. Native tests cover that for Button, FAB,
Accordion trigger and List Item row (`press.native.test.tsx`), but only a
phone shows it. Tamagui 3.1.3 then made its styled HOCs (Checkbox, Radio
Group, Switch, Tabs, Dialog and Sheet parts, Text) follow theme changes on
native.

### Release

- [x] **Release 0.14.0** (Tamagui 3, the Phase 7 to 9 components, the WYSIWYG
      Rich Text Editor, metadata that loads in Node): published on
      2026-10-31; all eight public packages are on npm at 0.14.0. Tag
      `v0.14.0` points at the merge commit on `main`. The AdvUI Builder can
      move to 0.14.0, which needs Tamagui 3, take `breakpoints` from
      `@advui/core/meta` and drop its gaps 10 to 12. On Windows, PowerShell
      that blocks scripts runs npm and pnpm as `npm.cmd` and `pnpm.cmd`;
      publishing asks for npm's two-factor approval in the browser, once,
      within a few minutes.
- [ ] **Release 0.15.0.** Unreleased on `main` (see the CHANGELOG): Scroll
      Area's `avoidKeyboard` and App Shell Main avoiding the keyboard,
      `advui diff`, `advui update` and `advui create`, `advui init` editing
      `next.config`, `setRouter` (`href`
      on iOS and Android), `useScrollLock` and Kanban's quick drags, moving
      events in Event Calendar, Time Picker's `min` and `max`, Heatmap's
      diverging scale, and Virtual List rows that size themselves. The
      registry keeps each release's files from 0.14.0 on, the base `update`
      merges against; components added by an older CLI must be named. The
      starter apps ask for `^0.15.0`, so `advui create` works once the
      packages are published.

### Decision

- [x] **Rich Text Editor: decided** on 2026-10-29: both. The Markdown
      editor is now Markdown Editor (stable), and Rich Text Editor is a new
      WYSIWYG editor that saves HTML: TipTap on web, and TipTap in a WebView
      (TenTap) on iOS and Android. It is `experimental` until it is checked
      on a phone (below).
- [ ] **What 1.0 means.** Nothing says yet when Adv UI is stable enough to
      build a product on. A proposal: every iOS check below passed, Rich
      Text Editor and Kanban out of `experimental`, the router adapter
      (Phase 11) in, and a written policy for breaking changes: how long a
      deprecated prop stays, and how `advui update` carries a change into
      copied source.

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
      widths), so every `transition` must name its properties first. Done
      on 2026-11-01: every style transition names them (`namedTransition`,
      `utils/transition.ts`); only the sheets' position spring takes a
      preset. Left: turn on `useNativeDriver` and check the motion on a
      phone (Jest cannot: native-driven values never move there), and report
      the detection upstream, with `useAnimatedNumber`, which ignores the
      option and moves the sheets.
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
      “Notifications, 3 unread”, with no count. With `androidRipple` on
      (`EXPO_PUBLIC_ADVUI_STYLE=material`) the counts were cut off at the
      button's corner on 2026-10-29: the ripple clipped the whole button. It
      clips only itself now, and on 2026-10-30 both counts were whole, at
      rest on the TECNO and also while pressed on an Android 16 emulator,
      where the ripple stayed inside the round IconButton, a pill Button and
      a Card. Left: hear it.
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
      Fixed on 2026-11-01 by stopping the screen's scrolling at pickup (see
      Kanban above). On an Android 16 emulator (Medium Phone API 36) an `adb`
      long press followed by a first move of 115px moved the card, and with
      the scroll lock taken out the same gesture lost the drag; check it
      again on the phone. Virtual List: no blank rows while flinging
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
- [ ] **Event Calendar: moving events.** Checked on 2026-11-01 on an
      Android 16 emulator (Medium Phone API 36, Expo Go 57) with `adb`
      gestures: a long press and a quick first move took Sprint planning
      from Friday 1 PM to Thursday 12 PM, and the screen did not scroll; a
      long press on its bottom edge and a drag down ended it half an hour
      later, after a fix (the press's `currentTarget` is gone by the time a
      long press fires, so the event's own view is measured); the read-only
      Release stayed put. Time Picker's 12-hour example disables 7 to 11 PM
      in its sheet (`enabled="false"` in the accessibility tree), and Virtual
      List's Rows that size themselves example wraps its messages and shows
      no blank rows or jumps after a fling down and back up. Left: the same
      drags on a phone with a finger, and TalkBack's Move actions on an
      event, by ear.
- [x] **Keyboard avoidance.** Checked on 2026-10-31 on an Android 16
      emulator (Medium Phone API 36, Expo Go 57) with the hardware keyboard
      turned off, so Gboard docked at the bottom: App Shell Main, and a
      ScrollArea with `avoidKeyboard` under the playground's navigation
      header, both ended at the keyboard's top, with no offset passed; the
      focused field scrolled fully into view, and Main took back its height
      when the keyboard closed. Not covered: a keyboard that changes height
      while open (Gboard's emoji panel), which only the native test covers.
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
- [ ] **Keyboard avoidance.** In App Shell Main and a ScrollArea with
      `avoidKeyboard` (the playground's form screens), the focused field
      stays above the keyboard (`automaticallyAdjustKeyboardInsets`), also
      under the large title header, a button takes the first tap while the
      keyboard is up, and the content moves with the keyboard when it
      changes height (the emoji keyboard).

## Phase 11: planned work

Work beyond components, in order. Unlike Phase 10, AI agents can do most of
it; the phone preview needs the maintainer's Expo account. It comes from a
review of an outside proposal on 2026-10-31, which also led to keyboard
avoidance and `advui diff` / `update` (Release 0.15.0 above); the parts of
it that were already built (safe areas, `add` resolving dependencies, layout
examples, web visual tests) are not listed.

- [x] **A router adapter, so `href` works on native.** Done on 2026-11-02
      (in 0.15.0). Link, Breadcrumb, Sidebar, Navigation Menu, Menu and List
      Item took `href`, but on iOS and Android a path did nothing without
      `onPress={() => router.push(href)}`. Now the app registers its router
      once, `setRouter(router)` with Expo Router, as `setFilePicker` works,
      and these components push a path through it after their `onPress`; an
      absolute URL opens with the system, and a fragment (`#plans`) is never
      followed. It is module state rather than React context, since native
      portals drop context and a link may render in one (a sheet or a
      toast), and components subscribe to it, so a router registered from an
      effect still reaches links already on screen. Expo Router, Solito and
      React Navigation (`useLinkTo`) all fit `push(href)`, so Adv UI depends
      on none of them. On web nothing changes: `render` still takes the
      app's own link (`<NextLink />`). Navigation Bar takes `value` and
      `render`, not `href`, so it is unchanged. Checked on 2026-11-02 on an
      Android 16 emulator (Medium Phone API 36, Expo Go 57) with the
      playground's `setRouter(router)`: a Link inside text, a Breadcrumb
      item, a Sidebar item, a Navigation Menu link, a Menu item and a List
      Item each opened their screen, so did a Link inside a Drawer (a
      portal), and a `#plans` link did nothing. Left: the same on iOS.
- [x] **A starter app.** Done on 2026-11-02 (in 0.15.0), as
      `advui create <folder> --template next|expo` in the existing CLI, so
      there is no second package to publish. `next` is a Next.js App Router
      app (React Native Web's styles in the server HTML, a header whose links
      use `next/link`; Dashboard, Settings and Sign in), `expo` an Expo
      Router app (safe-area insets, `setRouter(router)`, themed tabs; Home,
      Dashboard and Settings). Both depend on the npm packages. The screens
      are copied from `examples/src` when the CLI is built, and CI's
      `starter` job packs this checkout's packages, creates both apps, and
      typechecks and builds them (`next build`; `expo export` for Android
      and iOS), so they cannot fall behind the packages. Checked on
      2026-11-02 with `pnpm starter:check`: the Next.js app in a browser
      (every page, client-side navigation, dark mode from the first paint,
      375px wide), and the Expo app in Expo Go 57 on an Android 16 emulator
      (the three tabs, in light and dark mode). Left: the Expo app on iOS.
- [x] **`init` edits `next.config`.** Done on 2026-11-03 (in 0.15.0). It
      wrote `advui.json` and `tamagui.config.ts` but only printed the
      Next.js changes. Now it finds the exported config object (directly,
      through a `const`, or inside a wrapper such as `withMDX(nextConfig)`)
      with a small scanner rather than a parser, so the CLI keeps no runtime
      dependencies, and adds `transpilePackages` and `turbopack`'s alias and
      extensions in the file's own quotes and indentation, merging into what
      is there. A function, a list held in a variable or a spread of another
      config is left alone, and the settings are printed with the reason.
      Tests import each edited config to check what it exports. Checked on
      2026-11-03 on create-next-app's `next.config.ts`, which then built
      with `next build`. Since 2026-11-04 it also removes `cacheComponents`
      and `partialPrefetching`, which create-next-app 16.4 can add and which
      fail `next build` at Tamagui's `Math.random()`, unless the project has
      a `'use cache'` directive; then it keeps them and prints the options.
- [x] **Guides.** Done on 2026-11-04, in a new Guides section of the docs:
      forms and the keyboard (Field, Form, `avoidKeyboard`), navigation with
      Expo Router and with Next.js, and moving from Tamagui's default skin
      and from shadcn/ui. NativeBase is deprecated and NativeWind styles with
      `className`, so guides from those would reach fewer people. What they
      say was tried first. On an Android 16 emulator (Medium Phone API 36,
      Expo Go 57): the Return key chain, the email keyboard, keyboard
      avoidance, a Sheet and a Dialog with the keyboard up, links in a Drawer
      and Navigation Bar as an Expo Router tab bar. On web: double submits
      from `onSubmitEditing`, `render` on each link, and Tamagui's skin under
      Adv UI's config, which is why that move is all at once. In a Next.js
      16.4 app with shadcn/ui: both side by side, and the React Hook Form
      example. Left: the same on iOS.
- [x] **A master–detail screen.** Done on 2026-11-05 as the Inbox example
      (`examples/src/inbox.tsx`), the one common layout missing beside
      dashboard, admin, settings, mobile, product and login: a list beside its
      detail from `md` up, and on phones a list that the detail covers. Both
      panes are always in the tree and CSS picks what shows, so the server
      sends the right layout for every width, and the list stays under the
      message and keeps its scroll position. For this, `useBackToClose` is now
      public, and examples have a `fill` option: the docs and Expo give such a
      screen a height instead of a scroll view. The open message is state,
      because the screen runs under any router; an app keeps it in the route.
      Checked on 2026-11-05 in Chrome at 390 and 1280px wide, and on an
      Android 16 emulator (Medium Phone API 36, Expo Go 57): in portrait the
      push, the back button, the list hidden from accessibility while covered,
      the focus events on the Back button and the row, delete with Undo, and a
      tap on a row with the keyboard up; in landscape (914dp) both panes. Left:
      iOS, and a pass with TalkBack itself running.
- [x] **Phone preview.** Done on 2026-11-06: each component page that renders
      on phones has an **Open on phone** button with a QR code that opens the
      component's screen in Expo Go. EAS Update was the plan, but since May
      2026 Expo Go loads such a project only for its own members, so visitors
      would be refused. The playground is a self-hosted update from a
      Cloudflare Worker instead (`apps/expo/preview/`), in plain JavaScript,
      with a manifest header that GitHub Pages cannot send. Snack was ruled
      out: it would mean a second copy of every example, and it tends to lag
      new Expo SDKs. Checked at the public address on an Android 16 emulator
      (Medium Phone API 36, Expo Go 57) with Expo Go's storage cleared and no
      Expo account, and on a real Android phone, by its address and from a
      docs page's QR code. The codes for Button and for the longest name also
      decoded from screenshots in both color modes, at both widths and at 1x.
      Left: iOS. Expo could tighten Expo Go again, and the codes stop working
      when Expo Go moves to a new SDK, until the playground follows.
- [x] **Nightly native screenshots.** Done on 2026-11-07: the Native
      screenshots workflow opens every playground screen on an Android
      emulator in light and dark mode, 668 shots, and compares them with the
      approved set, nightly rather than on every PR (Detox or Appium per PR
      would cost more than it finds). A Maestro flow was the plan, but the job
      only opens a link, waits and takes a screenshot, and Maestro is a 350 MB
      download that needs Java, so it is a Node script on plain `adb`
      (`apps/expo/screenshots/`). The approved set is a workflow artifact, as
      committing it could add about 40 MB to the repository per refresh; running
      the workflow with `approve` accepts an intended change. Building it found
      a real bug: Event Calendar's week view lost its header in 8 of 30 opens
      on Android, and now in none of 30. Checked with three full runs on an
      Android 16 emulator (Medium Phone API 36, Expo Go 57) of about 1.7 hours
      each, with no restarts. The last two matched on 663 of 666 compared
      shots, and the other 3 come from fixes made between them. Circular
      Progress's ring never holds still, so its 2 shots are listed instead of
      compared. Event Calendar's week view and the four player screens,
      opened 15 times in each mode, came out the same every time. It catches
      layout breaks on one Android screen, not what TalkBack reads. The
      workflow's first run on GitHub, on its PR, took all 668 shots in about an
      hour. Left: comparing two runs on GitHub, as a first run approves itself,
      and iOS.
- [ ] **A timing check.** A script that switches color mode and mounts a
      heavy screen on a production bundle and reports the time and the
      number of springs, so a regression like the 462 springs (Phase 10)
      shows up in numbers rather than by hand.

Not planned, from the same review: native controls by default (a native
iOS switch takes only track and thumb colors; the opt-in material preset
and `androidRipple` cover platform feel), replacing Tamagui's Sheet with
@gorhom/bottom-sheet or iOS sheets (it would reopen Select, Dropdown Menu,
the back button and screen reader hiding, and iOS sheets need a native
module, which ends Expo Go support), and a Tamagui compiler audit (neither
app uses the compiler).
