import { useIconColor } from '@advui/icons'
import {
  ChartFrame,
  type ChartLabels,
  G,
  Path,
  Svg,
  SvgText,
  arcPath,
  formatFull,
  useChartColors,
  useChartInk,
} from '../../charts'

export interface PieSlice {
  label: string
  value: number
}

export interface PieChartProps {
  /** Names the chart: its heading and accessible name. */
  title: string
  description?: string
  /** The parts of the whole. Negative and zero values are left out. */
  data: PieSlice[]
  /** `donut` leaves room for the total in the middle. */
  variant?: 'donut' | 'pie'
  /** More slices than this fold the smallest into "Other". Default: 6. */
  maxSlices?: number
  /** Height in pixels. Default: 240. */
  height?: number
  width?: number
  /** Formats values in the legend, tooltip and table. */
  valueFormatter?: (value: number) => string
  /** Headings for the table and the folded slice, for translation. */
  text?: { label?: string; value?: string; share?: string; other?: string; total?: string }
  labels?: Partial<ChartLabels>
}

const percent = (part: number, total: number) =>
  total > 0 ? `${Math.round((part / total) * 1000) / 10}%` : '0%'

/**
 * Part-to-whole at a glance, for up to six parts. Each slice is named in the
 * legend with its share; the tooltip (hover, tap or arrow keys) and the
 * table view give the exact values. For close values, a bar chart reads better.
 */
export function PieChart({
  title,
  description,
  data,
  variant = 'donut',
  maxSlices = 6,
  height = 240,
  width,
  valueFormatter = formatFull,
  text: textProp,
  labels,
}: PieChartProps) {
  const text = {
    label: 'Label',
    value: 'Value',
    share: 'Share',
    other: 'Other',
    total: 'Total',
    ...textProp,
  }
  const colors = useChartColors()
  const ink = useChartInk('$background')
  const foreground = useIconColor('$foreground') ?? 'currentColor'

  // Largest first; past the limit, the tail folds into one "Other" slice.
  const positive = data.filter((d) => d.value > 0).sort((a, b) => b.value - a.value)
  const slices =
    positive.length > maxSlices
      ? [
          ...positive.slice(0, maxSlices - 1),
          {
            label: text.other,
            value: positive.slice(maxSlices - 1).reduce((sum, d) => sum + d.value, 0),
          },
        ]
      : positive
  const folded = positive.length > maxSlices
  const total = slices.reduce((sum, d) => sum + d.value, 0)
  const colorOf = (i: number) => (folded && i === slices.length - 1 ? ink.axis : colors[i % 8]!)

  let angle = 0
  const arcs = slices.map((slice, i) => {
    const start = angle
    angle += total > 0 ? (slice.value / total) * Math.PI * 2 : 0
    return { ...slice, start, end: angle, color: colorOf(i) }
  })

  const geometry = (w: number) => {
    const outer = Math.min(w, height) / 2 - 8
    return { cx: w / 2, cy: height / 2, outer, inner: variant === 'donut' ? outer * 0.62 : 0 }
  }

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={arcs.map((arc) => ({
        label: arc.label,
        color: arc.color,
        shape: 'square',
        detail: percent(arc.value, total),
      }))}
      height={height}
      width={width}
      count={arcs.length}
      hitTest={(x, y, w) => {
        const { cx, cy, outer, inner } = geometry(w)
        const dx = x - cx
        const dy = y - cy
        const r = Math.hypot(dx, dy)
        if (r > outer + 8 || r < inner) return null
        const a = (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2)
        const found = arcs.findIndex((arc) => a >= arc.start && a < arc.end)
        return found >= 0 ? found : null
      }}
      anchor={(i, w) => {
        const { cx, outer } = geometry(w)
        const mid = (arcs[i]!.start + arcs[i]!.end) / 2
        return { x: cx + outer * Math.sin(mid), y: 0 }
      }}
      tooltip={(i) => ({
        title: arcs[i]!.label,
        rows: [
          {
            label: percent(arcs[i]!.value, total),
            value: valueFormatter(arcs[i]!.value),
            color: arcs[i]!.color,
            shape: 'square',
          },
        ],
      })}
      table={{
        columns: [text.label, text.value, text.share],
        rows: [
          ...arcs.map((arc) => [arc.label, valueFormatter(arc.value), percent(arc.value, total)]),
          [text.total, valueFormatter(total), '100%'],
        ],
        numeric: [false, true, true],
      }}
      labels={labels}
    >
      {(w, active) => {
        const { cx, cy, outer, inner } = geometry(w)
        // A 2px gap between slices, as angle at the outer edge.
        const gap = arcs.length > 1 ? 2 / outer : 0
        return (
          <Svg width={w} height={height}>
            {arcs.map((arc, i) => (
              <G key={arc.label} opacity={active == null || active === i ? 1 : 0.55}>
                <Path
                  d={arcPath(
                    cx,
                    cy,
                    active === i ? outer + 4 : outer,
                    inner,
                    arc.start + gap / 2,
                    Math.max(arc.start + gap / 2, arc.end - gap / 2),
                  )}
                  fill={arc.color}
                />
              </G>
            ))}
            {variant === 'donut' ? (
              <>
                <SvgText
                  x={cx}
                  y={cy - 6}
                  fill={foreground}
                  fontSize={20}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {valueFormatter(total)}
                </SvgText>
                <SvgText x={cx} y={cy + 16} fill={ink.text} fontSize={12} textAnchor="middle">
                  {text.total}
                </SvgText>
              </>
            ) : null}
          </Svg>
        )
      }}
    </ChartFrame>
  )
}
