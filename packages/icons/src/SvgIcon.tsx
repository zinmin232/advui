import { createElement } from 'react'
import type { IconNode } from './types'

export interface SvgIconProps {
  node: IconNode
  size: number
  color: string | undefined
  fill?: string
  strokeWidth: number
  label?: string
  testID?: string
}

/** Web renderer: plain DOM SVG (no react-native-svg in web bundles). */
export function SvgIcon({ node, size, color, fill, strokeWidth, label, testID }: SvgIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      // In `style`, not the attribute: a theme color is a CSS variable on web.
      style={{ color: color ?? 'currentColor', fill, flexShrink: 0, display: 'block' }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-testid={testID}
    >
      {node.map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs }))}
    </svg>
  )
}
