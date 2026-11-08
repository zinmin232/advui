#!/usr/bin/env node
// Opens the playground's /timing screen on an Android emulator, waits for its
// numbers and writes them to the report folder for `check.mjs`. It needs an
// emulator with Expo Go, and the phone preview on port 8787: `preview:build`,
// then `preview:dev`. It clears Expo Go's data first.
// Usage: pnpm --filter @advui/expo-playground timing [folder] [--runs 3]
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { parseArgs } from 'node:util'
import {
  adb,
  checkUpdateServer,
  open,
  openPlayground,
  port,
  shell,
} from '../screenshots/emulator.mjs'
import { parseReport } from './report.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { runs: { type: 'string', default: '3' } },
})
const out = positionals[0] ?? join(import.meta.dirname, '..', 'dist-timing')
/** Several minutes a round on an emulator with no GPU. */
const runTimeout = 30 * 60_000

async function waitForReport() {
  const deadline = Date.now() + runTimeout
  while (Date.now() < deadline) {
    const rows = parseReport(adb('logcat', '-d', '-s', 'ReactNativeJS:I').toString())
    if (rows) return rows
    await sleep(5_000)
  }
  throw new Error(`/timing did not finish within ${runTimeout / 60_000} minutes`)
}

await checkUpdateServer()
adb('reverse', `tcp:${port}`, `tcp:${port}`)
// A just booted emulator can show "Pixel Launcher isn't responding" over Expo Go.
shell('settings put global hide_error_dialogs 1')
try {
  await openPlayground()
  adb('logcat', '-c')
  const started = Date.now()
  open(`/timing?runs=${values.runs}`)
  const rows = await waitForReport()

  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, 'report.json'), JSON.stringify(rows, null, 2))
  const seconds = Math.round((Date.now() - started) / 1000)
  console.log(`${rows.length} steps in ${seconds} s, written to ${out}`)
} finally {
  shell('settings put global hide_error_dialogs 0')
}
