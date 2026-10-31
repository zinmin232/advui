import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { components } from './components'

describe('@advui/charts/meta', () => {
  // The list is generated, so a new component is missing from npm until it is rerun.
  it('lists every metadata file in the package (run `pnpm catalog` after adding one)', () => {
    const folder = join(dirname(fileURLToPath(import.meta.url)), '..', 'components')
    const slugs = readdirSync(folder, { recursive: true, encoding: 'utf8' })
      .filter((file) => file.endsWith('.meta.ts'))
      .map((file) => basename(file, '.meta.ts'))
    expect(components.map((meta) => meta.slug).sort()).toEqual(slugs.sort())
  })

  // Tools such as the AdvUI Builder import it in Node, which fails on a relative
  // import without its extension (`tsc` writes the `.ts` ones as `.js` in `dist`).
  it.skipIf(!process.features.typescript)('loads in Node without a bundler', () => {
    const entry = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'components.ts')).href
    const script = `const { components } = await import(${JSON.stringify(entry)}); console.log(components.length)`
    const output = execFileSync(process.execPath, ['--input-type=module', '--eval', script], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    expect(Number(output)).toBe(components.length)
  })
})
