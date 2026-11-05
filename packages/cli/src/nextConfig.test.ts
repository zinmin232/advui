import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import {
  editNextConfig,
  nextSettings,
  removeCacheComponents,
  setUpNextConfig,
} from './nextConfig.js'

const settings = nextSettings({})
const dir = mkdtempSync(join(tmpdir(), 'aui-next-config-'))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

function edit(source: string) {
  const result = editNextConfig(source, settings)
  if ('error' in result) throw new Error(result.error)
  return result
}

let loaded = 0
/** Runs a config as Next would load it and returns what it exports. */
async function load(text: string, extension: string) {
  const file = join(dir, `next.config.${loaded++}.${extension}`)
  writeFileSync(file, text)
  const module = (await import(pathToFileURL(file).href)) as { default: Record<string, unknown> }
  return module.default
}

describe('editNextConfig', () => {
  it("adds the settings to create-next-app's config in its own style", async () => {
    const source = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`
    const { text, changed } = edit(source)
    expect(changed).toEqual(['transpilePackages', 'turbopack'])
    expect(text).toBe(`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@advui/core",
    "@advui/theme",
    "@advui/icons",
    "@advui/utils",
    "react-native-web",
  ],
  // Adv UI is written for React Native; on the web, React Native Web stands in for it.
  turbopack: {
    resolveAlias: { "react-native": "react-native-web" },
    resolveExtensions: [
      ".web.tsx",
      ".web.ts",
      ".web.js",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".json",
    ],
  },
};

export default nextConfig;
`)
    expect(await load(text, 'ts')).toEqual(settings)
    expect(edit(text)).toEqual({ text, changed: [] })
  })

  it('merges into settings the app already has, and keeps its own', async () => {
    const source = `const withMDX = (config) => config

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['some-lib'],
  turbopack: {
    rules: { '*.svg': { loaders: ['@svgr/webpack'], as: '*.js' } },
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json']
  }
}

module.exports = withMDX(nextConfig)
`
    const { text, changed } = edit(source)
    expect(changed).toEqual([
      'transpilePackages',
      'turbopack.resolveExtensions',
      'turbopack.resolveAlias',
    ])
    expect(await load(text, 'cjs')).toEqual({
      reactStrictMode: true,
      transpilePackages: [
        'some-lib',
        '@advui/core',
        '@advui/theme',
        '@advui/icons',
        '@advui/utils',
        'react-native-web',
      ],
      turbopack: {
        rules: { '*.svg': { loaders: ['@svgr/webpack'], as: '*.js' } },
        // The `.web` files go before the ones they stand in for.
        resolveExtensions: [
          '.mdx',
          '.web.tsx',
          '.web.ts',
          '.web.js',
          '.tsx',
          '.ts',
          '.jsx',
          '.js',
          '.mjs',
          '.json',
        ],
        resolveAlias: { 'react-native': 'react-native-web' },
      },
    })
    expect(edit(text).changed).toEqual([])
  })

  it('fills empty and one-line configs', async () => {
    for (const source of [
      'export default {}\n',
      'export default { reactStrictMode: true }\n',
      "export default { turbopack: { root: '.' } }\n",
      '/** @type {import("next").NextConfig} */\nconst nextConfig = {};\nexport default nextConfig;\n',
    ]) {
      const { text } = edit(source)
      expect(await load(text, 'mjs')).toMatchObject(settings)
      expect(text.split('\n').every((line) => line.length <= 90)).toBe(true)
    }
    // A one-line object opens up, one member per line, also when only its members change.
    const extensions = (settings.turbopack as { resolveExtensions: string[] }).resolveExtensions
    expect(edit("export default { transpilePackages: ['x'], turbopack: { root: '.' } }\n").text)
      .toBe(`export default {
  transpilePackages: [
    'x',
    '@advui/core',
    '@advui/theme',
    '@advui/icons',
    '@advui/utils',
    'react-native-web',
  ],
  turbopack: {
    root: '.',
    resolveAlias: { 'react-native': 'react-native-web' },
    resolveExtensions: [
${extensions.map((extension) => `      '${extension}',\n`).join('')}    ],
  }
}
`)
  })

  it('is not misled by brackets in strings, templates, comments and regexes', async () => {
    const source = `const base = 'docs'
// export default {}
const nextConfig = {
  basePath: \`/\${base}{\`, // }
  /* } */ env: { BRACE: '}' },
  webpack(config) {
    config.module.rules.push({ test: /[}\\]]\\.svg$/ })
    return config
  }
}
export default nextConfig
`
    const { text } = edit(source)
    const config = await load(text, 'mjs')
    expect(config).toMatchObject({ basePath: '/docs{', env: { BRACE: '}' }, ...settings })
    expect(typeof config.webpack).toBe('function')
  })

  it('keeps Windows line endings', () => {
    const { text } = edit(
      'const nextConfig = {\r\n  reactStrictMode: true\r\n}\r\n\r\nexport default nextConfig\r\n',
    )
    expect(text).toContain('reactStrictMode: true,\r\n  transpilePackages: [\r\n')
    expect(text.replace(/\r\n/g, '')).not.toContain('\n')
  })

  it('says why it leaves a config it cannot edit', () => {
    const error = (source: string) => editNextConfig(source, settings)
    expect(error('module.exports = (phase) => ({})')).toEqual({
      error: 'its config is not an object literal',
    })
    expect(error('const nextConfig = {}')).toEqual({ error: 'it has no default export' })
    expect(error('export default { ...base, reactStrictMode: true }')).toEqual({
      error: 'its config spreads another object',
    })
    expect(error('export default { turbopack: { ...turbo } }')).toEqual({
      error: 'turbopack spreads another object',
    })
    expect(error('export default { transpilePackages: packages }')).toEqual({
      error: 'transpilePackages is not a list of strings',
    })
    expect(
      error(
        "export default { turbopack: { resolveAlias: { 'react-native': 'react-native-tvos' } } }",
      ),
    ).toEqual({ error: "turbopack.resolveAlias['react-native'] is set to 'react-native-tvos'" })
  })
})

