#!/usr/bin/env node
// Opens every playground screen on an Android emulator, in light and dark mode,
// and saves a screenshot of each for `compare.mjs`. It needs an emulator with
// Expo Go, and the phone preview on port 8787: `preview:build`, then `preview:dev`.
// It clears Expo Go's data first, and puts the emulator's settings back at the end.
// Usage: pnpm --filter @advui/expo-playground screenshots [folder] [--only text]
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { PNG } from 'pngjs'
import { movingFile } from './changes.mjs'
import {
  adb,
  animationScales,
  checkUpdateServer,
  expoGo,
  open,
  openPlayground,
  openTimeout,
  port,
  shell,
  waitForView,
} from './emulator.mjs'
import { allScreens } from './screens.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { only: { type: 'string' } },
})
const out = positionals[0] ?? join(import.meta.dirname, '..', 'dist-screenshots')

// Tall enough to hold nearly every example, so nothing has to scroll: a scroll
// lands a few pixels differently each time.
const display = { width: 720, height: 2880, density: '320' }
/** Rows left out of every frame: the status bar's icons come and go by themselves. */
const statusBarRows = 64
/** Every run's date: calendars open on today, which would look like a change each night. */
const clock = { time: Date.parse('2026-06-17T10:00:00Z'), zone: 'UTC' }
/**
 * How long a screen holds still before its shot. A time, not a number of frames:
 * a frame takes about a second on a dev machine and 0.4 s on CI.
 */
const stillFor = 2_000
/** Longer for a player: with no network, its error comes seconds after the screen. */
const playerStillFor = 6_000
const isPlayer = (name) => /^(audio-player|video)--/.test(name)
/** Longer for Home: Expo Go's gear stays blue for a few seconds after its menu. */
const homeStillFor = 8_000
/** A screen that has not held still after this many of its holds never will. */
const stillTimeoutHolds = 8

const screenshot =() => ({ png: adb('exec-out', 'screencap', '-p') })

/** A frame below the status bar. Decoding takes most of a second, so only when needed. */
function decoded(frame) {
  if (!frame.image) {
    const { width, height, data } = PNG.sync.read(frame.png)
    const start = statusBarRows * width * 4
    frame.image = { width, height: height - statusBarRows, data: data.subarray(start) }
  }
  return frame.image
}

const sameFrame = (a, b) => a.png.equals(b.png) || decoded(a).data.equals(decoded(b).data)

function saveFrame(frame, file) {
  const { width, height, data } = decoded(frame)
  const png = new PNG({ width, height })
  png.data = data
  writeFileSync(file, PNG.sync.write(png))
}

function prepareEmulator() {
  adb('reverse', `tcp:${port}`, `tcp:${port}`)
  shell(`wm size ${display.width}x${display.height}`)
  shell(`wm density ${display.density}`)
  // React Native reports reduced motion at 0, which also holds autoplay still.
  for (const setting of animationScales) shell(`settings put global ${setting} 0`)
  shell('settings put global hide_error_dialogs 1')
  shell('settings put global auto_time 0')
  shell('settings put global auto_time_zone 0')
  shell(`cmd alarm set-timezone ${clock.zone}`)
  shell(`cmd alarm set-time ${clock.time}`)
  // With no network, remote photos fail the same way every time. Expo Go still
  // reaches the update, over `adb reverse`.
  shell('svc wifi disable')
  shell('svc data disable')
}

function restoreEmulator(zone) {
  shell('svc wifi enable')
  shell('svc data enable')
  shell(`cmd alarm set-timezone ${zone}`)
  shell(`cmd alarm set-time ${Date.now()}`)
  shell('settings put global auto_time 1')
  shell('settings put global auto_time_zone 1')
  shell('settings put global hide_error_dialogs 0')
  for (const setting of animationScales) shell(`settings put global ${setting} 1`)
  shell('wm density reset')
  shell('wm size reset')
  shell('cmd uimode night no')
}

/** Android keeps a forced size within three times the real screen, and reports no error. */
function checkDisplay() {
  const { width, height } = PNG.sync.read(screenshot().png)
  if (width === display.width && height === display.height) return
  throw new Error(
    `The display is ${width}x${height}, not ${display.width}x${display.height}: use an emulator with a bigger screen`,
  )
}

/** Takes frames from this one until the screen has held still for that long. */
async function settle(first, holdFor) {
  const deadline = Date.now() + holdFor * stillTimeoutHolds
  let frame = first
  let lastChange = Date.now()
  while (Date.now() - lastChange < holdFor && Date.now() < deadline) {
    const next = screenshot()
    if (!sameFrame(next, frame)) lastChange = Date.now()
    frame = next
  }
  return { frame, settled: Date.now() - lastChange >= holdFor }
}

const settleHome = async () => (await settle(screenshot(), homeStillFor)).frame

async function openScreen(path, home, holdFor) {
  open(path)
  const deadline = Date.now() + openTimeout
  let frame = screenshot()
  while (sameFrame(frame, home) && Date.now() < deadline) frame = screenshot()
  return settle(frame, holdFor)
}

async function reached(home) {
  const deadline = Date.now() + 5_000
  while (Date.now() < deadline) if (sameFrame(screenshot(), home)) return true
  return false
}

/**
 * Goes back to Home, and returns its frame. An example may hold a press of Back
 * for itself, so it can take a few. If Expo Go left or stopped answering, it
 * starts again.
 */
async function backTo(home) {
  for (let press = 0; press < 3; press++) {
    shell('input keyevent KEYCODE_BACK')
    if (await reached(home)) return home
  }
  console.log('Restarting Expo Go: Back did not reach Home')
  shell(`am force-stop ${expoGo}`)
  open('/')
  await waitForView('Theme settings')
  return settleHome()
}

async function captureMode(mode, screens) {
  const folder = join(out, mode)
  mkdirSync(folder, { recursive: true })
  shell(`cmd uimode night ${mode === 'dark' ? 'yes' : 'no'}`)
  let home = await settleHome()
  const moving = []

  for (const [index, { name, path }] of screens.entries()) {
    const file = join(folder, `${name}.png`)
    if (path === '/') {
      saveFrame(home, file)
      continue
    }
    const started = Date.now()
    const holdFor = isPlayer(name) ? playerStillFor : stillFor
    const { frame, settled } = await openScreen(path, home, holdFor)
    saveFrame(frame, file)
    if (!settled) moving.push(`${mode}/${name}.png`)
    home = await backTo(home)
    console.log(
      `${mode} ${index + 1}/${screens.length} ${name} ${Date.now() - started} ms${settled ? '' : ' (still moving)'}`,
    )
  }
  return moving
}

const screens =allScreens().filter(({ name }) => !values.only || name.includes(values.only))
await checkUpdateServer()
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const zone = shell('getprop persist.sys.timezone')
prepareEmulator()
try {
  await openPlayground()
  checkDisplay()
  const moving = []
  for (const mode of ['light', 'dark']) moving.push(...(await captureMode(mode, screens)))
  writeFileSync(join(out, movingFile), JSON.stringify(moving, null, 2))
  console.log(`${screens.length} screens in 2 modes, written to ${out}`)
} finally {
  // With the emulator gone this fails too, which must not hide why the run stopped.
  try {
    restoreEmulator(zone)
  } catch (error) {
    console.error(`Could not put the emulator's settings back: ${error.message}`)
  }
}
