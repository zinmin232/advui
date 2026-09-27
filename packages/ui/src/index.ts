import './types'

// Provider & hooks
export { ColorModeProvider, useColorMode, type ColorModeContextValue } from './provider/ColorMode'
export { UniversalProvider, type UniversalProviderProps } from './provider/UniversalProvider'
export { useControllableState } from './hooks/useControllableState'
export { useReducedMotion } from './hooks/useReducedMotion'
export type { ColorModePreference, ResolvedColorMode } from './types'

// Components
export * from './components/accordion'
export * from './components/alert-dialog'
export * from './components/alert'
export * from './components/avatar'
export * from './components/badge'
export * from './components/breadcrumb'
export * from './components/button'
export * from './components/card'
export * from './components/checkbox'
export * from './components/chip'
export * from './components/dialog'
export * from './components/dropdown-menu'
export * from './components/fab'
export * from './components/icon-button'
export * from './components/input'
export * from './components/label'
export * from './components/layout'
export * from './components/navigation-bar'
export * from './components/popover'
export * from './components/progress'
export * from './components/radio-group'
export * from './components/select'
export * from './components/separator'
export * from './components/sheet'
export * from './components/skeleton'
export * from './components/snackbar'
export * from './components/slider'
export * from './components/spinner'
export * from './components/switch'
export * from './components/tabs'
export * from './components/toggle'
export * from './components/toggle-group'
export * from './components/textarea'
export * from './components/toast'
export * from './components/tooltip'
export * from './components/typography'

// Re-exports so apps need a single import
export {
  createUniversalConfig,
  shadows,
  themePresets,
  type UniversalConfig,
  type UniversalConfigOptions,
} from '@advui/theme'
export {
  Icon,
  IconDefaults,
  IconProvider,
  createIcon,
  type IconName,
  type IconProps,
} from '@advui/icons'
export { Theme, useMedia, useTheme, type TamaguiElement } from 'tamagui'
