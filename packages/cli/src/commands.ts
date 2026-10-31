import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, relative } from 'node:path'
import {
  type CliConfig,
  type InstalledItem,
  defaultConfig,
  readConfig,
  writeConfig,
} from './config.js'
import {
  BASE_DEPENDENCIES,
  CLI_NAME,
  CONFIG_FILE,
  DEFAULT_REGISTRY,
  PACKAGE_SCOPE,
  PRODUCT_NAME,
} from './constants.js'
import { unifiedDiff } from './diff.js'
import { type Framework, type ProjectInfo, detectProject, installCommand } from './project.js'
import {
  type RegistryIndex,
  type RegistryItem,
  collectDependencies,
  fetchRegistryJson,
  fileHash,
  hashContent,
  resolveItems,
} from './registry.js'
import { type FilePlan, type FileStatus, type ItemPlan, planItems } from './sync.js'

export interface CommonOptions {
  cwd: string
  registry?: string
  install: boolean
  overwrite: boolean
  log: (message: string) => void
}

const frameworkPeers: Record<Framework, string[]> = {
  next: ['react-native-web', 'react-native'],
  expo: ['react-native-svg'],
  'react-native': ['react-native-svg'],
  vite: ['react-native-web', 'react-native'],
  unknown: [],
}

const setupNotes: Record<Framework, string> = {
  next: `Next.js: add to next.config.ts
  transpilePackages: ['${PACKAGE_SCOPE}/theme', '${PACKAGE_SCOPE}/icons', '${PACKAGE_SCOPE}/utils', 'react-native-web'],
  turbopack: { resolveAlias: { 'react-native': 'react-native-web' },
    resolveExtensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'] }
and wrap your root layout in a 'use client' provider that renders <UniversalProvider config={config}>.`,
  expo: `Expo: no Metro changes needed (SDK 52+). Wrap app/_layout.tsx in <UniversalProvider config={config}>.`,
  'react-native': `React Native: wrap your root component in <UniversalProvider config={config}>.`,
  vite: `Vite: alias 'react-native' to 'react-native-web' and prefer '.web.tsx' extensions in vite.config.ts.`,
  unknown: `Wrap your app root in <UniversalProvider config={config}>.`,
}

function run(command: string, cwd: string, log: (m: string) => void) {
  log(`$ ${command}`)
  execSync(command, { cwd, stdio: 'inherit' })
}

function installMissing(project: ProjectInfo, items: RegistryItem[], options: CommonOptions) {
  const missing = collectDependencies(items).filter((pkg) => !project.dependencies[pkg])
  if (!missing.length) return
  const command = installCommand(project.packageManager, missing)
  if (options.install) run(command, options.cwd, options.log)
  else options.log(`Install dependencies:\n  ${command}`)
}

export async function initCommand(options: CommonOptions & { framework?: Framework }) {
  const project = detectProject(options.cwd)
  const framework = options.framework ?? project.framework
  const existing = readConfig(options.cwd)
  const config: CliConfig = existing ?? defaultConfig(framework, project.srcDir)
  if (options.registry) config.registry = options.registry
  writeConfig(options.cwd, config)
  options.log(`${existing ? 'Updated' : 'Created'} ${CONFIG_FILE} (framework: ${framework})`)

  const configFile = join(options.cwd, config.tamaguiConfig)
  if (!existsSync(configFile) || options.overwrite) {
    mkdirSync(dirname(configFile), { recursive: true })
    writeFileSync(
      configFile,
      `import { createUniversalConfig } from '${PACKAGE_SCOPE}/theme'

// Change the preset, colors, radius or font scale — every component follows.
export const config = createUniversalConfig({ preset: 'indigo', radius: 'md' })

export default config
`,
    )
    options.log(`Created ${config.tamaguiConfig}`)
  }

  const packages = [
    ...BASE_DEPENDENCIES,
    `${PACKAGE_SCOPE}/core`,
    ...frameworkPeers[framework],
  ].filter((pkg) => !project.dependencies[pkg])
  if (packages.length) {
    const command = installCommand(project.packageManager, packages)
    if (options.install) run(command, options.cwd, options.log)
    else options.log(`Install dependencies:\n  ${command}`)
  }
  options.log(
    `\n${setupNotes[framework]}\n\n${PRODUCT_NAME} is ready. Add components with: npx ${CLI_NAME} add button`,
  )
}

