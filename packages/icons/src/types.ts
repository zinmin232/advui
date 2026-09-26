import type { ComponentType } from 'react'

/** `[tagName, attributes]` pairs describing an SVG in a 24×24 viewBox (Lucide format). */
export type IconNode = ReadonlyArray<readonly [string, Readonly<Record<string, string | number>>]>

export interface IconProps {
  /** Pixel size. Defaults to the nearest `IconDefaults` provider, or 16. */
  size?: number
  /** Theme token (`"$primary"`) or any color string. Defaults to the surrounding text color. */
  color?: string
  strokeWidth?: number
  /**
   * Accessible name. When omitted the icon is decorative and hidden from
   * assistive technology — label the interactive parent instead.
   */
  'aria-label'?: string
  testID?: string
}

export type IconComponent = ComponentType<IconProps> & { iconName?: string }
