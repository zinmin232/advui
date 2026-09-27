import { createUniversalConfig } from '@advui/theme'
import { material } from '@advui/theme/material'

// EXPO_PUBLIC_ADVUI_STYLE=material runs the playground with the Material 3
// preset (colors, pill buttons, 28px dialogs); tokens are fixed at startup.
export const config = createUniversalConfig(
  process.env.EXPO_PUBLIC_ADVUI_STYLE === 'material'
    ? material()
    : { preset: 'indigo', radius: 'md' },
)

export default config
