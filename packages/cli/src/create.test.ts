import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createCommand, packageName, templates, userPackageManager } from './create.js'

const cli = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repo = resolve(cli, '../..')
const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const { version } = readJson(join(cli, 'package.json'))

let work: string
let templatesDir: string
const log: string[] = []
const create = (dir: string | undefined, template?: string) =>
  createCommand(dir, {
    cwd: work,
    template,
    install: false,
    packageManager: 'pnpm',
    templatesDir,
    log: (m) => log.push(m),
  })

beforeAll(() => {
  work = mkdtempSync(join(tmpdir(), 'advui-create-'))
  templatesDir = join(work, 'templates')
  execFileSync(process.execPath, [join(cli, 'scripts/build-templates.mjs'), templatesDir])
})
afterAll(() => rmSync(work, { recursive: true, force: true }))

describe('create', () => {
  it('makes a Next.js app with the example screens as Client Components', async () => {
    await create('My Next App', 'next')
    const app = join(work, 'My Next App')
    for (const file of ['.gitignore', 'next.config.ts', 'app/layout.tsx', 'app/providers.tsx'])
      expect(existsSync(join(app, file)), file).toBe(true)
    expect(existsSync(join(app, 'gitignore'))).toBe(false)
    const pkg = readJson(join(app, 'package.json'))
    expect(pkg.name).toBe('my-next-app')
    expect(pkg.dependencies['@advui/core']).toBe(`^${version}`)
    expect(pkg.dependencies['@advui/theme']).toBe(`^${version}`)
    const login = readFileSync(join(app, 'screens/login.tsx'), 'utf8')
    expect(login).toBe(
      `'use client'\n\n${readFileSync(join(repo, 'examples/src/login.tsx'), 'utf8')}`,
    )
    expect(log.join('\n')).toContain('cd My Next App\n  pnpm install\n  pnpm run dev')
  })

  it('makes an Expo app named after its folder', async () => {
    await create('2nd-expo', 'expo')
    const app = join(work, '2nd-expo')
    const { expo } = readJson(join(app, 'app.json'))
    expect(expo).toMatchObject({ name: '2nd-expo', slug: '2nd-expo', scheme: 'app-2nd-expo' })
    expect(readJson(join(app, 'package.json')).dependencies['@advui/icons']).toBe(`^${version}`)
    expect(readFileSync(join(app, 'screens/mobile.tsx'), 'utf8')).toBe(
      readFileSync(join(repo, 'examples/src/mobile.tsx'), 'utf8'),
    )
  })

  it('needs a folder and a known template, and leaves a folder with files alone', async () => {
    await expect(create(undefined, 'next')).rejects.toThrow("Name the app's folder")
    await expect(create('app')).rejects.toThrow('--template: next (Next.js), expo (Expo Router)')
    await expect(create('app', 'vite')).rejects.toThrow('Pick a template')
    mkdirSync(join(work, 'taken'))
    writeFileSync(join(work, 'taken/index.ts'), '')
    await expect(create('taken', 'next')).rejects.toThrow('taken already exists and is not empty')
    mkdirSync(join(work, 'empty'))
    await create('empty', 'expo')
    expect(existsSync(join(work, 'empty/app/_layout.tsx'))).toBe(true)
  })

  it('pins the versions the docs and the playground run on', () => {
    // CI builds each starter app, so it must stay on the versions checked here.
    const root = readJson(join(repo, 'package.json'))
    const apps = { next: 'apps/docs', expo: 'apps/expo' }
    for (const template of Object.keys(templates) as (keyof typeof apps)[]) {
      const pkg = readJson(join(cli, 'templates', template, 'package.json'))
      const app = readJson(join(repo, apps[template], 'package.json'))
      const workspace = { ...root.devDependencies, ...app.dependencies, ...app.devDependencies }
      for (const [name, range] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies }))
        if (!name.startsWith('@advui/'))
          expect(`${template}: ${name}@${range}`).toBe(`${template}: ${name}@${workspace[name]}`)
    }
  })
})

describe('package names', () => {
  it('names the package after the folder', () => {
    expect(packageName('apps/My App!')).toBe('my-app')
    expect(packageName('___')).toBe('advui-app')
  })

  it('uses the package manager that ran the CLI', () => {
    expect(userPackageManager('pnpm/12.6.0 npm/? node/v22.12.0 win32 x64')).toBe('pnpm')
    expect(userPackageManager('yarn/4.5.0 npm/? node/v22.12.0')).toBe('yarn')
    expect(userPackageManager('bun/1.2.0 npm/? node/v22.12.0')).toBe('bun')
    expect(userPackageManager('npm/10.9.0 node/v22.12.0')).toBe('npm')
    expect(userPackageManager('')).toBe('npm')
  })
})
