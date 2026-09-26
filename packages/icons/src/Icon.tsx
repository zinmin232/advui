import { useIconRegistry } from './context'
import type { IconName } from './generated'
import { defaultIcons } from './icons'
import type { IconProps } from './types'

// Module-scoped so the source type-checks in apps without Node types; bundlers inline NODE_ENV.
declare const process: { env: { NODE_ENV?: string } }

export interface NamedIconProps extends IconProps {
  /** A built-in icon name, or any name registered through `IconProvider`. */
  name: IconName | (string & {})
}

/**
 * Renders an icon by name. Names resolve through the nearest `IconProvider`
 * first, then fall back to the built-in set — so apps can swap the entire
 * icon family without touching component code.
 */
export function Icon({ name, ...props }: NamedIconProps) {
  const registry = useIconRegistry()
  const Component = registry?.[name] ?? defaultIcons[name as IconName]
  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[advui] Unknown icon "${name}". Register it with <IconProvider>.`)
    }
    return null
  }
  return <Component {...props} />
}
