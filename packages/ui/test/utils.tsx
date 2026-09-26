import { createUniversalConfig } from '@adv-ui/theme'
import { type RenderOptions, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { UniversalProvider } from '../src/provider/UniversalProvider'
import type { ColorModePreference } from '../src/types'

export const testConfig = createUniversalConfig()

export function renderWithProvider(
  ui: ReactElement,
  { colorMode = 'light', ...options }: RenderOptions & { colorMode?: ColorModePreference } = {},
) {
  // pointerEventsCheck: 0 lets tests attempt clicks on disabled (pointer-events: none) controls
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const result = render(
    <UniversalProvider config={testConfig} colorMode={colorMode}>
      {ui}
    </UniversalProvider>,
    options,
  )
  return { user, ...result }
}

export * from '@testing-library/react'
