import { IconProvider, type IconRegistry } from '@advui/icons'
import type { ReactNode } from 'react'
import { TamaguiProvider, type TamaguiInternalConfig, type TamaguiProviderProps } from 'tamagui'
import { Toaster, type ToasterProps } from '../components/toast/Toaster'
import type { ColorModePreference } from '../types'
import { ColorModeProvider } from './ColorMode'
import { GlobalStyles } from './GlobalStyles'

export interface UniversalProviderProps {
  /** Result of `createUniversalConfig()`. */
  config: TamaguiInternalConfig
  children: ReactNode
  /** Controlled color mode. Omit to let the provider manage it. */
  colorMode?: ColorModePreference
  /** Initial color mode when uncontrolled. Default: `system`. */
  defaultColorMode?: ColorModePreference
  onColorModeChange?: (mode: ColorModePreference) => void
  /** Swap or extend the icons used by `<Icon name="…" />` and components. */
  icons?: IconRegistry
  /** Options for the built-in toast viewport, or `false` to render your own `<Toaster />`. */
  toaster?: ToasterProps | false
  /** Skip Tamagui's runtime CSS injection when you ship a pre-generated stylesheet. */
  disableInjectCSS?: boolean
  /**
   * Native safe-area insets (e.g. from `useSafeAreaInsets()`). Overlays such
   * as toasts use them to stay clear of the notch and home indicator.
   */
  insets?: TamaguiProviderProps['insets']
}

/**
 * Root provider for Adv UI. Wraps Tamagui's provider and adds color-mode
 * management, reduced-motion handling, the icon registry and toasts.
 */
export function UniversalProvider({
  config,
  children,
  colorMode,
  defaultColorMode,
  onColorModeChange,
  icons,
  toaster = {},
  disableInjectCSS,
  insets,
}: UniversalProviderProps) {
  const content = (
    <>
      {children}
      {toaster === false ? null : <Toaster {...toaster} />}
    </>
  )

  return (
    <ColorModeProvider
      colorMode={colorMode}
      defaultColorMode={defaultColorMode}
      onColorModeChange={onColorModeChange}
    >
      {(resolved) => (
        <TamaguiProvider
          config={config}
          defaultTheme={resolved}
          disableInjectCSS={disableInjectCSS}
          insets={insets}
        >
          <GlobalStyles />
          {icons ? <IconProvider icons={icons}>{content}</IconProvider> : content}
        </TamaguiProvider>
      )}
    </ColorModeProvider>
  )
}
