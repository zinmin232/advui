import type { ReactNode } from 'react'
import NativeSvg, {
  Circle as NativeCircle,
  G as NativeG,
  Line as NativeLine,
  Path as NativePath,
  Rect as NativeRect,
  Text as NativeText,
} from 'react-native-svg'

// Native: the web file's components, mapped onto react-native-svg.

type Common = { children?: ReactNode; opacity?: number }
type Paint = { fill?: string; fillOpacity?: number; stroke?: string; strokeWidth?: number }

export function Svg({ width, height, children }: Common & { width: number; height: number }) {
  return (
    <NativeSvg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </NativeSvg>
  )
}

export const G = ({ children, opacity }: Common) => <NativeG opacity={opacity}>{children}</NativeG>

export const Rect = (props: Paint & { x: number; y: number; width: number; height: number }) => (
  <NativeRect {...props} />
)

export const Path = (
  props: Paint & { d: string; strokeLinejoin?: 'round'; strokeLinecap?: 'round' },
) => <NativePath {...props} />

export const Line = (props: Paint & { x1: number; y1: number; x2: number; y2: number }) => (
  <NativeLine {...props} />
)

export const Circle = (props: Paint & { cx: number; cy: number; r: number }) => (
  <NativeCircle {...props} />
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
  dy?: string
}) {
  return <NativeText {...(props as object)}>{children}</NativeText>
}
