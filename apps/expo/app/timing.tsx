import { Text, VStack, useColorMode } from '@advui/core'
import { appExamples } from '@advui/examples'
import { Stack, useLocalSearchParams } from 'expo-router'
import { type ComponentType, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { ScreenScrollView } from '../ScreenScrollView'
import { type Measurement, summarize, timeChange } from '../timing/measure'
import ThemeScreen from './theme'

/** Long enough for the screen's own push to end, which is not part of a measurement. */
const startDelay = 1_000

interface TimedScreen {
  name: string
  Component: ComponentType
  fill?: boolean
}

interface Row extends Measurement {
  screen: string
  step: string
}

/** Theme is where a mode switch once took 2 seconds on a phone (Phase 10). */
const screens: TimedScreen[] = [
  { name: 'theme', Component: ThemeScreen, fill: true },
  ...appExamples.map(({ slug, Component, fill }) => ({ name: slug, Component, fill })),
]

/**
 * Mounts each heavy screen and switches its color mode, then shows the numbers
 * and logs them for `timing/run.mjs`. Nothing links here: open `/timing` by its
 * address, on an emulator or a phone, with `?runs=` for the number of rounds.
 */
export default function TimingScreen() {
  const { runs = '7' } = useLocalSearchParams<{ runs?: string }>()
  const { colorMode, setColorMode } = useColorMode()
  const [screen, setScreen] = useState<TimedScreen | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [failure, setFailure] = useState<string>()
  const committed = useRef<() => void>(null)
  // It compares with the mode of its own render, so a run needs the latest one.
  const setMode = useRef(setColorMode)

  // After every layout effect inside this screen, as parents run theirs last.
  useLayoutEffect(() => {
    setMode.current = setColorMode
    committed.current?.()
  })

  useEffect(() => {
    const whenCommitted = () =>
      new Promise<void>((resolve) => {
        committed.current = resolve
      })
    const run = async () => {
      setMode.current('light')
      await new Promise((resolve) => setTimeout(resolve, startDelay))

      const samples = new Map<string, Measurement[]>()
      const measure = async (name: string, step: string, change: () => void) => {
        const measurement = await timeChange(change, whenCommitted)
        const key = `${name}\n${step}`
        samples.set(key, [...(samples.get(key) ?? []), measurement])
      }
      for (let round = 0; round < Number(runs); round++) {
        for (const timed of screens) {
          await measure(timed.name, 'mount', () => setScreen(timed))
          await measure(timed.name, 'dark', () => setMode.current('dark'))
          await measure(timed.name, 'light', () => setMode.current('light'))
          await timeChange(() => setScreen(null), whenCommitted)
        }
      }

      const results = [...samples].map(([key, measurements]) => {
        const [name = '', step = ''] = key.split('\n')
        return { screen: name, step, ...summarize(measurements) }
      })
      setMode.current(colorMode)
      setRows(results)
      for (const row of results) console.log(`advui-timing ${JSON.stringify(row)}`)
      console.log('advui-timing done')
    }
    // A production bundle says nothing about a rejected promise.
    run().catch((error: unknown) => {
      setScreen(null)
      setFailure(String(error))
      console.log(`advui-timing failed: ${String(error)}`)
    })
    // One run per visit, with the mode the screen opened in to go back to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (screen) {
    const { Component, fill } = screen
    return fill ? (
      <View style={{ flex: 1 }}>
        <Component />
      </View>
    ) : (
      <ScreenScrollView>
        <Component />
      </ScreenScrollView>
    )
  }
  return (
    <ScreenScrollView>
      <Stack.Screen options={{ title: 'Timing' }} />
      <VStack padding="4" gap="2">
        {rows.length ? null : <Text tone="muted">{failure ?? 'Measuring…'}</Text>}
        {rows.map(({ screen: name, step, frame, settled, springs, timings }) => (
          <Text key={`${name} ${step}`} size="sm">
            {`${name} ${step}: first frame ${frame} ms, settled ${settled} ms, ${springs} springs, ${timings} timings`}
          </Text>
        ))}
      </VStack>
    </ScreenScrollView>
  )
}
