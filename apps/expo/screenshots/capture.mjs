#!/usr/bin/env node
// Opens every playground screen on an Android emulator, in light and dark mode,
// and saves a screenshot of each for `compare.mjs`. It needs an emulator with
// Expo Go, and the phone preview on port 8787: `preview:build`, then `preview:dev`.
// It clears Expo Go's data first, and puts the emulator's settings back at the end.
// Usage: pnpm --filter @advui/expo-playground screenshots [folder] [--only text]
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { parseArgs } from 'node:util'
import { PNG } from 'pngjs'
import { movingFile } from './changes.mjs'
import { allScreens, findView } from './screens.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { only: { type: 'string' } },
})
const out = positionals[0] ?? join(import.meta.dirname, '..', 'dist-screenshots')

const port = 8787
const expoGo = 'host.exp.exponent'
// Tall enough to hold nearly every example, so nothing has to scroll: a scroll
// lands a few pixels differently each time.
const display = { size: '720x2880', density: '320' }
/** Rows left out of every frame: the status bar's icons come and go by themselves. */
const statusBarRows = 64
const animations = [
  'window_animation_scale',
  'transition_animation_scale',
  'animator_duration_scale',
]
/** Every run's date: calendars open on today, which would look like a change each night. */
const clock = { time: Date.parse('2026-06-17T10:00:00Z'), zone: 'UTC' }
/** One frame takes about a second, so a screen holds still for two seconds. */
const stillFrames = 2
/** Longer for a player: with no network, its error comes up to three seconds after the screen. */
const playerStillFrames = 6
const isPlayer = (name) => /^(audio-player|video)--/.test(name)
/** Longer for Home: Expo Go's gear stays blue for a few seconds after its menu. */
const homeStillFrames = 8
const stillTimeoutPerFrame = 8_000
/** The first screen to open loads every example, which takes seconds. */
const openTimeout = 120_000

const adbPath = process.env.ANDROID_HOME ? `${process.env.ANDROID_HOME}/platform-tools/adb` : 'adb'
const adb = (...args) =>
  execFileSync(adbPath, args, { maxBuffer: 64 * 1024 * 1024, timeout: 30_000 })
const shell = (command) => adb('shell', command).toString().trim()

const open = (path) =>
  shell(`am start -a android.intent.action.VIEW -d 'exp://127.0.0.1:${port}/--${path}' ${expoGo}`)

const screenshot = () => ({ png: adb('exec-out', 'screencap', '-p') })

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
  shell(`wm size ${display.size}`)
  shell(`wm density ${display.density}`)
  // React Native reports reduced motion at 0, which also holds autoplay still.
  for (const setting of animations) shell(`settings put global ${setting} 0`)
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
  for (const setting of animations) shell(`settings put global ${setting} 1`)
  shell('wm density reset')
  shell('wm size reset')
  shell('cmd uimode night no')
}

/** The views on screen. A dump fails while the screen is busy, so a caller tries again. */
function dumpViews() {
  try {
    return adb('exec-out', 'uiautomator', 'dump', '/dev/tty').toString()
  } catch {
    return ''
  }
}

async function waitForView(label) {
  const deadline = Date.now() + openTimeout
  while (Date.now() < deadline) {
    const view = findView(dumpViews(), label)
    if (view) return view
    await sleep(500)
  }
  throw new Error(`"${label}" did not show within ${openTimeout / 1000}s`)
}

async function openPlayground() {
  shell(`pm clear ${expoGo}`)
  shell(`pm grant ${expoGo} android.permission.POST_NOTIFICATIONS`)
  open('/')
  // Expo Go shows its developer menu over the first screen it ever opens.
  for (const label of ['Continue', 'Close']) {
    const { x, y } = await waitForView(label)
    shell(`input tap ${x} ${y}`)
  }
  await waitForView('Theme settings')
}

/** Takes frames from this one until the screen holds still. */
async function settle(first, frames) {
  const deadline = Date.now() + frames * stillTimeoutPerFrame
  let frame = first
  let still = 0
  while (still < frames && Date.now() < deadline) {
    const next = screenshot()
    still = sameFrame(next, frame) ? still + 1 : 0
    frame = next
  }
  return { frame, settled: still === frames }
}

const settleHome = async () => (await settle(screenshot(), homeStillFrames)).frame

async function openScreen(path, home, frames) {
  open(path)
  const deadline = Date.now() + openTimeout
  let frame = screenshot()
  while (sameFrame(frame, home) && Date.now() < deadline) frame = screenshot()
  return settle(frame, frames)
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
    const frames = isPlayer(name) ? playerStillFrames : stillFrames
    const { frame, settled } = await openScreen(path, home, frames)
    saveFrame(frame, file)
    if (!settled) moving.push(`${mode}/${name}.png`)
    home = await backTo(home)
    console.log(
      `${mode} ${index + 1}/${screens.length} ${name} ${Date.now() - started} ms${settled ? '' : ' (still moving)'}`,
    )
  }
  return moving
}

/** Stops here with the fix, rather than on Expo Go's error screen. */
async function checkUpdateServer() {
  const headers = { 'expo-platform': 'android' }
  const answer = await fetch(`http://127.0.0.1:${port}/`, { headers }).catch(() => null)
  if (answer?.ok) return
  throw new Error(
    `Nothing serves the playground on port ${port}: run preview:build, then preview:dev`,
  )
}

const screens = allScreens().filter(({ name }) => !values.only || name.includes(values.only))
await checkUpdateServer()
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const zone = shell('getprop persist.sys.timezone')
prepareEmulator()
try {
  await openPlayground()
  const moving = []
  for (const mode of ['light', 'dark']) moving.push(...(await captureMode(mode, screens)))
  writeFileSync(join(out, movingFile), JSON.stringify(moving, null, 2))
  console.log(`${screens.length} screens in 2 modes, written to ${out}`)
} finally {
  restoreEmulator(zone)
}
