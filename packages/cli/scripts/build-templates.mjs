#!/usr/bin/env node
// Copies the starter app templates into dist/templates for `advui create`,
// with the screens from examples/src that each one shows. The screens are
// copied at build time rather than kept in the templates, so a starter app
// always has the examples as they are now.
// Usage: node scripts/build-templates.mjs [outDir]
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const cli = dirname(dirname(fileURLToPath(import.meta.url)))
const examples = join(cli, '../../examples/src')
const out = resolve(process.argv[2] ?? join(cli, 'dist/templates'))

/** The example files each template's `screens/` folder gets. */
const screens = {
  next: ['dashboard.tsx', 'login.tsx', 'settings.tsx', 'shared.tsx'],
  expo: ['dashboard.tsx', 'mobile.tsx', 'shared.tsx'],
}

// Next.js pages are Server Components, and the screens hold state.
const banner = { next: "'use client'\n\n", expo: '' }

rmSync(out, { recursive: true, force: true })
for (const [template, files] of Object.entries(screens)) {
  cpSync(join(cli, 'templates', template), join(out, template), { recursive: true })
  mkdirSync(join(out, template, 'screens'), { recursive: true })
  for (const file of files)
    writeFileSync(
      join(out, template, 'screens', file),
      banner[template] + readFileSync(join(examples, file), 'utf8'),
    )
}
