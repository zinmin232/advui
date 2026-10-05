#!/usr/bin/env node
// Builds the component registry consumed by the CLI (`advui add <name>`)
// and served by the docs site at /r/<name>.json.
//
//   registry/index.json          – list of items
//   registry/<name>.json         – files (with content), dependencies, examples
//   apps/docs/public/r/*.json    – same files, published with the docs
//
// Dependencies are derived from import statements, so metadata never drifts
// from the source: bare imports become npm dependencies, relative imports into
// another component become registry dependencies.
//
// Components live in several packages (@advui/core, @advui/data…), but the CLI
// copies every item into one folder. File paths are relative to each package's
// `src`, so they share one layout, and imports of a component package
// (`import { Input } from '@advui/core'`) are rewritten to the file that
// declares the name (`'../input/Input'`), so copied source stays self-contained.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join, posix } from 'node:path'
import {
  componentPackages,
  corePackage,
  loadCatalog,
  packageByName,
  repoRoot,
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

// --- library-internal items (hooks, utils, provider) ----------------------------------
const listDir = (pkg, dir) =>
  readdirSync(join(pkg.src, dir))
    .filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.'))
    .map((f) => `${dir}/${f}`)

const libItems = [
  {
    name: 'hooks',
    title: 'Hooks',
    type: 'registry:lib',
    description:
      'Shared hooks: controllable state, reduced-motion detection, the Android press ripple, Android back-button handling for overlays, the surrounding Form’s status, the window’s breakpoint and the AppShell drawer state.',
    pkg: corePackage,
    files: listDir(corePackage, 'hooks'),
  },
  {
    name: 'utils',
    title: 'Utilities',
    type: 'registry:lib',
    description: 'Small shared helpers used by several components.',
    pkg: corePackage,
    files: listDir(corePackage, 'utils'),
  },
  {
    name: 'charts',
    title: 'Chart internals',
    type: 'registry:lib',
    description:
      'Shared by the charts: the frame (legend, tooltip, table view), scales, axes and the SVG layer for web and native.',
    pkg: packageByName('@advui/charts'),
    files: listDir(packageByName('@advui/charts'), 'charts'),
  },
  {
    name: 'provider',
    title: 'UniversalProvider',
    type: 'registry:lib',
    description: 'Root provider: Tamagui config, color mode, icons, toasts, global styles.',
    pkg: corePackage,
    files: [...listDir(corePackage, 'provider'), 'types.ts'],
  },
]

const componentItems = entries.map(({ pkg, meta, dir }) => ({
  name: meta.slug,
  title: meta.name,
  type: 'registry:component',
  description: meta.description,
  category: meta.category,
  status: meta.status,
  since: meta.since,
  platforms: meta.platforms,
  package: pkg.name,
  pkg,
  files: withNativeVariants(pkg, meta.files),
  examples: meta.examples.map((example) => ({
    name: example.name,
    title: example.title,
    code: readFileSync(join(pkg.componentsDir, dir, 'examples', `${example.name}.tsx`), 'utf8'),
  })),
  docs: `/docs/components/${meta.slug}`,
}))

const items = [...libItems, ...componentItems]

// Every file, by its path in the shared layout. Two packages may not use the same path.
const fileRoot = new Map()
const owner = new Map()
for (const item of items) {
  for (const file of item.files) {
    const root = fileRoot.get(file)
    if (root && root !== item.pkg.src)
      throw new Error(`${file} exists in two packages; registry paths must be unique`)
    fileRoot.set(file, item.pkg.src)
    if (!owner.has(file)) owner.set(file, item.name)
  }
}

const exportsOf = new Map(componentPackages.map((pkg) => [pkg.name, exportedNames(pkg)]))
const content = new Map()
for (const item of items) {
  for (const file of item.files)
    content.set(file, localizeImports(file, readFileSync(join(item.pkg.src, file), 'utf8')))
}

for (const item of items) {
  const npm = new Set()
  const peers = new Set()
  const registryDeps = new Set()
  for (const file of item.files) {
    for (const spec of importSpecifiers(content.get(file))) {
      if (spec.startsWith('.')) {
        const target = resolveRelative(file, spec)
        const dep = target && owner.get(target)
        if (!target) throw new Error(`${file}: cannot resolve "${spec}"`)
        // Every imported file must ship with some registry item, or `add` breaks.
        if (!dep) throw new Error(`${file}: "${spec}" is not part of any registry item`)
        if (dep !== item.name) registryDeps.add(dep)
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

for (const { pkg: _pkg, ...item } of items) {
  const output = {
    $schema: 'https://zinmin232.github.io/advui/schema/registry-item.json',
    ...item,
    version: uiPackage.version,
    files: item.files.map((file) => ({
      path: file,
      type: file.includes('/hooks/') || file.startsWith('hooks/') ? 'registry:hook' : 'registry:ui',
      content: content.get(file),
    })),
  }
  writeFileSync(join(registryDir, `${item.name}.json`), `${JSON.stringify(output, null, 2)}\n`)
}

const index = {
  name: 'advui',
  version: uiPackage.version,
  items: items.map(
    ({
      name,
      title,
      type,
      description,
      category,
      status,
      package: packageName,
      dependencies,
      registryDependencies,
    }) => ({
      name,
      title,
      type,
      description,
      category,
      status,
      package: packageName,
      dependencies,
      registryDependencies,
    }),
  ),
}
writeFileSync(join(registryDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)

rmSync(publicDir, { recursive: true, force: true })
mkdirSync(join(publicDir, '..'), { recursive: true })
cpSync(registryDir, publicDir, { recursive: true })

console.log(`Registry: ${items.length} items → registry/ and apps/docs/public/r/`)

// --- helpers ---------------------------------------------------------------------------------
function withNativeVariants(pkg, files) {
  const result = new Set(files)
  for (const file of files) {
    const native = file.replace(/\.(tsx?)$/, '.native.$1')
    if (existsSync(join(pkg.src, native))) result.add(native)
  }
  return [...result]
}

function importSpecifiers(source) {
  const specs = []
  const pattern = /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g
  for (const match of source.matchAll(pattern)) specs.push(match[1] ?? match[2])
  return specs
}

/** Resolves a relative import in the shared layout, to a file of any package. */
function resolveRelative(fromFile, spec) {
  const base = posix.normalize(posix.join(posix.dirname(fromFile), spec))
  const candidates = [`${base}.tsx`, `${base}.ts`, `${base}/index.ts`, `${base}/index.tsx`]
  return candidates.find((candidate) => fileRoot.has(candidate)) ?? null
}

/** Same as resolveRelative, inside one package on disk (used before the layout is known). */
function resolveInPackage(pkg, fromFile, spec) {
  const base = posix.normalize(posix.join(posix.dirname(fromFile), spec))
  const candidates = [`${base}.tsx`, `${base}.ts`, `${base}/index.ts`, `${base}/index.tsx`]
  return candidates.find((candidate) => existsSync(join(pkg.src, candidate))) ?? null
}

/**
 * Where each public name of a package is declared: `{ file, name }` for our
 * source, `{ module, name }` for re-exports of other packages (`useTheme` → tamagui).
 */
function exportedNames(pkg) {
  const names = new Map()
  const seen = new Set()
  const visit = (file) => {
    if (seen.has(file)) return
    seen.add(file)
    const source = readFileSync(join(pkg.src, file), 'utf8')
    for (const [, , list, spec] of source.matchAll(
      /export\s+(type\s+)?\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]/g,
    )) {
      const target = spec.startsWith('.') ? resolveInPackage(pkg, file, spec) : null
      if (spec.startsWith('.') && !target)
        throw new Error(`${pkg.name} ${file}: cannot resolve "${spec}"`)
      for (const specifier of splitSpecifiers(list)) {
        const found = target
          ? declaredIn(target, specifier.name)
          : { module: spec, name: specifier.name }
        names.set(specifier.alias ?? specifier.name, found)
      }
    }
    for (const [, spec] of source.matchAll(/export\s+\*\s+from\s+['"]([^'"]+)['"]/g)) {
      const target = resolveInPackage(pkg, file, spec)
      if (!target) throw new Error(`${pkg.name} ${file}: cannot resolve "${spec}"`)
      visit(target)
    }
    for (const [, name] of source.matchAll(
      /export\s+(?:declare\s+)?(?:async\s+)?(?:const|let|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g,
    ))
      if (!names.has(name)) names.set(name, { file, name })
  }
  // Follows `export { A } from './a'` to the file that declares A, so the rewritten
  // import points at the source file (as hand-written code does), not a barrel.
  const declaredIn = (file, name) => {
    const source = readFileSync(join(pkg.src, file), 'utf8')
    const declared = new RegExp(
      `export\\s+(?:declare\\s+)?(?:async\\s+)?(?:const|let|function|class|interface|type|enum)\\s+${name}\\b`,
    )
    if (declared.test(source)) return { file, name }
    for (const [, , list, spec] of source.matchAll(
      /export\s+(type\s+)?\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]/g,
    )) {
      const specifier = splitSpecifiers(list).find((s) => (s.alias ?? s.name) === name)
      if (!specifier) continue
      if (!spec.startsWith('.')) return { module: spec, name: specifier.name }
      return declaredIn(resolveInPackage(pkg, file, spec), specifier.name)
    }
    for (const [, spec] of source.matchAll(/export\s+\*\s+from\s+['"]([^'"]+)['"]/g)) {
      const target = resolveInPackage(pkg, file, spec)
      const found = target && declaredIn(target, name)
      if (found) return found
    }
    // Declared as `export { A }` at the bottom of the file, or not a declaration we parse.
    return { file, name }
  }
  visit('index.ts')
  return names
}

function splitSpecifiers(list) {
  return list
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const isType = part.startsWith('type ')
      const [name, alias] = part.replace(/^type\s+/, '').split(/\s+as\s+/)
      return { name: name.trim(), alias: alias?.trim(), isType }
    })
}

/** Rewrites `import { A } from '@advui/core'` into imports of the files that declare A. */
function localizeImports(file, source) {
  const packageNames = componentPackages.map((pkg) => pkg.name)
  const pattern = /import\s+(type\s+)?\{([^}]*)\}\s+from\s+['"]([^'"]+)['"][ \t]*\n?/g
  return source.replace(pattern, (statement, typeOnly, list, spec) => {
    if (!packageNames.includes(spec)) return statement
    const exported = exportsOf.get(spec)
    const groups = new Map()
    for (const specifier of splitSpecifiers(list)) {
      const target = exported.get(specifier.name)
      if (!target) throw new Error(`${file}: ${spec} does not export "${specifier.name}"`)
      const from = target.file ? relativeImport(file, target.file) : target.module
      const local = specifier.alias ?? specifier.name
      const text = `${specifier.isType ? 'type ' : ''}${target.name}${target.name === local ? '' : ` as ${local}`}`
      groups.set(from, [...(groups.get(from) ?? []), text])
    }
    return [...groups]
      .map(([from, names]) => `import ${typeOnly ?? ''}{ ${names.join(', ')} } from '${from}'\n`)
      .join('')
  })
}

function relativeImport(fromFile, toFile) {
  const path = posix.relative(posix.dirname(fromFile), toFile.replace(/\.tsx?$/, ''))
  return path.startsWith('.') ? path : `./${path}`
}
