# Roadmap

Components still to be built are listed in
[`packages/catalog/src/roadmap.ts`](packages/catalog/src/roadmap.ts); the docs
show them as "Planned". Phases 1 to 7 are done, phase 8 has started and
phase 9 is planned. Phase 10, at the end of this file, holds the checks and
decisions still open.

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

## Phases 7–9 (7 built, 8 started, 9 planned)

Common components that other libraries (shadcn/ui, MUI, Mantine, Chakra, Ant
Design) have and Adv UI does not yet. Scaffold one with
`pnpm create-component <slug>`: it takes the name, category and package from
the roadmap entry. Banner, Segmented Control, Avatar Group, Range Slider,
Lightbox and Donut are not listed because Alert, Toggle Group, Avatar, Slider,
Image Gallery and Pie Chart already cover them.

Built so far (the table keeps them for reference): Link, Input Group as
slots on Input (`leading`, `trailing`, `leadingAddon`, `trailingAddon`),
Checkbox Group, Tags Input, Carousel, Rating, Color Picker, Copy Button,
Code Block and Menubar. Phase 7 is complete. Phase 8 has Visually Hidden,
Indicator and Date Time Picker.

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
  its own. **Portal** exists in Tamagui and may only need to be re-exported
  and documented, with the native portal pitfalls in AGENTS.md.
- **Date Time Picker** landed as a Date Picker and a Time Picker side by
  side rather than one panel with a calendar and time selects, so no
  overlay opens inside another (a sheet inside a sheet on phones). Its
  `min` and `max` limit the days only: limiting the times on those days
  needs a `min` and `max` on Time Picker first.

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

- [ ] **Rich Text Editor: decide.** It is a Markdown editor (toolbar,
      shortcuts, preview), the same on every platform with no extra
      dependencies. Keep it, or ask for a WYSIWYG editor, which needs new
      libraries (TipTap on web, a WebView-based editor on iOS and Android).
      It stays `beta` until then.

### Android

Run `pnpm --filter @advui/expo-playground android:emulator` (a phone over
USB or an emulator). Checked so far on a TECNO KM9 (Android 16, Expo Go).
Expo Go must match the project's SDK (57): install its APK with `adb push`
and `adb shell pm install`, since a 200 MB `adb install` dropped the USB
link.

- [ ] **Tamagui 3.1.3.** Switch light and dark mode with Checkbox, Radio
      Group, Switch, Tabs, Dialog, a Sheet and Text on screen; open and
      close the Select and Dropdown Menu sheets; and slide a finger off a
      button to see the press cancel.
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
      “Notifications, 3 unread”, with no count. Left: hear it, and see a
      count on a button with `androidRipple` on, which clips the button's
      content (the playground has no switch for it).
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
