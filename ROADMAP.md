# Roadmap

Components still to be built are listed in
[`packages/catalog/src/roadmap.ts`](packages/catalog/src/roadmap.ts); the docs
show them as "Planned". That list is empty now: phases 1 to 5 are built.

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
- [ ] **Rich Text Editor: decide.** It is a Markdown editor (toolbar,
      shortcuts, preview), the same on every platform with no extra
      dependencies. Keep it, or ask for a WYSIWYG editor, which needs new
      libraries (TipTap on web, a WebView-based editor on iOS and Android).
- [x] **Form: decided** on 2026-10-05. Nothing else holds Form back from
      `stable`, though the new disabled behavior has only been checked by a
      native unit test, not on a phone.
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
- [x] **Try the new packages.** 0.6.0 is the first working release of
      `@advui/data`, `@advui/charts` and `@advui/editor`; their 0.5.0,
      published by mistake before the version bump, is deprecated. On
      2026-10-05 a fresh Next.js app with all six packages at 0.11.0 built and
      rendered `DataTable`, `BarChart` and `RichTextEditor` once
      `react-native-web` was added (the install guide now says to add it).
      Within a day of a release, pnpm 11 and later install the previous
      version: its `minimumReleaseAge` default skips newer ones.
