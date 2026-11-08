import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { act, render } from '@testing-library/react-native'
import { createUniversalConfig } from '@advui/theme'
import { PlusIcon } from '@advui/icons'
import type { ReactNode } from 'react'
import { AccessibilityInfo, Animated } from 'react-native'
import { IconButton } from '../components/icon-button/IconButton'
import { Tooltip } from '../components/tooltip/Tooltip'
import { UniversalProvider } from '../provider/UniversalProvider'
import { useReducedMotion } from './useReducedMotion'

const config = createUniversalConfig()

/** "Remove animations" switched on (or off) in Android's settings while the app runs. */
async function setReduceMotion(on: boolean) {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(on)
  // Typed by addEventListener's last overload, which is for another event.
  const calls = jest.mocked(AccessibilityInfo.addEventListener).mock.calls as unknown as Array<
    [string, (value: boolean) => void]
  >
  const listeners = calls
    .filter(([event]) => event === 'reduceMotionChanged')
    .map(([, listener]) => listener)
  await act(() => {
    for (const listener of listeners) listener(on)
  })
}

describe('useReducedMotion on native', () => {
  afterEach(() => setReduceMotion(false))

  it('gives a component that mounts later the answer on its first render', async () => {
    await setReduceMotion(true)
    const answers: boolean[] = []
    function Probe() {
      answers.push(useReducedMotion())
      return null
    }
    await render(<Probe />)
    await act(async () => {})
    expect(answers).toEqual([true])
  })

  it('a Tooltip mounted with it on does not restart its trigger’s springs', async () => {
    // Tooltip clones its trigger on each render, so a second render restarted
    // the IconButton's color springs: on GitHub's emulator, which runs with
    // animations off, the Admin example's ten Tooltips started 51 more.
    await setReduceMotion(true)
    const spring = jest.spyOn(Animated, 'spring')
    const springsOnMount = async (children: ReactNode) => {
      spring.mockClear()
      const view = await render(
        <UniversalProvider config={config} toaster={false}>
          {children}
        </UniversalProvider>,
      )
      // The answers that came after the first render, before this change.
      await act(async () => {})
      const count = spring.mock.calls.length
      await view.unmount()
      return count
    }
    try {
      const alone = await springsOnMount(<IconButton aria-label="Edit" icon={<PlusIcon />} />)
      const inTooltip = await springsOnMount(
        <Tooltip content="Edit">
          <IconButton aria-label="Edit" icon={<PlusIcon />} />
        </Tooltip>,
      )
      expect(alone).toBeGreaterThan(0)
      expect(inTooltip).toBe(alone)
    } finally {
      spring.mockRestore()
    }
  })
})
