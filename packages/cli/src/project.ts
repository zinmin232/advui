import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type Framework = 'next' | 'expo' | 'react-native' | 'vite' | 'unknown'
export type PackageManager = 'pnpm' | 'yarn' | 'bun' | 'npm'

export interface ProjectInfo {
  root: string
  framework: Framework
  packageManager: PackageManager
  typescript: boolean
  srcDir: boolean
  dependencies: Record<string, string>
}

export function readPackageJson(root: string): Record<string, unknown> | null {
  const file = join(root, 'package.json')
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
}

export function detectFramework(deps: Record<string, string>): Framework {
  if (deps.next) return 'next'
  if (deps.expo) return 'expo'
  if (deps['react-native']) return 'react-native'
  if (deps.vite) return 'vite'
  return 'unknown'
}

export function detectPackageManager(root: string): PackageManager {
  if (existsSync(join(root, 'pnpm-lock.yaml')) || existsSync(join(root, 'pnpm-workspace.yaml')))
    return 'pnpm'
  if (existsSync(join(root, 'yarn.lock'))) return 'yarn'
  if (existsSync(join(root, 'bun.lockb')) || existsSync(join(root, 'bun.lock'))) return 'bun'
  return 'npm'
}

export function detectProject(root: string): ProjectInfo {
  const pkg = readPackageJson(root)
  if (!pkg) throw new Error(`No package.json found in ${root}. Run this inside your app.`)
  const dependencies = {
    ...((pkg.dependencies as Record<string, string>) ?? {}),
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
  }
  return {
    root,
    framework: detectFramework(dependencies),
    packageManager: detectPackageManager(root),
    typescript: existsSync(join(root, 'tsconfig.json')),
    srcDir: existsSync(join(root, 'src')),
    dependencies,
  }
}

export function installCommand(pm: PackageManager, packages: string[], dev = false): string {
  const flag = dev ? (pm === 'npm' ? ' --save-dev' : ' -D') : ''
  const verb = pm === 'npm' ? 'install' : 'add'
  return `${pm} ${verb}${flag} ${packages.join(' ')}`
}
