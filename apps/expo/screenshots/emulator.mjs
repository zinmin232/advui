import { execFileSync } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { findView } from './screens.mjs'

export const port = 8787
export const expoGo = 'host.exp.exponent'
/** The first screen to open loads every example, which takes seconds. */
export const openTimeout = 120_000
/** Android's "Remove animations": React Native reports reduced motion when they are 0. */
export const animationScales = [
  'window_animation_scale',
  'transition_animation_scale',
  'animator_duration_scale',
]

const adbPath = process.env.ANDROID_HOME ? `${process.env.ANDROID_HOME}/platform-tools/adb` : 'adb'
export const adb = (...args) =>
  execFileSync(adbPath, args, { maxBuffer: 64 * 1024 * 1024, timeout: 30_000 })
export const shell = (command) => adb('shell', command).toString().trim()

export const open = (path) =>
  shell(`am start -a android.intent.action.VIEW -d 'exp://127.0.0.1:${port}/--${path}' ${expoGo}`)

/** The views on screen. A dump fails while the screen is busy, so a caller tries again. */
function dumpViews() {
  try {
    return adb('exec-out', 'uiautomator', 'dump', '/dev/tty').toString()
  } catch {
    return ''
  }
}

export async function waitForView(label) {
  const deadline = Date.now() + openTimeout
  while (Date.now() < deadline) {
    const view = findView(dumpViews(), label)
    if (view) return view
    await sleep(500)
  }
  throw new Error(`"${label}" did not show within ${openTimeout / 1000}s`)
}

export async function openPlayground() {
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

/** Stops here with the fix, rather than on Expo Go's error screen. */
export async function checkUpdateServer() {
  const headers = { 'expo-platform': 'android' }
  const answer = await fetch(`http://127.0.0.1:${port}/`, { headers }).catch(() => null)
  if (answer?.ok) return
  throw new Error(
    `Nothing serves the playground on port ${port}: run preview:build, then preview:dev`,
  )
}
