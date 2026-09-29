import { type ColorModePreference, UniversalProvider } from '@advui/core'
import { createUniversalConfig } from '@advui/theme'
import { type RenderOptions, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'

export const testConfig = createUniversalConfig()

/** Renders inside the app's provider, from @advui/core like an app would. */
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
