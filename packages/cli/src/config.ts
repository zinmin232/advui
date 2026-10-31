import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CONFIG_FILE, DEFAULT_REGISTRY } from './constants.js'
import type { Framework } from './project.js'

export interface CliConfig {
  $schema?: string
  framework: Framework
  /** Directory (relative to the project root) that receives component source. */
  uiDir: string
  /** Registry URL or local path. */
  registry: string
  /** Path of the Tamagui config created by `init`. */
  tamaguiConfig: string
  /** What `add` and `update` installed, by item name. `diff` and `update` start from it. */
  items?: Record<string, InstalledItem>
}

export interface InstalledItem {
  /** Registry version the files came from: `diff` and `update` merge against it. */
  version: string
  /** sha256 of each file as installed, by registry path (relative to `uiDir`). */
  files: Record<string, string>
}

export function defaultConfig(framework: Framework, srcDir: boolean): CliConfig {
  return {
    $schema: 'https://zinmin232.github.io/advui/schema/config.json',
    framework,
    uiDir: srcDir ? 'src/ui' : 'ui',
    registry: DEFAULT_REGISTRY,
    tamaguiConfig: srcDir ? 'src/tamagui.config.ts' : 'tamagui.config.ts',
  }
}

export function readConfig(root: string): CliConfig | null {
  const file = join(root, CONFIG_FILE)
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8')) as CliConfig
}

export function writeConfig(root: string, config: CliConfig) {
  // Sorted, so adding an item changes one place in the file.
  if (config.items)
    config.items = Object.fromEntries(
      Object.entries(config.items).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    )
  writeFileSync(join(root, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`)
}
