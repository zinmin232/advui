# Roadmap

Components still to be built are listed in
[`packages/catalog/src/roadmap.ts`](packages/catalog/src/roadmap.ts); the docs
show them as "Planned". Phases 1 to 7 are done and phases 8 and 9 are
planned. Phase 10, at the end of this file, holds the checks and decisions
still open.

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

## Phases 7–9 (7 built, 8 and 9 planned)

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

## Phase 10: open checks and decisions

Carried over from Phase 6. They need a person, an iPhone or a decision, so
CI and AI agents cannot close them. To run the Expo playground on a phone:
`pnpm install`, then `pnpm --filter @advui/expo-playground android:emulator`
(Android over USB or an emulator) or `pnpm --filter @advui/expo-playground ios`
(macOS).

- [ ] **Rich Text Editor: decide.** It is a Markdown editor (toolbar,
      shortcuts, preview), the same on every platform with no extra
      dependencies. Keep it, or ask for a WYSIWYG editor, which needs new
      libraries (TipTap on web, a WebView-based editor on iOS and Android).
      It stays `beta` until then; it is the last component in `beta`.
- [ ] **iPhone.** Nothing has been checked on iOS yet. Look closely at Tags
      Input's Backspace, the sheets that stop below the status bar, and the
      announcements made with `AccessibilityInfo`.
- [ ] **TalkBack and VoiceOver by ear.** The Android checks read the
      accessibility tree, not speech, and Android puts hints (descriptions,
      help text, group names) in tooltip text, which `uiautomator` does not
      show. Listen for:
  - announcements: Copy Button's result, Tags Input's added and removed
    tags, Carousel's position;
  - names: a labelled Separator with `decorative={false}`, read once; a
    named Section; AppShell's drawer ("Docs");
  - double reads: a List whose rows are not buttons gets their text as its
    own label from React Native;
  - focus after a chip's remove button is pressed (web moves it to the next
    chip);
  - Video and Audio Player's sound (the Android phone's media volume was 0).
- [ ] **A phone with the stock font.** The TECNO's system font replaces
      monospace in every app, so Code Block, `Text mono` and Kbd were never
      seen monospaced on Android.
- [x] **Presses that fire after a slide-off on iOS and Android.** Fixed by
      the move to Tamagui 3 (unreleased): it hands presses to React Native's
      Pressability, which cancels a press when the finger leaves the view.
      Native tests cover Button, FAB, Accordion trigger and List Item row
      (`press.native.test.tsx`). Still to see on a phone; see the next item.
- [ ] **Tamagui 3 on a phone.** The move changed how every component styles
      itself (flat values, unstyled primitives, Pressability), and only the
      web and Jest suites have run on it. Go through the components again on
      Android and an iPhone, in light and dark mode: press, hover-free touch
      feedback and the ripple, dashed borders (Empty State, Loading State,
      File Dropzone), sheets (Select, Dropdown Menu, Combobox), Drawer and
      Dialog motion, and TalkBack names and roles (Select options, Password
      Input's toggle).