export async function addCommand(names: string[], options: CommonOptions & { all?: boolean }) {
  const project = detectProject(options.cwd)
  const existing = readConfig(options.cwd)
  const config = existing ?? defaultConfig(project.framework, project.srcDir)
  // add writes advui.json for its record; a new one keeps the registry, as init does.
  if (!existing && options.registry) config.registry = options.registry
  const registry = options.registry ?? config.registry
  const load = (name: string) => fetchRegistryJson<RegistryItem>(registry, name, options.cwd)

  let requested = names
  if (options.all) {
    const index = await fetchRegistryJson<RegistryIndex>(registry, 'index', options.cwd)
    requested = index.items
      .filter((item) => item.type === 'registry:component')
      .map((item) => item.name)
  }
  if (!requested.length)
    throw new Error(`Specify components, e.g. \`${CLI_NAME} add button dialog\``)

  const items = await resolveItems(requested, load)
  const installed = { ...config.items }
  const written: string[] = []
  const skipped: string[] = []
  for (const item of items) {
    const before = installed[item.name]
    const record: InstalledItem = { version: item.version, files: {} }
    for (const file of item.files) {
      const target = join(options.cwd, config.uiDir, file.path)
      const hash = fileHash(file)
      if (existsSync(target) && !options.overwrite) {
        skipped.push(relative(options.cwd, target))
        // A kept file was installed as what it still matches, or as recorded before.
        const kept =
          hashContent(readFileSync(target, 'utf8')) === hash ? hash : before?.files[file.path]
        if (kept) record.files[file.path] = kept
        // `update` merges against the installed version, so keep the older one it needs.
        if (before && kept && kept !== hash) record.version = before.version
        continue
      }
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, file.content)
      written.push(relative(options.cwd, target))
      record.files[file.path] = hash
    }
    installed[item.name] = record
  }
  config.items = installed
  writeConfig(options.cwd, config)

  options.log(`Added ${items.map((i) => i.name).join(', ')}`)
  for (const file of written) options.log(`  + ${file}`)
  if (skipped.length)
    options.log(
      `Skipped ${skipped.length} existing file(s): \`${CLI_NAME} update\` merges upstream changes into them, --overwrite replaces them.`,
    )

  installMissing(project, items, options)
  return { items, written, skipped }
}

const statusLabels: Record<FileStatus, string> = {
  unchanged: 'unchanged',
  local: 'changed locally',
  upstream: 'changed upstream',
  both: 'changed in both',
}

function fileNote(file: FilePlan): string {
  if (file.conflict) return ` (conflict: ${file.conflict})`
  if (file.merged !== undefined) return ' (merges cleanly)'
  if (file.status === 'upstream' && file.local === null) return ' (new file)'
  if (file.status === 'upstream' && file.upstream === null) return ' (removed upstream)'
  if (file.status === 'local' && file.local === null) return ' (deleted locally)'
  return ''
}

/** The items to compare: the named ones, else every item advui.json records. */
async function planFor(names: string[], options: CommonOptions) {
  const project = detectProject(options.cwd)
  const config = readConfig(options.cwd) ?? defaultConfig(project.framework, project.srcDir)
  const installed = config.items ?? {}
  const requested = names.length ? names : Object.keys(installed)
  const uiDir = config.uiDir.replace(/\\/g, '/')
  const shown = (file: FilePlan) => posix.join(uiDir, file.path)
  if (!requested.length) {
    options.log(
      `${CONFIG_FILE} records no items yet. \`${CLI_NAME} add\` records what it installs; for components added by an older CLI, name them (\`${CLI_NAME} diff button\`).`,
    )
    return { project, config, plans: [], shown }
  }
  const plans = await planItems(requested, {
    cwd: options.cwd,
    uiDir: config.uiDir,
    registry: options.registry ?? config.registry,
    installed,
  })
  return { project, config, plans, shown }
}

const isNew = (plan: ItemPlan) => !plan.installed && plan.files.every((file) => file.local === null)

const versions = ({ installed, upstream }: ItemPlan) =>
  installed?.version === upstream.version
    ? upstream.version
    : `${installed?.version ?? '(not recorded)'} → ${upstream.version}`

