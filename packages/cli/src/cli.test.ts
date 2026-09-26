import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { addCommand, initCommand } from './commands.js'
import { detectFramework, detectPackageManager, installCommand } from './project.js'
import { type RegistryItem, resolveItems } from './registry.js'

const registry = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../registry')

describe('project detection', () => {
  it('detects frameworks from dependencies', () => {
    expect(detectFramework({ next: '16' })).toBe('next')
    expect(detectFramework({ expo: '57', 'react-native': '0.86' })).toBe('expo')
    expect(detectFramework({ 'react-native': '0.86' })).toBe('react-native')
    expect(detectFramework({})).toBe('unknown')
  })

  it('builds install commands per package manager', () => {
    expect(installCommand('pnpm', ['a', 'b'])).toBe('pnpm add a b')
    expect(installCommand('npm', ['a'], true)).toBe('npm install --save-dev a')
  })
})

describe('resolveItems', () => {
  const fake = (name: string, deps: string[] = []): RegistryItem => ({
    name,
    title: name,
    type: 'registry:component',
    description: '',
    dependencies: [],
    peerDependencies: [],
    registryDependencies: deps,
    files: [],
  })

  it('orders dependencies before dependents and de-duplicates', async () => {
    const db: Record<string, RegistryItem> = {
      dialog: fake('dialog', ['icon-button', 'hooks']),
      'icon-button': fake('icon-button', ['button']),
      button: fake('button', ['spinner']),
      spinner: fake('spinner'),
      hooks: fake('hooks'),
    }
    const items = await resolveItems(['dialog', 'button'], async (n) => db[n]!)
    expect(items.map((i) => i.name)).toEqual([
      'spinner',
      'button',
      'icon-button',
      'hooks',
      'dialog',
    ])
  })

  it('detects cycles', async () => {
    const db: Record<string, RegistryItem> = { a: fake('a', ['b']), b: fake('b', ['a']) }
    await expect(resolveItems(['a'], async (n) => db[n]!)).rejects.toThrow(/Circular/)
  })
})

describe('init + add against the local registry', () => {
  let dir: string
  const logs: string[] = []
  const options = () => ({
    cwd: dir,
    registry,
    install: false,
    overwrite: false,
    log: (m: string) => logs.push(m),
  })

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'aui-cli-'))
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { expo: '57.0.0' } }))
    logs.length = 0
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('writes config, tamagui config and component source with dependencies', async () => {
    expect(detectPackageManager(dir)).toBe('npm')
    await initCommand(options())
    const config = JSON.parse(readFileSync(join(dir, 'advui.json'), 'utf8'))
    expect(config.framework).toBe('expo')
    expect(existsSync(join(dir, 'tamagui.config.ts'))).toBe(true)

    const { items } = await addCommand(['icon-button'], options())
    expect(items.map((i) => i.name)).toEqual(['spinner', 'utils', 'button', 'icon-button'])
    expect(existsSync(join(dir, 'ui/components/button/Button.tsx'))).toBe(true)
    // Button imports ../../utils/isTextContent, which must land next to it.
    expect(existsSync(join(dir, 'ui/utils/isTextContent.ts'))).toBe(true)
    expect(existsSync(join(dir, 'ui/components/spinner/Spinner.native.tsx'))).toBe(true)
    expect(logs.join('\n')).toMatch(/npm install @advui\/icons/)
  })

  it('does not overwrite existing files unless asked', async () => {
    await addCommand(['badge'], options())
    const file = join(dir, 'ui/components/badge/Badge.tsx')
    writeFileSync(file, '// customised')
    const { skipped } = await addCommand(['badge'], options())
    expect(skipped.length).toBeGreaterThan(0)
    expect(readFileSync(file, 'utf8')).toBe('// customised')
    await addCommand(['badge'], { ...options(), overwrite: true })
    expect(readFileSync(file, 'utf8')).not.toBe('// customised')
  })
})
