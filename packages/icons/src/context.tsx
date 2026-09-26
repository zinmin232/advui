import { type ReactNode, createContext, useContext, useMemo } from 'react'
import type { IconComponent } from './types'

export interface IconDefaultsValue {
  size?: number
  color?: string
  strokeWidth?: number
}

const IconDefaultsContext = createContext<IconDefaultsValue>({})

/**
 * Sets default size/color for every icon below it. Components such as Button
 * use this so icons automatically match their label color on every platform.
 */
export function IconDefaults({ children, ...value }: IconDefaultsValue & { children: ReactNode }) {
  const parent = useContext(IconDefaultsContext)
  const { size, color, strokeWidth } = value
  const merged = useMemo(
    () => ({
      size: size ?? parent.size,
      color: color ?? parent.color,
      strokeWidth: strokeWidth ?? parent.strokeWidth,
    }),
    [parent, size, color, strokeWidth],
  )
  return <IconDefaultsContext.Provider value={merged}>{children}</IconDefaultsContext.Provider>
}

export const useIconDefaults = () => useContext(IconDefaultsContext)

export type IconRegistry = Record<string, IconComponent>

const IconRegistryContext = createContext<IconRegistry | null>(null)

/**
 * Replaces or extends the icons resolved by `<Icon name="…" />`.
 *
 * @example
 * import { Search } from 'lucide-react-native'
 * <IconProvider icons={{ search: Search }}>…</IconProvider>
 */
export function IconProvider({ icons, children }: { icons: IconRegistry; children: ReactNode }) {
  const parent = useContext(IconRegistryContext)
  const value = useMemo(() => (parent ? { ...parent, ...icons } : icons), [parent, icons])
  return <IconRegistryContext.Provider value={value}>{children}</IconRegistryContext.Provider>
}

export const useIconRegistry = () => useContext(IconRegistryContext)
