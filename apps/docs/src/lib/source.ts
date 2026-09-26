import 'server-only'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// The docs app runs from apps/docs; the repo root is two levels up.
export const repoRoot = join(process.cwd(), '..', '..')
export const uiComponentsDir = join(repoRoot, 'packages', 'ui', 'src', 'components')

/** Folder that holds a component’s metadata (layout pages share one folder). */
export function componentFolder(files: string[]): string {
  const first = files[0] ?? ''
  return first.split('/')[1] ?? ''
}

export function readExampleSource(folder: string, example: string): string {
  const file = join(uiComponentsDir, folder, 'examples', `${example}.tsx`)
  return existsSync(file)
    ? readFileSync(file, 'utf8')
    : `// ${folder}/examples/${example}.tsx not found`
}

/** Most recent modification of a component's files (git history is not guaranteed at build time). */
export function lastUpdated(folder: string, files: string[]): string {
  const times = [
    ...files.map((f) => join(repoRoot, 'packages', 'ui', 'src', f)),
    join(uiComponentsDir, folder),
  ]
    .filter((file) => existsSync(file))
    .map((file) => statSync(file).mtime.getTime())
  const latest = times.length ? Math.max(...times) : Date.now()
  return new Date(latest).toISOString()
}
