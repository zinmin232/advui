import { Animated } from 'react-native'

/** How long nothing may animate before a change counts as finished. */
const quietFor = 250
/**
 * A looping animation never ends, so a change stops waiting after this. It is
 * long because Theme's 80 springs take over 5 seconds on an emulator with no GPU,
 * and any left running slow down the next measurement.
 */
const settleTimeout = 30_000

export interface Measurement {
  /**
   * Milliseconds to the first frame after React's commit: rendering, and the
   * layout effects where Tamagui's driver starts its springs. These run on the
   * JS thread, so this is the part that a phone feels as a stall.
   */
  frame: number
  /** Milliseconds until the last animation ended. */
  settled: number
  springs: number
  timings: number
}

const nextFrame = () => new Promise<number>(requestAnimationFrame)

/**
 * Counts what starts until `stop`. Tamagui's driver looks up `Animated[type]`
 * at each start, so replacing the two functions reaches it, and nothing outside
 * the playground carries any of this.
 */
function watchAnimations() {
  const { spring, timing } = Animated
  const watch = {
    springs: 0,
    timings: 0,
    running: 0,
    lastChange: 0,
    stop: () => Object.assign(Animated, { spring, timing }),
  }
  const counted =
    <Config,>(
      create: (value: never, config: Config) => Animated.CompositeAnimation,
      count: 'springs' | 'timings',
    ) =>
    (value: never, config: Config) => {
      const animation = create(value, config)
      const { start } = animation
      // Here rather than in `start`, which a loop calls again for each round.
      watch[count]++
      animation.start = (callback) => {
        watch.running++
        watch.lastChange = performance.now()
        start((result) => {
          watch.running--
          watch.lastChange = performance.now()
          callback?.(result)
        })
      }
      return animation
    }
  Object.assign(Animated, {
    spring: counted(spring as never, 'springs'),
    timing: counted(timing as never, 'timings'),
  })
  return watch
}

/** Times a state change, from the call to the end of what it animates. */
export async function timeChange(
  change: () => void,
  whenCommitted: () => Promise<void>,
): Promise<Measurement> {
  const watch = watchAnimations()
  const started = performance.now()
  const committed = whenCommitted()
  change()
  await committed
  await nextFrame()
  const frame = performance.now() - started

  const deadline = performance.now() + settleTimeout
  do {
    await nextFrame()
  } while (
    (watch.running > 0 || performance.now() - watch.lastChange < quietFor) &&
    performance.now() < deadline
  )
  watch.stop()

  const { springs, timings, running, lastChange } = watch
  // With animations still running, the last change is not where they ended.
  const end = running > 0 ? performance.now() : lastChange
  return { frame, settled: Math.max(frame, end - started), springs, timings }
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  return Math.round(sorted[Math.floor(sorted.length / 2)] ?? 0)
}

/** Times are noisy, so their middle value. A count should not vary, so its highest. */
export const summarize = (runs: Measurement[]): Measurement => ({
  frame: median(runs.map(({ frame }) => frame)),
  settled: median(runs.map(({ settled }) => settled)),
  springs: Math.max(...runs.map(({ springs }) => springs)),
  timings: Math.max(...runs.map(({ timings }) => timings)),
})
