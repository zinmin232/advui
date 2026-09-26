import { type ReactNode, createContext, useContext, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { useControllableState } from '../hooks/useControllableState'
import type { ColorModePreference, ResolvedColorMode } from '../types'

export interface ColorModeContextValue {
  /** What the user picked: `light`, `dark` or follow the `system`. */
  colorMode: ColorModePreference
  /** The mode actually applied. */
  resolvedColorMode: ResolvedColorMode
  setColorMode: (mode: ColorModePreference) => void
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null)

export interface ColorModeProviderProps {
  colorMode?: ColorModePreference
  defaultColorMode?: ColorModePreference
  onColorModeChange?: (mode: ColorModePreference) => void
  children: (resolved: ResolvedColorMode) => ReactNode
}

export function ColorModeProvider({
  colorMode: colorModeProp,
  defaultColorMode = 'system',
  onColorModeChange,
  children,
}: ColorModeProviderProps) {
  const system = useColorScheme()
  const [colorMode, setColorMode] = useControllableState<ColorModePreference>({
    value: colorModeProp,
    defaultValue: defaultColorMode,
    onChange: onColorModeChange,
  })
  const resolvedColorMode: ResolvedColorMode =
    colorMode === 'system' ? (system === 'dark' ? 'dark' : 'light') : colorMode

  const value = useMemo(
    () => ({ colorMode, resolvedColorMode, setColorMode }),
    [colorMode, resolvedColorMode, setColorMode],
  )

  return (
    <ColorModeContext.Provider value={value}>
      {children(resolvedColorMode)}
    </ColorModeContext.Provider>
  )
}

/** Read and change the light/dark/system preference from anywhere in the tree. */
export function useColorMode(): ColorModeContextValue {
  const context = useContext(ColorModeContext)
  if (!context) {
    throw new Error('[adv-ui] useColorMode must be used inside <UniversalProvider>.')
  }
  return context
}
