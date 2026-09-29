# Roadmap

Components still to be built are listed in
[`packages/ui/src/meta/roadmap.ts`](packages/ui/src/meta/roadmap.ts); the docs
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
      new `-win32.png` files (78 examples added in phases 4 and 5, plus 8 for Form).
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
  - Form: in the Loading example press Save activity; it must save once,
    TalkBack / VoiceOver should read "Saving…" on the busy button, and the
    Disabled example's fields must not be editable.
  - Video and Audio Player: sound plays, seeking works, the speed button
    changes the speed.
- [ ] **Rich Text Editor: decide.** It is a Markdown editor (toolbar,
      shortcuts, preview), the same on every platform with no extra
      dependencies. Keep it, or ask for a WYSIWYG editor, which needs new
      libraries (TipTap on web, a WebView-based editor on iOS and Android).
- [ ] **Demo media.** The Video and Audio Player examples use MDN's public CC0
      samples. Swap in your own if you prefer, and add a captions `.vtt` file for
      any video with speech.
- [ ] **Promote to stable.** When a component passes the phone check, change
      its `status` from `beta` to `stable` in its `*.meta.ts` and run
      `pnpm catalog`.
- [ ] **Release 0.6.0.** Bump the package versions and date the CHANGELOG's
      Unreleased section (see [CONTRIBUTING.md](CONTRIBUTING.md)).
