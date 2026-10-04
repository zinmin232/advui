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

- [ ] **Windows screenshots.** Run `pnpm install`, then
      `pnpm --filter @advui/docs test:visual:update` on Windows and commit the
      new `-win32.png` files (78 examples added in phases 4 and 5, 8 for Form
      and 4 for Grid).
- [ ] **Real phones.** Run `pnpm install` (the Expo playground uses `expo-video`
      and `expo-audio`; Expo Go SDK 57 includes both, a development build needs
      rebuilding), start `pnpm --filter @advui/expo-playground android:emulator`
      and check these 26 components on an Android phone, and on an iPhone if
      you can:
  - Stat, KPI Card, List, Timeline, Image
  - Table, Pagination, Stepper, Data Table, Tree View
  - Navigation Menu, Sidebar
  - Search, Command Palette, Image Gallery
  - Bar Chart, Line Chart, Area Chart, Pie Chart
  - Resizable Panel, Data Grid, Video, Audio Player, Rich Text Editor
  - Loading Button: press Save twice quickly in the Async example; it must
    save once, and TalkBack / VoiceOver should read "Saving…" and report the
    button as busy and unavailable.
  - Form: in the Loading example press Save activity twice quickly; it must
    save once, and TalkBack / VoiceOver should read "Saving…" on the busy
    button. The title should be read as a heading, the Disabled example's
    fields must not be editable, and the Horizontal example's field and
    Search button must fit the screen.
  - Video and Audio Player: sound plays, seeking works, the speed button
    changes the speed.
  - Grid (0.7.0 spans): on a tablet, or a phone in landscape at 768pt or
    wider, Two columns splits 8 / 4 and Sidebar 3 / 9; in portrait on a
    phone both stack. In Offset the first row is centered from md. Rotating
    the device switches between the two.
  - Stack, Wrap, Container and Separator (0.9.0): the Android phone was
    checked on 2026-10-04 (column layouts, Wrap, gutter, labelled separator).
    Still to check: an iPhone, and a tablet or landscape phone at 768pt or
    wider, where Responsive direction becomes a row and Toolbar a single line.
    With TalkBack / VoiceOver on, a labelled Separator with
    `decorative={false}` is read once, as its label.
  - The components that moved to `@advui/data`, `@advui/charts` and
    `@advui/editor` still open in the Expo app (it now loads them from those
    packages).
- [ ] **Rich Text Editor: decide.** It is a Markdown editor (toolbar,
      shortcuts, preview), the same on every platform with no extra
      dependencies. Keep it, or ask for a WYSIWYG editor, which needs new
      libraries (TipTap on web, a WebView-based editor on iOS and Android).
- [ ] **Form: decide.** Three API choices to settle before Form is `stable`:
  - A disabled Form disables controls inside a Field and `Form.Submit`
    only. Keep that, or also make plain Input, Textarea, Select, Checkbox,
    Switch and Radio Group follow it through `useFormStatus()`.
  - Keep the hook name `useFormStatus`, or rename it: React DOM has a hook with
    the same name for Server Actions, which could confuse Next.js users.
  - Add a Form playground to the docs page, or keep the eight examples only.
- [ ] **Demo media.** The Video and Audio Player examples use MDN's public CC0
      samples. Swap in your own if you prefer, and add a captions `.vtt` file for
      any video with speech.
- [ ] **Promote to stable.** When a component passes the phone check, change
      its `status` from `beta` to `stable` in its `*.meta.ts` and run
      `pnpm catalog`.
- [ ] **Release 0.6.0.** The release commit (versions, dated CHANGELOG,
      registry, docs) is on `main`. The first `pnpm release` ran before it, so
      publish again from that commit (see [CONTRIBUTING.md](CONTRIBUTING.md)):
  - Move the tag to the release commit: `git pull`, then
    `git tag -f v0.6.0 && git push -f origin v0.6.0`.
  - `pnpm release:check` must list all eight public packages at 0.6.0, with
    `@advui/core` as a `^0.6.0` peer dependency of data, charts and editor.
    Then run `pnpm release`.
- [ ] **Release 0.7.0** (Grid spans, Field). The AdvUI Builder reads
      component metadata from the `v0.7.0` tag, so tag the last commit of the
      0.7.0 pull request as it lands on `main`, and publish exactly that commit:
  - `git pull`, then `git tag v0.7.0 <commit> && git push origin v0.7.0`.
  - `pnpm release:check` must list all eight public packages at 0.7.0. Then
    run `pnpm release`.
- [ ] **Release 0.8.0** (metadata for the AdvUI Builder; no component changes
      at run time). The Builder reads component metadata from the `v0.8.0`
      tag, so tag the last commit of the 0.8.0 pull request as it lands on
      `main`, and publish exactly that commit:
  - `git pull`, then `git tag v0.8.0 <commit> && git push origin v0.8.0`.
  - `pnpm release:check` must list all eight public packages at 0.8.0. Then
    run `pnpm release`.
- [ ] **Release 0.9.0** (responsive Stack props, Wrap, Container gutter,
      labelled Separator). Tag the last commit of the 0.9.0 pull request as it
      lands on `main` (after 0.8.0), and publish exactly that commit:
  - `git pull`, then `git tag v0.9.0 <commit> && git push origin v0.9.0`.
  - `pnpm release:check` must list all eight public packages at 0.9.0. Then
    run `pnpm release`.
- [ ] **Publish the new packages.** 0.6.0 is the first working release of
      `@advui/data`, `@advui/charts` and `@advui/editor`:
  - Deprecate their 0.5.0, published by mistake before the version bump (it
    needs core and icons 0.6.0):
    `npm deprecate @advui/data@0.5.0 "Does not work: use 0.6.0 or later"`,
    and the same for `@advui/charts` and `@advui/editor`.
  - Try the install in a fresh app:
    `pnpm add @advui/core @advui/data @advui/charts @advui/editor @advui/theme @advui/icons tamagui`,
    then import `DataTable`, `BarChart` and `RichTextEditor`.
