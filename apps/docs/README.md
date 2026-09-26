# @adv-ui/docs

The documentation site (Next.js 16, App Router, Turbopack).

```bash
pnpm dev                                    # from the repo root → http://localhost:3000
pnpm --filter @adv-ui/docs build
pnpm --filter @adv-ui/docs test:e2e   # builds are served with `next start` on :3100
pnpm --filter @adv-ui/docs test:visual:update
```

Component pages, search and the sidebar are generated from component metadata
(`packages/ui/src/components/*/*.meta.ts`). Guides live in `src/content/guides`.
Branding and links are in `src/lib/site.ts`.

Locally, Playwright uses the installed Chrome (`channel: 'chrome'`); CI uses
the bundled Chromium. Visual baselines are per-OS: `*-win32.png` locally and
`*-linux.png` in CI. The "Update visual baselines" workflow regenerates the
Linux set.
