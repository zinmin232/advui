#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { addCommand, initCommand, listCommand } from './commands.js'
import { CLI_NAME, DEFAULT_REGISTRY, PRODUCT_NAME } from './constants.js'
import type { Framework } from './project.js'

const help = `${PRODUCT_NAME} CLI

Usage
  npx ${CLI_NAME} init [--framework next|expo|react-native|vite]
  npx ${CLI_NAME} add <component...> [--all] [--overwrite]
  npx ${CLI_NAME} list

Options
  --registry <url|path>  Registry to read from (default: from adv-ui.json, else ${DEFAULT_REGISTRY})
  --cwd <path>           Project directory (default: current directory)
  --no-install           Print the install command instead of running it
  --overwrite            Replace existing files
  -h, --help             Show this help`

async function main(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      registry: { type: 'string' },
      cwd: { type: 'string' },
      framework: { type: 'string' },
      'no-install': { type: 'boolean', default: false },
      overwrite: { type: 'boolean', default: false },
      all: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })
  const [command, ...rest] = positionals
  if (values.help || !command) {
    console.log(help)
    return
  }
  const common = {
    cwd: values.cwd ?? process.cwd(),
    registry: values.registry,
    install: !values['no-install'],
    overwrite: values.overwrite ?? false,
    log: (message: string) => console.log(message),
  }
  switch (command) {
    case 'init':
      return initCommand({ ...common, framework: values.framework as Framework | undefined })
    case 'add':
      return addCommand(rest, { ...common, all: values.all })
    case 'list':
      return listCommand(common)
    default:
      throw new Error(`Unknown command "${command}".\n\n${help}`)
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
