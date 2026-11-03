#!/usr/bin/env node
// Creates a starter app with `advui create` and builds it against this
// checkout's packages, packed as npm would publish them. CI runs it for each
// template, so the starter apps cannot fall behind the packages.
// Usage: pnpm starter:check next|expo [--keep]
import { execSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const template = process.argv[2]
if (template !== 'next' && template !== 'expo') {
  console.error('Usage: pnpm starter:check next|expo [--keep]')
  process.exit(1)
}

const root = resolve(import.meta.dirname, '..')
// Outside the repository, so npm does not take the app for part of the workspace.
const work = mkdtempSync(join(process.env.RUNNER_TEMP ?? tmpdir(), 'advui-starter-'))
const packs = join(work, 'packs')
const app = join(work, `${template}-app`)

function sh(command, cwd = root, { quiet = false } = {}) {
  console.log(`\n$ ${command}`)
  execSync(command, { cwd, stdio: quiet ? ['ignore', 'ignore', 'inherit'] : 'inherit' })
}

// What a starter app installs from Adv UI, directly or through @advui/core.
const packages = {
  '@advui/core': 'ui',
  '@advui/theme': 'theme',
  '@advui/icons': 'icons',
  '@advui/utils': 'utils',
}
// pack builds each package first (prepack). Its list of files is left out.
for (const dir of Object.values(packages))
  sh(`pnpm pack --pack-destination "${packs}"`, join(root, 'packages', dir), { quiet: true })
const packed = readdirSync(packs)
const tarball = (name) => {
  const file = packed.find((f) => f.startsWith(`${name.slice(1).replace('/', '-')}-`))
  return `file:${join(packs, file).replace(/\\/g, '/')}`
}

sh('pnpm --filter advui build')
sh(`node packages/cli/dist/index.js create "${app}" --template ${template} --no-install`)

// Install the packed packages in place of the published ones: the app's own
// dependencies, and (through overrides) what @advui/core depends on.
const pkgFile = join(app, 'package.json')
const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'))
pkg.overrides = {}
for (const name of Object.keys(packages)) {
  if (pkg.dependencies[name]) {
    pkg.dependencies[name] = tarball(name)
    pkg.overrides[name] = `$${name}`
  } else pkg.overrides[name] = tarball(name)
}
writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`)

sh('npm install --no-audit --no-fund', app)
sh('npm run typecheck', app)
if (template === 'next') sh('npm run build', app)
// Metro bundles the app for both platforms; no native build is needed.
else sh('npx expo export --platform android --platform ios', app)

if (process.argv.includes('--keep')) console.log(`\nKept ${app}`)
else rmSync(work, { recursive: true, force: true })
