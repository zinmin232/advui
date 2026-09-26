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
}

export function defaultConfig(framework: Framework, srcDir: boolean): CliConfig {
  return {
    $schema: 'https://adv-ui.dev/schema/config.json',
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
  writeFileSync(join(root, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`)
}
