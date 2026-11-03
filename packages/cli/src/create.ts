import { cpSync, existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type CommonOptions, run } from './commands.js'
import { CLI_NAME, PACKAGE_SCOPE, PRODUCT_NAME } from './constants.js'
import type { PackageManager } from './project.js'

export const templates = {
  next: { label: 'Next.js', start: 'dev' },
  expo: { label: 'Expo Router', start: 'start' },
} as const
export type Template = keyof typeof templates

export interface CreateOptions extends Pick<CommonOptions, 'cwd' | 'install' | 'log'> {
  template?: string
  /** Default: the one that ran the CLI (`npx`, `pnpm dlx`…). */
  packageManager?: PackageManager
  /** Where the templates are. The build copies them to dist/templates; tests pass their own. */
  templatesDir?: string
}

/** The package manager that ran the CLI, from the user agent it sets. */
export function userPackageManager(
  agent = process.env.npm_config_user_agent ?? '',
): PackageManager {
  if (agent.startsWith('pnpm')) return 'pnpm'
  if (agent.startsWith('yarn')) return 'yarn'
  if (agent.startsWith('bun')) return 'bun'
  return 'npm'
}

/** A package name from the folder's name: lowercase, with what npm rejects as dashes. */
export function packageName(dir: string): string {
  const name = basename(resolve(dir))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return name || 'advui-app'
}

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
const writeJson = (file: string, value: unknown) =>
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)

export async function createCommand(dir: string | undefined, options: CreateOptions) {
  const names = Object.entries(templates)
    .map(([name, { label }]) => `${name} (${label})`)
    .join(', ')
  if (!dir) throw new Error(`Name the app's folder: \`${CLI_NAME} create my-app --template next\``)
  if (!options.template || !(options.template in templates))
    throw new Error(`Pick a template with --template: ${names}.`)
  const template = options.template as Template
  const target = resolve(options.cwd, dir)
  if (existsSync(target) && readdirSync(target).length)
    throw new Error(`${dir} already exists and is not empty.`)

  const source = options.templatesDir ?? fileURLToPath(new URL('./templates', import.meta.url))
  cpSync(join(source, template), target, { recursive: true })
  // npm leaves .gitignore out of published packages, so the template's has no dot.
  renameSync(join(target, 'gitignore'), join(target, '.gitignore'))

  // The packages are released with the CLI, at its version.
  const { version } = readJson(fileURLToPath(new URL('../package.json', import.meta.url)))
  const name = packageName(target)
  const pkg = readJson(join(target, 'package.json'))
  pkg.name = name
  for (const field of ['dependencies', 'devDependencies'])
    for (const dep of Object.keys((pkg[field] as Record<string, string>) ?? {}))
      if (dep.startsWith(`${PACKAGE_SCOPE}/`))
        (pkg[field] as Record<string, string>)[dep] = `^${version}`
  writeJson(join(target, 'package.json'), pkg)

  if (template === 'expo') {
    const app = readJson(join(target, 'app.json'))
    const expo = app.expo as Record<string, unknown>
    // A URL scheme starts with a letter.
    Object.assign(expo, { name, slug: name, scheme: /^[a-z]/.test(name) ? name : `app-${name}` })
    writeJson(join(target, 'app.json'), app)
  }

  const pm = options.packageManager ?? userPackageManager()
  if (options.install) run(`${pm} install`, target, options.log)
  const folder = relative(options.cwd, target) || '.'
  options.log(
    [
      `\nCreated ${folder}: a ${templates[template].label} app with ${PRODUCT_NAME}. Next:`,
      '',
      ...(folder === '.' ? [] : [`  cd ${folder}`]),
      ...(options.install ? [] : [`  ${pm} install`]),
      `  ${pm} run ${templates[template].start}`,
    ].join('\n'),
  )
  return { target, template }
}
