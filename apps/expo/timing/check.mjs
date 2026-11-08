#!/usr/bin/env node
// Prints a run of `run.mjs` as a table, and fails when a screen started more
// animations than `budget.json` allows. Times are reported and never fail: an
// emulator with no GPU is too slow and too uneven to hold them to a number.
// Usage: pnpm --filter @advui/expo-playground timing:check [report folder]
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { findOverBudget, summarize } from './report.mjs'

const file = join(process.argv[2] ?? join(import.meta.dirname, '..', 'dist-timing'), 'report.json')
if (!existsSync(file)) {
  console.error(`No report at ${file}: run the timing script first`)
  process.exit(2)
}

const rows = JSON.parse(readFileSync(file, 'utf8'))
const budget = JSON.parse(readFileSync(join(import.meta.dirname, 'budget.json'), 'utf8'))
console.log(summarize(rows, budget))
if (findOverBudget(rows, budget).length) process.exit(1)
