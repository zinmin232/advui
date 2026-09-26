import { render } from '@testing-library/react-native'
import { createUniversalConfig } from '@adv-ui/theme'
import type { ReactElement } from 'react'
import { UniversalProvider } from '../src/provider/UniversalProvider'

const config = createUniversalConfig()

export async function renderNative(ui: ReactElement, colorMode: 'light' | 'dark' = 'light') {
  return await render(
    <UniversalProvider config={config} colorMode={colorMode} toaster={false}>
      {ui}
    </UniversalProvider>,
  )
}
