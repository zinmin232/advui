#!/usr/bin/env node
// Starts Metro for an Android emulator/device over USB and opens the app in Expo Go.
// Works around two common local issues:
//  - `expo start --localhost` binds IPv6 (::1) only, but `adb reverse` connects over IPv4;
//  - LAN IPs are often blocked by firewalls, so the bundle never finishes downloading.
// Usage: pnpm --filter @adv-ui/expo-playground android:emulator
import { execFileSync, spawn } from 'node:child_process'

const port = process.env.RCT_METRO_PORT ?? '8081'
const adb = process.env.ANDROID_HOME ? `${process.env.ANDROID_HOME}/platform-tools/adb` : 'adb'

try {
  execFileSync(adb, ['reverse', `tcp:${port}`, `tcp:${port}`], { stdio: 'inherit' })
} catch {
  console.error('adb reverse failed — is an emulator or device connected? (adb devices)')
  process.exit(1)
}

const expo = spawn('npx', ['expo', 'start', '--port', port], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: '127.0.0.1' },
})

// Give Metro a moment, then deep-link Expo Go to the reversed port.
setTimeout(() => {
  try {
    execFileSync(
      adb,
      [
        'shell',
        'am',
        'start',
        '-a',
        'android.intent.action.VIEW',
        '-d',
        `exp://127.0.0.1:${port}`,
        'host.exp.exponent',
      ],
      {
        stdio: 'ignore',
      },
    )
  } catch {
    console.warn('Could not open Expo Go automatically — install it or press "a" in the Expo CLI.')
  }
}, 8000)

expo.on('exit', (code) => process.exit(code ?? 0))
