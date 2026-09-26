import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { type CliConfig, defaultConfig, readConfig, writeConfig } from './config.js'
import {
  BASE_DEPENDENCIES,
  CLI_NAME,
  CONFIG_FILE,
  PACKAGE_SCOPE,
  PRODUCT_NAME,
} from './constants.js'
import { type Framework, type ProjectInfo, detectProject, installCommand } from './project.js'
import {
  type RegistryIndex,
  type RegistryItem,
  collectDependencies,
  fetchRegistryJson,
  resolveItems,
} from './registry.js'

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
  const config = readConfig(options.cwd) ?? defaultConfig(project.framework, project.srcDir)
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
  const written: string[] = []
  const skipped: string[] = []
  for (const item of items) {
    for (const file of item.files) {
      const target = join(options.cwd, config.uiDir, file.path)
      if (existsSync(target) && !options.overwrite) {
        skipped.push(relative(options.cwd, target))
        continue
      }
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, file.content)
      written.push(relative(options.cwd, target))
    }
  }

  options.log(`Added ${items.map((i) => i.name).join(', ')}`)
  for (const file of written) options.log(`  + ${file}`)
  if (skipped.length) options.log(`Skipped ${skipped.length} existing file(s) (use --overwrite).`)

  const missing = collectDependencies(items).filter((pkg) => !project.dependencies[pkg])
  if (missing.length) {
    const command = installCommand(project.packageManager, missing)
    if (options.install) run(command, options.cwd, options.log)
    else options.log(`Install dependencies:\n  ${command}`)
  }
  return { items, written, skipped }
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
  const registry = options.registry ?? config?.registry
  if (!registry) throw new Error('No registry configured. Pass --registry <url|path>.')
  const index = await fetchRegistryJson<RegistryIndex>(registry, 'index', options.cwd)
  for (const item of index.items) {
    options.log(`${item.name.padEnd(16)} ${(item.status ?? '').padEnd(8)} ${item.description}`)
  }
  return index
}
