import { useIconColor } from '@advui/icons'
import {
  ChartFrame,
  type ChartLabels,
  G,
  Path,
  Svg,
  SvgText,
  formatFull,
  niceTicks,
  truncate,
  useChartColors,
  useChartInk,
} from '../../charts'

export interface RadialItem {
  label: string
  value: number
}

export interface RadialChartProps {
  /** Names the chart: its heading and accessible name. */
  title: string
  description?: string
  /** One ring each, from the outside in. */
  data: RadialItem[]
  /** The value that fills a ring, such as 100 for percentages. Default: the largest value, rounded up. */
  max?: number
  /**
   * `bars` draws a three-quarter ring per item, named at its start; `gauge`
   * draws a wider arc with the first value in the middle.
   */
  variant?: 'bars' | 'gauge'
  /** Height in pixels. Default: 240. */
  height?: number
  /** Fixed width; by default the chart fills its container. */
  width?: number
  /** Formats values in the middle, the legend, the tooltip and the table. */
  valueFormatter?: (value: number) => string
  /** Table headings, for translation. */
  text?: { label?: string; value?: string; percent?: string }
  labels?: Partial<ChartLabels>
}

const SWEEPS = {
  // From 12 o'clock round to 9: the empty quarter holds the ring names.
  bars: { start: 0, end: Math.PI * 1.5, hole: 0.3, thickest: 18 },
  gauge: { start: (-Math.PI * 2) / 3, end: (Math.PI * 2) / 3, hole: 0.62, thickest: 24 },
}

/** An arc along a circle, to be drawn with a stroke; angles in radians, 0 at 12 o'clock. */
function arcLine(cx: number, cy: number, r: number, start: number, end: number) {
  const point = (angle: number) => `${cx + r * Math.sin(angle)},${cy - r * Math.cos(angle)}`
  return `M${point(start)}A${r},${r} 0 ${end - start > Math.PI ? 1 : 0} 1 ${point(end)}`
}

const percent = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 1000) / 10}%` : '0%'

/**
 * Progress toward a goal as rings: radial bars compare a few items against
 * the same maximum, and a gauge shows one value. The tooltip (hover, tap or
 * arrow keys) and the table view give each value and its percent.
 */
export function RadialChart({
  title,
  description,
  data,
  max,
  variant = 'bars',
  height = 240,
  width,
  valueFormatter = formatFull,
  text: textProp,
  labels,
}: RadialChartProps) {
  const text = { label: 'Label', value: 'Value', percent: 'Percent', ...textProp }
  const colors = useChartColors()
  const ink = useChartInk('background')
  const foreground = useIconColor('foreground') ?? 'currentColor'
  const sweep = SWEEPS[variant]
  const n = data.length
  const top = max ?? niceTicks(0, Math.max(0, ...data.map((d) => d.value))).at(-1)!
  const share = (value: number) => Math.max(0, Math.min(1, value / (top || 1)))

  const geometry = (w: number) => {
    // A gauge's arc is 1.5 radii tall (its ends sit half a radius below the
    // center), so it can grow wider than a full circle in the same height.
    const outer =
      variant === 'gauge'
        ? Math.max(24, Math.min(w / 2 - 8, (height - 16) / 1.5))
        : Math.max(24, Math.min(w, height) / 2 - 8)
    const cy = variant === 'gauge' ? (height - outer * 1.5) / 2 + outer : height / 2
    const step = (outer * (1 - sweep.hole)) / Math.max(1, n)
    const thickness = Math.min(sweep.thickest, step * 0.72)
    return { cx: w / 2, cy, outer, step, thickness, ring: (i: number) => outer - step * (i + 0.5) }
  }

  return (
    <ChartFrame
      title={title}
      description={description}
      // Bars are named on the rings and a lone gauge in its middle; several gauges need a legend.
      legend={
        variant === 'gauge' && n > 1
          ? data.map((d, i) => ({
              label: d.label,
              color: colors[i % 8]!,
              shape: 'square',
              detail: valueFormatter(d.value),
            }))
          : []
      }
      height={height}
      width={width}
      count={n}
      hitTest={(x, y, w) => {
        const { cx, cy, outer, step } = geometry(w)
        const i = Math.floor((outer - Math.hypot(x - cx, y - cy)) / step)
        return i >= 0 && i < n ? i : null
      }}
      anchor={(i, w) => {
        const { cx, ring } = geometry(w)
        const end = sweep.start + (sweep.end - sweep.start) * share(data[i]!.value)
        return { x: cx + ring(i) * Math.sin(end), y: 0 }
      }}
      tooltip={(i) => ({
        title: data[i]!.label,
        rows: [
          {
            label: percent(data[i]!.value, top),
            value: valueFormatter(data[i]!.value),
            color: colors[i % 8]!,
            shape: 'square',
          },
        ],
      })}
      table={{
        columns: [text.label, text.value, text.percent],
        rows: data.map((d) => [d.label, valueFormatter(d.value), percent(d.value, top)]),
        numeric: [false, true, true],
      }}
      labels={labels}
    >
      {(w, active) => {
        const { cx, cy, thickness, ring } = geometry(w)
        return (
          <Svg width={w} height={height}>
            {data.map((d, i) => {
              const r = ring(i)
              const end = sweep.start + (sweep.end - sweep.start) * share(d.value)
              return (
                <G key={`${d.label}-${i}`} opacity={active == null || active === i ? 1 : 0.55}>
                  <Path
                    d={arcLine(cx, cy, r, sweep.start, sweep.end)}
                    fill="none"
                    stroke={ink.grid}
                    strokeWidth={thickness}
                    strokeLinecap="round"
                  />
                  {d.value > 0 ? (
                    <Path
                      d={arcLine(cx, cy, r, sweep.start, end)}
                      fill="none"
                      stroke={colors[i % 8]!}
                      strokeWidth={thickness}
                      strokeLinecap="round"
                    />
                  ) : null}
                  {variant === 'bars' ? (
                    <SvgText
                      x={cx - thickness / 2 - 6}
                      y={cy - r}
                      dy="0.35em"
                      fill={ink.text}
                      fontSize={12}
                      fontWeight={active === i ? '600' : undefined}
                      textAnchor="end"
                    >
                      {truncate(d.label, Math.floor((cx - thickness / 2 - 10) / 7))}
                    </SvgText>
                  ) : null}
                </G>
              )
            })}
            {variant === 'gauge' && n > 0 ? (
              <>
                <SvgText
                  x={cx}
                  y={cy + 4}
                  fill={foreground}
                  fontSize={24}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {valueFormatter(data[0]!.value)}
                </SvgText>
                <SvgText x={cx} y={cy + 24} fill={ink.text} fontSize={12} textAnchor="middle">
                  {data[0]!.label}
                </SvgText>
              </>
            ) : null}
          </Svg>
        )
      }}
    </ChartFrame>
  )
}
