import { memo } from 'react'
import { isWeb } from 'tamagui'
import { useIconDefaults } from './context'
import { SvgIcon } from './SvgIcon'
import type { IconComponent, IconNode, IconProps } from './types'
import { useIconColor } from './useIconColor'

/**
 * Turns Lucide-style node data into a cross-platform icon component.
 * Use it to add your own icons that behave exactly like the built-in ones.
 */
export function createIcon(name: string, node: IconNode): IconComponent {
  function IconImpl({ size, color, strokeWidth, testID, ...rest }: IconProps) {
    const defaults = useIconDefaults()
    // Web inherits `currentColor` from surrounding text; native has no
    // inheritance, so fall back to the theme's text color.
    const resolved = useIconColor(color ?? defaults.color ?? (isWeb ? undefined : '$color'))
    return (
      <SvgIcon
        node={node}
        size={size ?? defaults.size ?? 16}
        color={resolved}
        strokeWidth={strokeWidth ?? defaults.strokeWidth ?? 2}
        label={rest['aria-label']}
        testID={testID}
      />
    )
  }
  IconImpl.displayName = `Icon(${name})`
  const Icon = memo(IconImpl) as unknown as IconComponent
  Icon.iconName = name
  return Icon
}