describe('removeCacheComponents', () => {
  const removed = (source: string) => removeCacheComponents(source).text

  it("takes create-next-app's settings out and keeps the rest of the file", async () => {
    const source = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
`
    const result = removeCacheComponents(source)
    expect(result.removed).toEqual(['cacheComponents', 'partialPrefetching'])
    expect(result.text).toBe(`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`)
    const { text, changed } = edit(result.text)
    expect(changed).toEqual(['transpilePackages', 'turbopack'])
    expect(await load(text, 'ts')).toEqual(settings)
  })

  it('leaves neighbours and their commas in a valid config', async () => {
    const cases: [string, unknown][] = [
      ['export default { cacheComponents: true }\n', {}],
      ['export default { cacheComponents: true, }\n', {}],
      [
        'export default { cacheComponents: true, reactStrictMode: true }\n',
        { reactStrictMode: true },
      ],
      [
        'export default { reactStrictMode: true, cacheComponents: true }\n',
        { reactStrictMode: true },
      ],
      [
        'export default { a: 1, cacheComponents: true, partialPrefetching: true, b: 2 }\n',
        { a: 1, b: 2 },
      ],
      ['export default { a: 1, cacheComponents: true, partialPrefetching: true }\n', { a: 1 }],
      ['export default {\n  a: 1,\n  cacheComponents: true\n}\n', { a: 1 }],
      ['export default {\n  cacheComponents: true, // on\n  a: 1,\n}\n', { a: 1 }],
      ["export default { 'cacheComponents': true, a: 1 }\n", { a: 1 }],
    ]
    for (const [source, expected] of cases)
      expect(await load(removed(source), 'mjs')).toEqual(expected)
  })

  it('keeps comments beside other members, and Windows line endings', () => {
    expect(removed('export default {\n  /* keep */ cacheComponents: true,\n}\n')).toContain('keep')
    expect(removed('export default {\r\n  cacheComponents: true,\r\n  a: 1,\r\n}\r\n')).toBe(
      'export default {\r\n  a: 1,\r\n}\r\n',
    )
  })

  it('removes both only when Cache Components is on', () => {
    for (const source of [
      'export default { reactStrictMode: true }\n',
      'export default { cacheComponents: false, partialPrefetching: false }\n',
      'export default (phase) => ({ cacheComponents: true })\n',
    ])
      expect(removeCacheComponents(source)).toEqual({ text: source, removed: [], unread: false })
    const source = 'export default { cacheComponents: process.env.CACHE === "1" }\n'
    expect(removeCacheComponents(source)).toEqual({ text: source, removed: [], unread: true })
  })
})

describe('setUpNextConfig', () => {
  /** A project folder with this config, and these other files. */
  function project(name: string, config: string, files: Record<string, string> = {}) {
    const root = join(dir, name)
    mkdirSync(root, { recursive: true })
    writeFileSync(join(root, 'next.config.mjs'), config)
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, path)), { recursive: true })
      writeFileSync(join(root, path), text)
    }
    return root
  }
  const on = 'export default { cacheComponents: true, partialPrefetching: true }\n'

  it('updates a config that needs nothing but the removal', () => {
    const edited = editNextConfig('export default {\n}\n', settings)
    if ('error' in edited) throw new Error(edited.error)
    const config = edited.text.replace('{\n', '{\n  cacheComponents: true,\n')
    const root = project('only-removal', config)
    expect(setUpNextConfig(root, false, {})).toMatchObject({
      status: 'updated',
      changed: [],
      removed: ['cacheComponents'],
    })
    expect(readFileSync(join(root, 'next.config.mjs'), 'utf8')).toBe(edited.text)
  })

  it("keeps it when the project uses 'use cache', in any form", () => {
    for (const [name, directive] of [
      ['plain', `'use cache'`],
      ['double', `"use cache"`],
      ['remote', `'use cache: remote'`],
    ] as const) {
      const root = project(`uses-${name}`, on, {
        'src/app/page.tsx': `${directive}\nexport default function Page() {}\n`,
      })
      const result = setUpNextConfig(root, false, {})
      expect(result).toMatchObject({ status: 'updated', removed: [] })
      expect(result.warning).toContain(`${join('src', 'app', 'page.tsx')} uses 'use cache'`)
      expect(readFileSync(join(root, 'next.config.mjs'), 'utf8')).toContain('cacheComponents: true')
    }
  })

  it("does not take a mention of 'use cache' or a dependency for a use of it", () => {
    const root = project('not-used', on, {
      'app/page.tsx': `export const note = "we might 'use cache' later"\n`,
      'node_modules/lib/index.js': `'use cache'\n`,
      '.next/server/page.js': `'use cache'\n`,
    })
    const result = setUpNextConfig(root, false, {})
    expect(result).toMatchObject({ removed: ['cacheComponents', 'partialPrefetching'] })
    expect(result.warning).toBeUndefined()
  })

  it('warns when it cannot tell, or cannot edit the file', () => {
    const unread = project('unread', 'export default { cacheComponents: enabled }\n')
    expect(setUpNextConfig(unread, false, {})).toMatchObject({ status: 'updated', removed: [] })
    expect(setUpNextConfig(unread, false, {}).warning).toContain(
      'keeps cacheComponents, as its value could not be read',
    )
    const spread = 'export default { ...base, cacheComponents: true }\n'
    const skipped = setUpNextConfig(project('spread', spread), false, {})
    expect(skipped).toMatchObject({ status: 'skipped', removed: [] })
    expect(skipped.warning).toContain('remove cacheComponents and partialPrefetching from')
    const root = project('function', 'export default () => ({ cacheComponents: true })\n')
    expect(setUpNextConfig(root, false, {}).warning).toContain('remove cacheComponents')
    expect(readFileSync(join(root, 'next.config.mjs'), 'utf8')).toContain('cacheComponents: true')
  })
})

describe('nextSettings', () => {
  it('transpiles the optional packages the app has', () => {
    expect(nextSettings({ '@advui/charts': '^0.15.0' }).transpilePackages).toEqual([
      '@advui/core',
      '@advui/theme',
      '@advui/icons',
      '@advui/utils',
      '@advui/charts',
      'react-native-web',
    ])
  })
})
