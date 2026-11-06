#!/usr/bin/env node
// Builds the phone preview: the playground as a self-hosted update that Expo Go
// opens, for `wrangler` to deploy with the Worker in `worker.mjs`.
// Usage: pnpm --filter @advui/expo-playground preview:build
import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createManifest } from './manifest.mjs'

const app = join(import.meta.dirname, '..')
const out = join(app, 'dist-preview')

const expo = (...args) =>
  execFileSync('npx', ['expo', ...args], {
    cwd: app,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'inherit'],
  })

rmSync(out, { recursive: true, force: true })

// Expo Go takes Hermes bytecode only from EAS Update, and EAS Update only for a
// project's own members, so visitors need plain JavaScript from another host.
expo(
  'export',
  '--platform',
  'android',
  '--platform',
  'ios',
  '--no-bytecode',
  '--output-dir',
  'dist-preview',
)

const config = JSON.parse(expo('config', '--json', '--type', 'public'))
const { fileMetadata } = JSON.parse(readFileSync(join(out, 'metadata.json'), 'utf8'))
const createdAt = new Date().toISOString()

for (const [platform, files] of Object.entries(fileMetadata)) {
  const manifest = createManifest({
    files,
    read: (path) => readFileSync(join(out, path)),
    config,
    createdAt,
  })
  writeFileSync(join(out, `${platform}.json`), JSON.stringify(manifest))
  console.log(`${platform}: ${manifest.assets.length} assets, update ${manifest.id}`)
}
