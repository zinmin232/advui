import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { InstalledItem } from './config.js'
import { merge3 } from './diff.js'
import {
  type RegistryItem,
  fetchRegistryJson,
  fileHash,
  hashContent,
  resolveItems,
  toLf,
} from './registry.js'

// `diff` and `update` compare three copies of each file: the one that was
// installed (its hash is in advui.json, its text in the registry's snapshot of
// that version), the local one and the latest upstream. Hashes alone tell which
// side changed; the installed text is only needed to merge a file both changed.

/** `local` and `upstream`: only that side changed. `both`: both did, differently. */
export type FileStatus = 'unchanged' | 'local' | 'upstream' | 'both'

export interface FilePlan {
  /** Registry path, relative to `uiDir`. */
  path: string
  status: FileStatus
  /** Local text with LF line endings, or null when the file is missing. */
  local: string | null
  /** Whether the local file uses CRLF, so that writing it keeps them. */
  crlf: boolean
  /** Upstream text, or null when upstream removed the file. */
  upstream: string | null
  /** A file changed on both sides has either a clean merge… */
  merged?: string
  /** …or the reason it does not merge. */
  conflict?: string
}

export interface ItemPlan {
  installed?: InstalledItem
  upstream: RegistryItem
  files: FilePlan[]
}

export interface PlanOptions {
  cwd: string
  uiDir: string
  registry: string
  installed: Record<string, InstalledItem>
}

/** Compares the named items, and the registry items they now need, with the local copies. */
export async function planItems(names: string[], options: PlanOptions): Promise<ItemPlan[]> {
  const load = (name: string) =>
    fetchRegistryJson<RegistryItem>(options.registry, name, options.cwd)
  const items = await resolveItems(names, load)
  return Promise.all(items.map((item) => planItem(item, options)))
}

async function planItem(upstream: RegistryItem, options: PlanOptions): Promise<ItemPlan> {
  const installed = options.installed[upstream.name]
  const recorded = installed?.files ?? {}
  const upstreamFiles = new Map(upstream.files.map((file) => [file.path, file]))
  const paths = new Set([...upstreamFiles.keys(), ...Object.keys(recorded)])
  let base: Promise<Map<string, string>> | undefined

  const files: FilePlan[] = []
  for (const path of paths) {
    const target = join(options.cwd, options.uiDir, path)
    const raw = existsSync(target) ? readFileSync(target, 'utf8') : null
    const local = raw === null ? null : toLf(raw)
    const file = upstreamFiles.get(path)
    // A missing file (null) is one more state: deleting it locally is a local change.
    const baseHash = recorded[path] ?? null
    const localHash = local === null ? null : hashContent(local)
    const upstreamHash = file ? fileHash(file) : null
    const status: FileStatus =
      localHash === upstreamHash
        ? 'unchanged'
        : localHash === baseHash
          ? 'upstream'
          : upstreamHash === baseHash
            ? 'local'
            : 'both'
    const plan: FilePlan = {
      path,
      status,
      local,
      crlf: raw?.includes('\r\n') ?? false,
      upstream: file ? toLf(file.content) : null,
    }
    files.push(plan)
    if (status !== 'both') continue

    if (plan.local === null) plan.conflict = 'deleted locally, changed upstream'
    else if (plan.upstream === null) plan.conflict = 'changed locally, removed upstream'
    else if (!installed || !baseHash) plan.conflict = 'no record of the installed copy'
    else {
      base ??= loadInstalled(upstream.name, installed.version, options)
      const original = (await base).get(baseHash)
      if (original === undefined)
        plan.conflict = `the registry has no copy of ${installed.version} to merge with`
      else {
        const { text, conflicts } = merge3(original, plan.local, plan.upstream)
        if (text === null)
          plan.conflict = `${conflicts} overlapping change${conflicts === 1 ? '' : 's'}`
        else plan.merged = text
      }
    }
  }
  return { installed, upstream, files }
}

/**
 * The texts of an installed version, by hash, from the registry's snapshot of
 * it. Keyed by hash, so a snapshot rebuilt since cannot pass for the installed copy.
 */
async function loadInstalled(name: string, version: string, options: PlanOptions) {
  try {
    const item = await fetchRegistryJson<RegistryItem>(
      options.registry,
      `${version}/${name}`,
      options.cwd,
    )
    return new Map(item.files.map((file) => [hashContent(file.content), toLf(file.content)]))
  } catch {
    // No snapshot (an older registry, or a version that was never released):
    // files changed on both sides then conflict.
    return new Map<string, string>()
  }
}
