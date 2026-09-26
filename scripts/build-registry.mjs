#!/usr/bin/env node
// Builds the component registry consumed by the CLI (`adv-ui add <name>`)
// and served by the docs site at /r/<name>.json.
//
//   registry/index.json          – list of items
//   registry/<name>.json         – files (with content), dependencies, examples
//   apps/docs/public/r/*.json    – same files, published with the docs
//
// Dependencies are derived from import statements, so metadata never drifts
// from the source: bare imports become npm dependencies, relative imports into
// another component become registry dependencies.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import {
  componentsDir,
  loadCatalog,
  repoRoot,
  toPosix,
  uiSrc,
  validateCatalog,
} from './lib/catalog.mjs'

const PEER_PACKAGES = new Set(['react', 'react-native', 'react-dom', 'tamagui', 'react-native-svg'])
const uiPackage = JSON.parse(readFileSync(join(repoRoot, 'packages/ui/package.json'), 'utf8'))
const registryDir = join(repoRoot, 'registry')
const publicDir = join(repoRoot, 'apps/docs/public/r')

const entries = loadCatalog()
const problems = validateCatalog(entries)
if (problems.length) {
  console.error(`Fix catalog problems first:\n  - ${problems.join('\n  - ')}`)
  process.exit(1)
}

// --- library-internal items (hooks, provider) -----------------------------------------
const listDir = (dir) =>
  readdirSync(join(uiSrc, dir))
    .filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.'))
    .map((f) => `${dir}/${f}`)

const libItems = [
  {
    name: 'hooks',
    title: 'Hooks',
    type: 'registry:lib',
    description: 'Shared hooks: controllable state and reduced-motion detection.',
    files: listDir('hooks'),
  },
  {
    name: 'provider',
    title: 'UniversalProvider',
    type: 'registry:lib',
    description: 'Root provider: Tamagui config, color mode, icons, toasts, global styles.',
    files: [...listDir('provider'), 'types.ts'],
  },
]

const componentItems = entries.map(({ meta, dir }) => ({
  name: meta.slug,
  title: meta.name,
  type: 'registry:component',
  description: meta.description,
  category: meta.category,
  status: meta.status,
  since: meta.since,
  platforms: meta.platforms,
  files: withNativeVariants(meta.files),
  examples: meta.examples.map((example) => ({
    name: example.name,
    title: example.title,
    code: readFileSync(join(componentsDir, dir, 'examples', `${example.name}.tsx`), 'utf8'),
  })),
  docs: `/docs/components/${meta.slug}`,
}))

const items = [...libItems, ...componentItems]
const owner = new Map()
for (const item of items)
  for (const file of item.files) if (!owner.has(file)) owner.set(file, item.name)

for (const item of items) {
  const npm = new Set()
  const peers = new Set()
  const registryDeps = new Set()
  for (const file of item.files) {
    const source = readFileSync(join(uiSrc, file), 'utf8')
    for (const spec of importSpecifiers(source)) {
      if (spec.startsWith('.')) {
        const target = resolveRelative(file, spec)
        const dep = target && owner.get(target)
        if (dep && dep !== item.name) registryDeps.add(dep)
        if (!target) throw new Error(`${file}: cannot resolve "${spec}"`)
      } else {
        const pkg = spec.startsWith('@')
          ? spec.split('/').slice(0, 2).join('/')
          : spec.split('/')[0]
        ;(PEER_PACKAGES.has(pkg) ? peers : npm).add(pkg)
      }
    }
  }
  item.dependencies = [...npm].sort()
  item.peerDependencies = [...peers].sort()
  item.registryDependencies = [...registryDeps].sort()
}

// --- write -----------------------------------------------------------------------------------
rmSync(registryDir, { recursive: true, force: true })
mkdirSync(registryDir, { recursive: true })

for (const item of items) {
  const output = {
    $schema: 'https://zinmin232.github.io/advui/schema/registry-item.json',
    ...item,
    version: uiPackage.version,
    files: item.files.map((file) => ({
      path: file,
      type: file.includes('/hooks/') || file.startsWith('hooks/') ? 'registry:hook' : 'registry:ui',
      content: readFileSync(join(uiSrc, file), 'utf8'),
    })),
  }
  writeFileSync(join(registryDir, `${item.name}.json`), `${JSON.stringify(output, null, 2)}\n`)
}

const index = {
  name: 'adv-ui',
  version: uiPackage.version,
  items: items.map(
    ({ name, title, type, description, category, status, dependencies, registryDependencies }) => ({
      name,
      title,
      type,
      description,
      category,
      status,
      dependencies,
      registryDependencies,
    }),
  ),
}
writeFileSync(join(registryDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)

rmSync(publicDir, { recursive: true, force: true })
mkdirSync(dirname(publicDir), { recursive: true })
cpSync(registryDir, publicDir, { recursive: true })

console.log(`Registry: ${items.length} items → registry/ and apps/docs/public/r/`)

// --- helpers ---------------------------------------------------------------------------------
function withNativeVariants(files) {
  const result = new Set(files)
  for (const file of files) {
    const native = file.replace(/\.(tsx?)$/, '.native.$1')
    if (existsSync(join(uiSrc, native))) result.add(native)
  }
  return [...result]
}

function importSpecifiers(source) {
  const specs = []
  const pattern = /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g
  for (const match of source.matchAll(pattern)) specs.push(match[1] ?? match[2])
  return specs
}

function resolveRelative(fromFile, spec) {
  const base = resolve(join(uiSrc, dirname(fromFile)), spec)
  const candidates = [`${base}.tsx`, `${base}.ts`, join(base, 'index.ts'), join(base, 'index.tsx')]
  const hit = candidates.find((candidate) => existsSync(candidate))
  return hit ? toPosix(relative(uiSrc, hit)) : null
}
