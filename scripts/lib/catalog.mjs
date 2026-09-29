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

/**
 * Folders of the published component packages, in dependency order: each may
 * import the ones before it. Every package keeps its components in
 * `src/components/<slug>/`; the catalog, registry and generator read them all.
 */
export const PACKAGE_DIRS = ['packages/ui']

export const componentPackages = PACKAGE_DIRS.map((dir) => {
  const root = join(repoRoot, dir)
  const { name, description } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const src = join(root, 'src')
  return { dir, name, description, src, componentsDir: join(src, 'components') }
})

/** `@advui/core`: owns the shared hooks, utils and provider. */
export const corePackage = componentPackages[0]
export const uiSrc = corePackage.src
export const componentsDir = corePackage.componentsDir

/** The private package that holds the generated catalog for the docs and Expo. */
export const catalogSrc = join(repoRoot, 'packages', 'catalog', 'src')

export function packageByName(name) {
  const pkg = componentPackages.find((candidate) => candidate.name === name)
  if (!pkg) {
    const names = componentPackages.map((candidate) => candidate.name).join(', ')
    throw new Error(`Unknown package "${name}". Use one of: ${names}`)
  }
  return pkg
}

export const toPosix = (p) => p.split(sep).join('/')

/** Evaluates a `*.meta.ts` file and returns its default export. */
export function loadMetaFile(file) {
  const source = readFileSync(file, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const module = { exports: {} }
  const localRequire = (id) => {
    // Core's metadata imports its own types; the other packages import core's.
    if (id.endsWith('meta/types') || id === `${corePackage.name}/meta`)
      return { defineMeta: (meta) => meta, categories: [] }
    throw new Error(
      `${file}: metadata files may only import defineMeta from ${corePackage.name}/meta (found "${id}")`,
    )
  }
  new Function('module', 'exports', 'require', outputText)(module, module.exports, localRequire)
  return module.exports.default
}

/** Every component metadata file with its package and folder. */
export function findMetaFiles() {
  const result = []
  for (const pkg of componentPackages) {
    if (!existsSync(pkg.componentsDir)) continue
    for (const dir of readdirSync(pkg.componentsDir)) {
      const full = join(pkg.componentsDir, dir)
      if (!statSync(full).isDirectory()) continue
      for (const file of readdirSync(full)) {
        if (file.endsWith('.meta.ts')) result.push({ pkg, dir, file: join(full, file) })
      }
    }
  }
  return result.sort((a, b) => a.file.localeCompare(b.file))
}

export function loadCatalog() {
  return findMetaFiles().map(({ pkg, dir, file }) => ({ pkg, dir, file, meta: loadMetaFile(file) }))
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
  const source = readFileSync(join(catalogSrc, 'roadmap.ts'), 'utf8')
  return [...source.matchAll(/slug: '([^']+)'/g)].map((m) => m[1])
}

/** Validates the catalog; returns a list of human-readable problems. */
export function validateCatalog(entries) {
  const problems = []
  const slugs = new Set()
  const planned = new Set(roadmapSlugs())
  for (const { pkg, dir, file, meta } of entries) {
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
      if (!existsSync(join(pkg.src, f)))
        problems.push(`${where}: listed file "${f}" does not exist`)
    }
    for (const example of meta.examples ?? []) {
      const exampleFile = join(pkg.componentsDir, dir, 'examples', `${example.name}.tsx`)
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
  for (const { pkg, dir, meta } of entries) {
    const key = join(pkg.componentsDir, dir)
    const names = byDir.get(key) ?? new Set()
    for (const e of meta?.examples ?? []) names.add(e.name)
    byDir.set(key, names)
  }
  for (const [folder, names] of byDir) {
    const exDir = join(folder, 'examples')
    if (!existsSync(exDir)) continue
    for (const f of readdirSync(exDir)) {
      const name = f.replace(/\.tsx$/, '')
      if (f.endsWith('.tsx') && !names.has(name)) {
        const where = toPosix(relative(repoRoot, join(exDir, f)))
        problems.push(`${where}: not listed in any metadata file in its folder`)
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
