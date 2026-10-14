#!/usr/bin/env node
// Checks one component while you work on it, in a few minutes instead of the
// full suite's half hour.
//
//   pnpm verify:component <slug> [--full] [--skip-native]
//
// By default it regenerates and validates the catalog and registry, runs the
// component's web tests and the native tests that name it, and lints and
// typechecks the packages whose source changed since `main` (committed or not).
// `--full` adds the packages that depend on them and the whole package's web
// and native suites: a final pass before a PR. CI runs everything on the PR,
// including the build, e2e and the Linux visual baselines.
//
// Tools run through `node <entry>` rather than a shell, so test-name patterns
// such as `\bAlert\b|Empty ?State` reach jest intact on Windows too.
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join, relative } from 'node:path'
import { parseArgs } from 'node:util'
import { loadCatalog, repoRoot, toPosix } from './lib/catalog.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    full: { type: 'boolean', default: false },
    'skip-native': { type: 'boolean', default: false },
  },
})
const slug = positionals[0]
if (!slug) {
  console.error('Usage: pnpm verify:component <slug> [--full] [--skip-native]')
  process.exit(1)
}

const entry = loadCatalog().find(({ meta }) => meta.slug === slug)
if (!entry) {
  console.error(`No component with slug "${slug}". Slugs are the \`slug\` in each *.meta.ts.`)
  process.exit(1)
}
const { pkg, dir, meta } = entry
const pkgRoot = join(repoRoot, pkg.dir)
const componentDir = toPosix(relative(pkgRoot, join(pkg.componentsDir, dir)))

/** The JS entry point of a package's binary, resolved from `fromDir`. */
function bin(name, fromDir) {
  const require = createRequire(join(fromDir, 'package.json'))
  const manifest = require.resolve(`${name}/package.json`)
  const { bin: bins } = JSON.parse(readFileSync(manifest, 'utf8'))
  return join(dirname(manifest), typeof bins === 'string' ? bins : bins[name])
}

function git(...args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim()
}

// pnpm's bin wrappers put its hoisted modules on NODE_PATH; the native Jest
// setup needs them (`@babel/runtime`), so calls that skip the wrapper add them.
const env = {
  ...process.env,
  NODE_PATH: [join(repoRoot, 'node_modules', '.pnpm', 'node_modules'), process.env.NODE_PATH]
    .filter(Boolean)
    .join(delimiter),
}

/** Runs `node <file> ...args` with inherited output; throws on a non-zero exit. */
function run(file, args, cwd = repoRoot) {
  const { status } = spawnSync(process.execPath, [file, ...args], { cwd, env, stdio: 'inherit' })
  if (status !== 0) throw new Error(`exit code ${status}`)
}

const results = []
function step(name, fn) {
  console.log(`\n▶ ${name}`)
  const start = Date.now()
  let status = 'pass'
  let note = ''
  try {
    const outcome = fn()
    if (outcome?.warn) {
      status = 'warn'
      note = outcome.warn
    } else if (typeof outcome === 'string') note = outcome
  } catch (error) {
    status = 'FAIL'
    note = error.message
  }
  results.push({ name, status, seconds: Math.round((Date.now() - start) / 1000), note })
}

/**
 * Workspace packages with changed source since the merge base with `main`,
 * uncommitted and untracked files included. Generated JSON (registry, docs
 * `public/`), screenshots and root files such as the CHANGELOG cannot change a
 * lint or typecheck result, so they do not count.
 */
function changedPackages() {
  const base = git('merge-base', 'main', 'HEAD')
  const files = [
    ...git('diff', '--name-only', base).split('\n'),
    ...git('ls-files', '--others', '--exclude-standard').split('\n'),
  ].filter((file) => /\.(c|m)?[jt]sx?$|(^|\/)(package|tsconfig[^/]*)\.json$/.test(file))
  const { packages } = JSON.parse(
    execFileSync(process.execPath, [bin('turbo', repoRoot), 'ls', '--output=json'], {
      cwd: repoRoot,
      encoding: 'utf8',
    }),
  )
  return packages.items
    .filter(({ path }) => files.some((file) => file.startsWith(`${toPosix(path)}/`)))
    .map(({ name }) => name)
}

step('Catalog: regenerate and validate metadata and examples', () =>
  run(join(repoRoot, 'scripts', 'generate-catalog.mjs'), []),
)
step('Registry: regenerate', () => run(join(repoRoot, 'scripts', 'build-registry.mjs'), []))

step(`Web tests: ${values.full ? pkg.name : `${pkg.name} ${componentDir}`}`, () =>
  run(bin('vitest', pkgRoot), ['run', ...(values.full ? [] : [componentDir])], pkgRoot),
)

if (values['skip-native']) {
  results.push({ name: 'Native tests', status: 'skip', seconds: 0, note: '--skip-native' })
} else {
  // Native tests live in one file per package, so pick the cases by name:
  // the display name and the exports, as whole words (`Alert`, not `AlertDialog`).
  const names = [...new Set([meta.name, ...meta.exports])].map((name) =>
    name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, ' ?'),
  )
  const pattern = `\\b(${names.join('|')})\\b`
  const report = join(tmpdir(), `verify-component-${process.pid}.json`)
  step(`Native tests: ${values.full ? pkg.name : `cases matching /${pattern}/i`}`, () => {
    let failure = null
    try {
      run(
        bin('jest', pkgRoot),
        [
          '--config',
          'jest.native.config.js',
          ...(values.full ? [] : ['-t', pattern]),
          '--json',
          `--outputFile=${report}`,
        ],
        pkgRoot,
      )
    } catch (error) {
      failure = error
    }
    const counts = existsSync(report) ? JSON.parse(readFileSync(report, 'utf8')) : null
    rmSync(report, { force: true })
    if (failure) throw failure
    if (counts && counts.numPassedTests + counts.numFailedTests === 0)
      return {
        warn: `no native test names ${meta.name}; add a case to the package's *.native.test.tsx`,
      }
    return `${counts?.numPassedTests ?? '?'} passed`
  })
}

const changed = changedPackages()
if (changed.length === 0) {
  results.push({
    name: 'Lint and typecheck',
    status: 'skip',
    seconds: 0,
    note: 'no changed source',
  })
} else {
  // `...pkg` adds the packages that depend on it; typecheck's `^typecheck`
  // dependency brings in the ones it depends on (cached when unchanged).
  const filters = changed.map((name) => `--filter=${values.full ? '...' : ''}${name}`)
  step(
    `Lint and typecheck: ${changed.join(', ')}${values.full ? ' and their dependents' : ''}`,
    () =>
      run(bin('turbo', repoRoot), [
        'run',
        'lint',
        'typecheck',
        ...filters,
        '--output-logs=errors-only',
      ]),
  )
}

console.log(`\nverify:component ${slug}${values.full ? ' --full' : ''}`)
for (const { name, status, seconds, note } of results) {
  console.log(
    `  ${status.padEnd(4)}  ${String(seconds).padStart(4)}s  ${name}${note ? `  (${note})` : ''}`,
  )
}
if (results.some((result) => result.status === 'warn' || result.status === 'FAIL')) {
  console.log(
    '\nSee AGENTS.md "Definition of done" for what CI and the final pass cover beyond this.',
  )
}
process.exit(results.some((result) => result.status === 'FAIL') ? 1 : 0)
