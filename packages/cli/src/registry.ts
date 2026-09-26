import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'

export interface RegistryFile {
  path: string
  type: string
  content: string
}

export interface RegistryItem {
  name: string
  title: string
  type: 'registry:component' | 'registry:lib'
  description: string
  status?: string
  dependencies: string[]
  peerDependencies: string[]
  registryDependencies: string[]
  files: RegistryFile[]
}

export interface RegistryIndex {
  name: string
  version: string
  items: Array<Pick<RegistryItem, 'name' | 'title' | 'type' | 'description' | 'status'>>
}

const isUrl = (source: string) => /^https?:\/\//.test(source)

/** Loads `<name>.json` from a registry URL or local directory. */
export async function fetchRegistryJson<T>(source: string, name: string, cwd: string): Promise<T> {
  if (isUrl(source)) {
    const url = `${source.replace(/\/$/, '')}/${name}.json`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Registry request failed: ${response.status} ${url}`)
    return (await response.json()) as T
  }
  const dir = isAbsolute(source) ? source : resolve(cwd, source)
  const file = join(dir, `${name}.json`)
  if (!existsSync(file)) throw new Error(`"${name}" not found in registry ${dir}`)
  return JSON.parse(readFileSync(file, 'utf8')) as T
}

/**
 * Resolves the requested items plus their registry dependencies (depth-first,
 * dependencies before dependents, each item once).
 */
export async function resolveItems(
  names: string[],
  load: (name: string) => Promise<RegistryItem>,
): Promise<RegistryItem[]> {
  const ordered: RegistryItem[] = []
  const seen = new Set<string>()
  const visiting = new Set<string>()

  async function visit(name: string) {
    if (seen.has(name)) return
    if (visiting.has(name)) throw new Error(`Circular registry dependency at "${name}"`)
    visiting.add(name)
    const item = await load(name)
    for (const dependency of item.registryDependencies) await visit(dependency)
    visiting.delete(name)
    seen.add(name)
    ordered.push(item)
  }

  for (const name of names) await visit(name)
  return ordered
}

export function collectDependencies(items: RegistryItem[]): string[] {
  const all = new Set<string>()
  for (const item of items) for (const dep of item.dependencies) all.add(dep)
  return [...all].sort()
}