export async function diffCommand(names: string[], options: CommonOptions) {
  const { plans, shown } = await planFor(names, options)
  const diffs: string[] = []
  for (const plan of plans) {
    const { upstream, files } = plan
    if (files.every((file) => file.status === 'unchanged')) {
      options.log(`${upstream.name} ${upstream.version}: up to date`)
      continue
    }
    if (isNew(plan)) {
      options.log(
        `${upstream.name} ${upstream.version}: not installed (\`${CLI_NAME} update\` adds it)`,
      )
      continue
    }
    options.log(`${upstream.name} ${versions(plan)}`)
    for (const file of files) {
      options.log(`  ${statusLabels[file.status].padEnd(17)} ${shown(file)}${fileNote(file)}`)
      if (file.status === 'unchanged') continue
      diffs.push(
        unifiedDiff(file.local ?? '', file.upstream ?? '', {
          a: file.local === null ? '/dev/null' : `a/${shown(file)}`,
          b: file.upstream === null ? '/dev/null' : `b/${shown(file)}`,
        }),
      )
    }
  }
  // Upstream against local: `+` lines are what upstream has and your copy does not.
  if (diffs.length) options.log(`\n${diffs.join('').trimEnd()}`)
  return plans
}

export async function updateCommand(names: string[], options: CommonOptions) {
  const { project, config, plans, shown } = await planFor(names, options)
  const installed = { ...config.items }
  const applied: RegistryItem[] = []
  const conflicts: string[] = []
  for (const plan of plans) {
    const { upstream, files } = plan
    const blocked = files.filter((file) => file.conflict)
    // An item's files change together (a web file and its .native twin share an
    // API), so an item with a conflict is left as it is.
    if (blocked.length && !options.overwrite) {
      options.log(`${upstream.name}: not updated, your changes conflict with upstream in`)
      for (const file of blocked) {
        options.log(`  ! ${shown(file)} (${file.conflict})`)
        conflicts.push(shown(file))
      }
      continue
    }

    const lines: string[] = []
    for (const file of files) {
      const target = join(options.cwd, config.uiDir, file.path)
      const next =
        file.status === 'upstream' || file.conflict
          ? file.upstream
          : file.status === 'both'
            ? file.merged!
            : undefined
      if (next === undefined) continue
      if (next === null) {
        rmSync(target, { force: true })
        lines.push(`  - ${shown(file)}`)
        continue
      }
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, file.crlf ? next.replace(/\n/g, '\r\n') : next)
      const note = file.conflict
        ? ' (replaced your changes)'
        : file.status === 'both'
          ? ' (merged with your changes)'
          : ''
      lines.push(`  ${file.local === null ? '+' : '~'} ${shown(file)}${note}`)
    }

    installed[upstream.name] = {
      version: upstream.version,
      files: Object.fromEntries(upstream.files.map((file) => [file.path, fileHash(file)])),
    }
    applied.push(upstream)
    const kept = files.filter((file) => file.status === 'local').length
    const keptNote = kept ? `, kept your changes to ${kept} file(s)` : ''
    if (!lines.length) options.log(`${upstream.name} ${upstream.version}: up to date${keptNote}`)
    else {
      options.log(
        isNew(plan)
          ? `Added ${upstream.name} ${upstream.version}`
          : `Updated ${upstream.name} ${versions(plan)}${keptNote}`,
      )
      for (const line of lines) options.log(line)
    }
  }
  if (plans.length) {
    config.items = installed
    writeConfig(options.cwd, config)
  }
  if (conflicts.length)
    options.log(
      `\nMerge those files by hand (\`${CLI_NAME} diff\` shows upstream against your copy) and run update again, or pass --overwrite to replace them with upstream.`,
    )

  installMissing(project, applied, options)
  return { plans, applied, conflicts }
}

export async function listCommand(options: CommonOptions) {
  const project: ProjectInfo | null = (() => {
    try {
      return detectProject(options.cwd)
    } catch {
      return null
    }
  })()
  const config = project ? readConfig(options.cwd) : null
  // Listing needs no project, so fall back to the published registry.
  const registry = options.registry ?? config?.registry ?? DEFAULT_REGISTRY
  const index = await fetchRegistryJson<RegistryIndex>(registry, 'index', options.cwd)
  for (const item of index.items) {
    options.log(`${item.name.padEnd(16)} ${(item.status ?? '').padEnd(8)} ${item.description}`)
  }
  return index
}
