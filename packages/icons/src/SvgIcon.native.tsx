import { type ComponentType, createElement } from 'react'
import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg'
import type { SvgIconProps } from './SvgIcon'

const elements: Record<string, ComponentType<Record<string, unknown>>> = {
  path: Path,
  circle: Circle,
  rect: Rect,
  line: Line,
  polyline: Polyline,
  polygon: Polygon,
  ellipse: Ellipse,
}

/** Native renderer backed by react-native-svg (bundled with Expo). */
export function SvgIcon({ node, size, color, strokeWidth, label, testID }: SvgIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={Boolean(label)}
      accessibilityLabel={label}
      accessibilityRole={label ? 'image' : undefined}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
      testID={testID}
    >
      {node.map(([tag, attrs], index) => {
        const Element = elements[tag]
        return Element ? createElement(Element, { key: index, ...attrs }) : null
      })}
    </Svg>
  )
}

export type { SvgIconProps }
