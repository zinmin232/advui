import { readdirSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { components } from './components'

describe('@advui/editor/meta', () => {
  // The list is generated, so a new component is missing from npm until it is rerun.
  it('lists every metadata file in the package (run `pnpm catalog` after adding one)', () => {
    const folder = join(dirname(fileURLToPath(import.meta.url)), '..', 'components')
    const slugs = readdirSync(folder, { recursive: true, encoding: 'utf8' })
      .filter((file) => file.endsWith('.meta.ts'))
      .map((file) => basename(file, '.meta.ts'))
    expect(components.map((meta) => meta.slug).sort()).toEqual(slugs.sort())
  })
})
