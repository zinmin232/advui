#!/usr/bin/env node
// Compares a run of `capture.mjs` with the approved screenshots, and writes each
// change and a summary to the report folder. It fails when a screen has changed.
// Usage: pnpm --filter @advui/expo-playground screenshots:compare <approved> [current] [report]
import { join } from 'node:path'
import { findChanges, hasShots, writeReport } from './changes.mjs'

const app = join(import.meta.dirname, '..')
const [
  approved,
  current = join(app, 'dist-screenshots'),
  report = join(app, 'dist-screenshots-report'),
] = process.argv.slice(2)

if (!approved) {
  console.error('Usage: compare.mjs <approved> [current] [report]')
  process.exit(2)
}
for (const folder of [approved, current]) {
  if (hasShots(folder)) continue
  console.error(`No screenshots in ${folder}`)
  process.exit(2)
}

const changes = findChanges(approved, current)
console.log(writeReport(changes, approved, current, report))
if (changes.changed.length) process.exit(1)
