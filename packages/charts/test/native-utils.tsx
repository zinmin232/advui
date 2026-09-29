import { UniversalProvider } from '@advui/core'
import { createUniversalConfig } from '@advui/theme'
import { render } from '@testing-library/react-native'
import type { ReactElement } from 'react'

const config = createUniversalConfig()

export async function renderNative(ui: ReactElement, colorMode: 'light' | 'dark' = 'light') {
  return await render(
    <UniversalProvider config={config} colorMode={colorMode} toaster={false}>
      {ui}
    </UniversalProvider>,
  )
}
