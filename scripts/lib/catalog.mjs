// Shared helpers for catalog generation, registry building and component scaffolding.
// Metadata files are TypeScript; we transpile them with the repo's own TypeScript
// compiler (no extra dependencies) and evaluate them with a stubbed `defineMeta`.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const uiSrc = join(repoRoot, 'packages', 'ui', 'src')
export const componentsDir = join(uiSrc, 'components')

export const toPosix = (p) => p.split(sep).join('/')

/** Evaluates a `*.meta.ts` file and returns its default export. */
export function loadMetaFile(file) {
  const source = readFileSync(file, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const module = { exports: {} }
  const localRequire = (id) => {
    if (id.endsWith('meta/types')) return { defineMeta: (meta) => meta, categories: [] }
    throw new Error(`${file}: metadata files may only import ../../meta/types (found "${id}")`)
  }
  new Function('module', 'exports', 'require', outputText)(module, module.exports, localRequire)
  return module.exports.default
}

/** Every component metadata file with its folder. */
export function findMetaFiles() {
  const result = []
  for (const dir of readdirSync(componentsDir)) {
    const full = join(componentsDir, dir)
    if (!statSync(full).isDirectory()) continue
    for (const file of readdirSync(full)) {
      if (file.endsWith('.meta.ts')) result.push({ dir, file: join(full, file) })
    }
  }
  return result.sort((a, b) => a.file.localeCompare(b.file))
}

export function loadCatalog() {
  return findMetaFiles().map(({ dir, file }) => ({ dir, file, meta: loadMetaFile(file) }))
}

export const CATEGORY_IDS = [
  'foundations',
  'buttons',
  'forms',
  'layout',
  'navigation',
  'feedback',
  'overlay',
  'data-display',
  'media',
  'advanced',
  'charts',
]

export const STATUSES = ['stable', 'beta', 'experimental', 'deprecated', 'planned']

/** Reads roadmap slugs without evaluating TS (simple, stable format). */
export function roadmapSlugs() {
  const source = readFileSync(join(uiSrc, 'meta', 'roadmap.ts'), 'utf8')
  return [...source.matchAll(/slug: '([^']+)'/g)].map((m) => m[1])
}

/** Validates the catalog; returns a list of human-readable problems. */
export function validateCatalog(entries) {
  const problems = []
  const slugs = new Set()
  const planned = new Set(roadmapSlugs())
  for (const { dir, file, meta } of entries) {
    const where = toPosix(relative(repoRoot, file))
    if (!meta || typeof meta !== 'object') {
      problems.push(`${where}: no default export`)
      continue
    }
    for (const key of ['name', 'slug', 'category', 'description', 'status', 'since', 'usage']) {
      if (!meta[key]) problems.push(`${where}: missing "${key}"`)
    }
    if (slugs.has(meta.slug)) problems.push(`${where}: duplicate slug "${meta.slug}"`)
    slugs.add(meta.slug)
    if (planned.has(meta.slug))
      problems.push(`${where}: "${meta.slug}" is still listed in meta/roadmap.ts`)
    if (!CATEGORY_IDS.includes(meta.category))
      problems.push(`${where}: unknown category "${meta.category}"`)
    if (!STATUSES.includes(meta.status)) problems.push(`${where}: unknown status "${meta.status}"`)
    if (!meta.platforms?.length) problems.push(`${where}: "platforms" is empty`)
    if (!meta.accessibility?.length) problems.push(`${where}: document an accessibility strategy`)
    for (const f of meta.files ?? []) {
      if (!existsSync(join(uiSrc, f))) problems.push(`${where}: listed file "${f}" does not exist`)
    }
    for (const example of meta.examples ?? []) {
      const exampleFile = join(componentsDir, dir, 'examples', `${example.name}.tsx`)
      if (!existsSync(exampleFile)) problems.push(`${where}: example "${example.name}" has no file`)
    }
  }
  const known = new Set([...slugs, ...planned, 'theme', 'colors'])
  for (const { file, meta } of entries) {
    for (const related of meta?.related ?? []) {
      if (!known.has(related))
        problems.push(`${toPosix(relative(repoRoot, file))}: unknown related slug "${related}"`)
    }
  }
  // Every example file must be referenced by a meta in the same folder.
  const byDir = new Map()
  for (const { dir, meta } of entries) {
    const names = byDir.get(dir) ?? new Set()
    for (const e of meta?.examples ?? []) names.add(e.name)
    byDir.set(dir, names)
  }
  for (const [dir, names] of byDir) {
    const exDir = join(componentsDir, dir, 'examples')
    if (!existsSync(exDir)) continue
    for (const f of readdirSync(exDir)) {
      const name = f.replace(/\.tsx$/, '')
      if (f.endsWith('.tsx') && !names.has(name)) {
        problems.push(`components/${dir}/examples/${f}: not listed in any ${dir} metadata file`)
      }
    }
  }
  return problems
}

export const pascal = (value) =>
  value
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
