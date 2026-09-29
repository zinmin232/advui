import 'server-only'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// The docs app runs from apps/docs; the repo root is two levels up.
export const repoRoot = join(process.cwd(), '..', '..')

/** A component's `src` folder: `packages/ui/src` for core, `packages/data/src`… */
export const packageSrc = (packageDir: string) => join(repoRoot, packageDir, 'src')

/** Folder that holds a component’s metadata (layout pages share one folder). */
export function componentFolder(files: string[]): string {
  const first = files[0] ?? ''
  return first.split('/')[1] ?? ''
}

export function readExampleSource(packageDir: string, folder: string, example: string): string {
  const file = join(packageSrc(packageDir), 'components', folder, 'examples', `${example}.tsx`)
  return existsSync(file)
    ? readFileSync(file, 'utf8')
    : `// ${folder}/examples/${example}.tsx not found`
}

/** Most recent modification of a component's files (git history is not guaranteed at build time). */
export function lastUpdated(packageDir: string, folder: string, files: string[]): string {
  const src = packageSrc(packageDir)
  const times = [...files.map((f) => join(src, f)), join(src, 'components', folder)]
    .filter((file) => existsSync(file))
    .map((file) => statSync(file).mtime.getTime())
  const latest = times.length ? Math.max(...times) : Date.now()
  return new Date(latest).toISOString()
}
