import type { ReactNode } from 'react'

// Web: plain DOM SVG, so web bundles do not need react-native-svg. The
// native file maps the same components onto react-native-svg.

type Common = { children?: ReactNode; opacity?: number }
type Paint = { fill?: string; fillOpacity?: number; stroke?: string; strokeWidth?: number }

export function Svg({ width, height, children }: Common & { width: number; height: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible', fontFamily: 'inherit' }}
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const G = ({ children, opacity }: Common) => <g opacity={opacity}>{children}</g>

export const Rect = (props: Paint & { x: number; y: number; width: number; height: number }) => (
  <rect {...props} />
)

export const Path = (
  props: Paint & { d: string; strokeLinejoin?: 'round'; strokeLinecap?: 'round' },
) => <path {...props} />

export const Line = (props: Paint & { x1: number; y1: number; x2: number; y2: number }) => (
  <line {...props} />
)

export const Circle = (props: Paint & { cx: number; cy: number; r: number }) => (
  <circle {...props} />
)

export function SvgText({
  children,
  ...props
}: {
  children: ReactNode
  x: number
  y: number
  fill: string
  fontSize: number
  fontWeight?: string
  textAnchor?: 'start' | 'middle' | 'end'
  /** Vertical nudge: 0.35em centers text on y. */
  dy?: string
}) {
  return <text {...props}>{children}</text>
}
