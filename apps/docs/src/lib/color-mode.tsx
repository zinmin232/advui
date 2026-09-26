'use client'

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { COLOR_MODE_KEY, COLOR_MODE_QUERY as QUERY } from './color-mode-script'

export type ColorModeSetting = 'light' | 'dark' | 'system'
export type ResolvedMode = 'light' | 'dark'

interface ColorModeState {
  setting: ColorModeSetting
  resolved: ResolvedMode
  setSetting: (setting: ColorModeSetting) => void
}

const ColorModeContext = createContext<ColorModeState | null>(null)

const systemMode = (): ResolvedMode => (window.matchMedia(QUERY).matches ? 'dark' : 'light')

export function ColorModeSettingProvider({
  children,
}: {
  children: (resolved: ResolvedMode) => ReactNode
}) {
  const [setting, setSettingState] = useState<ColorModeSetting>('system')
  // Read what the blocking script applied so the first client render matches the page.
  const [resolved, setResolved] = useState<ResolvedMode>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('t_dark')
      ? 'dark'
      : 'light',
  )

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLOR_MODE_KEY) as ColorModeSetting | null
      if (stored === 'light' || stored === 'dark' || stored === 'system') setSettingState(stored)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (setting !== 'system') {
      setResolved(setting)
      return
    }
    const media = window.matchMedia(QUERY)
    const update = () => setResolved(systemMode())
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [setting])

  useEffect(() => {
    document.documentElement.style.colorScheme = resolved
  }, [resolved])

  const setSetting = useCallback((next: ColorModeSetting) => {
    setSettingState(next)
    try {
      window.localStorage.setItem(COLOR_MODE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(() => ({ setting, resolved, setSetting }), [setting, resolved, setSetting])
  return <ColorModeContext.Provider value={value}>{children(resolved)}</ColorModeContext.Provider>
}

export function useColorModeSetting(): ColorModeState {
  const value = useContext(ColorModeContext)
  if (!value) throw new Error('useColorModeSetting must be used inside ColorModeSettingProvider')
  return value
}
