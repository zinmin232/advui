#!/usr/bin/env node
// Renames the project: display name, npm scope, CLI/package slug and short name.
//
//   pnpm rename --name "Acme UI"                       # slug acme-ui, scope @acme-ui
//   pnpm rename --name "Acme UI" --scope @acme --short AUI
//   pnpm rename --name "Acme UI" --dry-run             # list changes only
//
// Code identifiers (UniversalProvider, createUniversalConfig, …) are public API
// and are intentionally left alone. Afterwards run `pnpm install` (package names
// changed) and `pnpm build`; visual baselines that render the name need
// `pnpm --filter <scope>/docs test:visual:update`.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const root = fileURLToPath(new URL('..', import.meta.url))

// Updated by this script after each rename, so it always describes the repo.
const current = {
  name: 'Adv UI',
  slug: 'advui',
  scope: '@advui',
  short: 'aUI',
}
// Storage keys and CSS names use the lowercase short name (`uui-color-mode`);
// app ids use the slug without dashes (`dev.universalui.playground`).
const prefixOf = (names) => names.short.toLowerCase()
const compactOf = (names) => names.slug.replace(/-/g, '')

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    slug: { type: 'string' },
    scope: { type: 'string' },
    short: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
})

if (values.help || !values.name) {
  console.log(
    'Usage: pnpm rename --name "<Display Name>" [--slug <kebab-slug>] [--scope @scope] [--short ABC] [--dry-run]',
  )
  process.exit(values.help ? 0 : 1)
}

const toSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const next = {
  name: values.name.trim(),
  slug: values.slug ?? toSlug(values.name),
  scope: values.scope ?? `@${values.slug ?? toSlug(values.name)}`,
  short:
    values.short ??
    values.name
      .split(/\s+/)
      .map((word) => word[0] ?? '')
      .join('')
      .toUpperCase(),
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(next.slug)) {
  console.error(`Invalid slug "${next.slug}": use lowercase letters, digits and dashes.`)
  process.exit(1)
}
if (!/^@[a-z0-9][a-z0-9-]*$/.test(next.scope)) {
  console.error(`Invalid scope "${next.scope}": expected something like @acme.`)
  process.exit(1)
}
if (!/^[a-z][a-z0-9]*$/i.test(next.short)) {
  console.error(`Invalid short name "${next.short}": use letters and digits only.`)
  process.exit(1)
}

const ignoredDirs = new Set([
  'node_modules',
  '.git',
  '.next',
  'out',
  '.turbo',
  '.expo',
  'dist',
  'test-results',
  'playwright-report',
])
const textExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdx',
  '.yaml',
  '.yml',
  '.css',
  '.html',
  '.svg',
  '.txt',
])

// Order matters: the scope contains the slug, so it is replaced first.
const replacements = [
  [current.scope, next.scope],
  [current.name, next.name],
  [current.slug, next.slug],
  [compactOf(current), compactOf(next)],
  [`${prefixOf(current)}-`, `${prefixOf(next)}-`],
  [`'${current.short}'`, `'${next.short}'`],
]

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) yield* walk(join(dir, entry.name))
    } else if (textExtensions.has(extname(entry.name)) && entry.name !== 'rename.mjs') {
      yield join(dir, entry.name)
    }
  }
}

let changedFiles = 0
let totalHits = 0
for (const file of walk(root)) {
  if (statSync(file).size > 2_000_000) continue
  const source = readFileSync(file, 'utf8')
  let output = source
  let hits = 0
  for (const [from, to] of replacements) {
    if (from === to) continue
    const parts = output.split(from)
    hits += parts.length - 1
    output = parts.join(to)
  }
  if (output === source) continue
  changedFiles++
  totalHits += hits
  console.log(
    `${values['dry-run'] ? 'would update' : 'updated'}  ${relative(root, file)}  (${hits})`,
  )
  if (!values['dry-run']) writeFileSync(file, output)
}

console.log(
  `\n${values['dry-run'] ? 'Dry run: ' : ''}${totalHits} replacements in ${changedFiles} files ` +
    `(${current.name} → ${next.name}, ${current.scope} → ${next.scope}, ${current.slug} → ${next.slug}).`,
)
if (!values['dry-run'] && changedFiles > 0) {
  // Record the new names so the next rename starts from them.
  const self = fileURLToPath(import.meta.url)
  const source = readFileSync(self, 'utf8').replace(
    /const current = \{[^}]*\}/,
    `const current = {\n  name: '${next.name}',\n  slug: '${next.slug}',\n  scope: '${next.scope}',\n  short: '${next.short}',\n}`,
  )
  writeFileSync(self, source)
  console.log('Next: pnpm install && pnpm build && pnpm test')
}
