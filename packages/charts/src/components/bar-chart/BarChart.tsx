import {
  CategoryLabels,
  ChartFrame,
  type ChartLabels,
  type ChartSeries,
  G,
  Line,
  Path,
  Svg,
  SvgText,
  ValueGrid,
  bandScale,
  barPath,
  cartesianPadding,
  formatCompact,
  formatFull,
  linearScale,
  niceTicks,
  numberAt,
  useChartColors,
  useChartInk,
} from '../../charts'

const MAX_BAR = 24
const GAP = 2
const RADIUS = 4

export interface BarChartProps {
  /** Names the chart: its heading and accessible name. */
  title: string
  description?: string
  /** One object per category, e.g. `{ month: 'Jan', health: 120, wash: 80 }`. */
  data: Record<string, unknown>[]
  /** The field holding each row's category name. */
  index: string
  /** Heading of the category column in the table view. Default: `index`. */
  indexLabel?: string
  /** The numeric fields to plot, in color order. */
  series: ChartSeries[]
  /** `vertical` draws columns; `horizontal` bars suit long category names. */
  layout?: 'vertical' | 'horizontal'
  /** Stacks the series in one bar per category (part-to-whole). */
  stacked?: boolean
  /** Height in pixels. Default: 240, or 36 per category for horizontal bars. */
  height?: number
  /** Fixed width; by default the chart fills its container. */
  width?: number
  /** Formats values in the tooltip and table. Axis ticks are always compact (1.2K). */
  valueFormatter?: (value: number) => string
  labels?: Partial<ChartLabels>
}

/**
 * Compares values across categories as columns or bars, grouped or stacked.
 * Includes a legend, a tooltip (hover, tap or arrow keys) and a table view.
 */
export function BarChart({
  title,
  description,
  data,
  index,
  indexLabel = index,
  series,
  layout = 'vertical',
  stacked = false,
  height: heightProp,
  width,
  valueFormatter = formatFull,
  labels,
}: BarChartProps) {
  const colors = useChartColors()
  const ink = useChartInk('$background')
  const horizontal = layout === 'horizontal'
  const height = heightProp ?? (horizontal ? Math.max(120, data.length * 36 + 32) : 240)
  const categories = data.map((row) => String(row[index] ?? ''))
  const values = data.map((row) => series.map((s) => numberAt(row, s.key)))

  // Stacks sum positives up and negatives down; groups need each value.
  const extents = values.flatMap((row) =>
    stacked
      ? [
          row.reduce<number>((sum, v) => sum + Math.max(0, v ?? 0), 0),
          row.reduce<number>((sum, v) => sum + Math.min(0, v ?? 0), 0),
        ]
      : row.map((v) => v ?? 0),
  )
  const ticks = niceTicks(Math.min(0, ...extents), Math.max(0, ...extents))
  const domain: [number, number] = [ticks[0]!, ticks.at(-1)!]

  const categoryWidth = horizontal
    ? Math.min(160, Math.max(...categories.map((c) => c.length), 1) * 7 + 12)
    : 0
  const pad = horizontal
    ? { top: 8, right: 16, bottom: 24, left: categoryWidth }
    : cartesianPadding(ticks)

  const layoutAt = (w: number) => {
    const valueScale = horizontal
      ? linearScale(domain, [pad.left, w - pad.right])
      : linearScale(domain, [height - pad.bottom, pad.top])
    const band = horizontal
      ? bandScale(data.length, [pad.top, height - pad.bottom])
      : bandScale(data.length, [pad.left, w - pad.right])
    const k = stacked ? 1 : series.length
    // Bars never fill their slot: at most 24px, and the rest of the band is air.
    const thickness = Math.max(2, Math.min(MAX_BAR, (band.bandwidth * 0.7 - GAP * (k - 1)) / k))
    const group = k * thickness + (k - 1) * GAP
    return { valueScale, band, thickness, group }
  }

  const hitTest = (x: number, y: number, w: number) => {
    const { band } = layoutAt(w)
    const position = horizontal ? y : x
    const i = Math.floor((position - (horizontal ? pad.top : pad.left)) / band.bandwidth)
    return i >= 0 && i < data.length ? i : null
  }

  const format = (value: number | null) => (value == null ? '–' : valueFormatter(value))
  const legend =
    series.length > 1
      ? series.map((s, i) => ({ label: s.label, color: colors[i % 8]!, shape: 'square' as const }))
      : []

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={legend}
      height={height}
      width={width}
      count={data.length}
      hitTest={hitTest}
      anchor={(i, w) => {
        const { band } = layoutAt(w)
        const center = band.band(i) + band.bandwidth / 2
        return horizontal ? { x: w - pad.right, y: center } : { x: center, y: pad.top }
      }}
      tooltip={(i) => ({
        title: categories[i]!,
        rows: series.map((s, j) => ({
          label: s.label,
          value: format(values[i]![j]!),
          color: colors[j % 8]!,
          shape: 'square',
        })),
      })}
      table={{
        columns: [indexLabel, ...series.map((s) => s.label)],
        rows: data.map((_, i) => [categories[i]!, ...values[i]!.map(format)]),
        numeric: [false, ...series.map(() => true)],
      }}
      labels={labels}
    >
      {(w, active) => {
        const { valueScale, band, thickness, group } = layoutAt(w)
        const zero = valueScale(0)
        return (
          <Svg width={w} height={height}>
            {horizontal ? (
              <>
                {ticks.map((tick) => (
                  <Line
                    key={`grid-${tick}`}
                    x1={valueScale(tick)}
                    x2={valueScale(tick)}
                    y1={pad.top}
                    y2={height - pad.bottom}
                    stroke={tick === 0 ? ink.axis : ink.grid}
                    strokeWidth={1}
                  />
                ))}
                {ticks.map((tick) => (
                  <SvgText
                    key={`tick-${tick}`}
                    x={valueScale(tick)}
                    y={height - pad.bottom + 4}
                    dy="0.9em"
                    fill={ink.text}
                    fontSize={12}
                    textAnchor="middle"
                  >
                    {formatCompact(tick)}
                  </SvgText>
                ))}
                {categories.map((category, i) => (
                  <SvgText
                    key={`cat-${i}`}
                    x={pad.left - 8}
                    y={band.band(i) + band.bandwidth / 2}
                    dy="0.35em"
                    fill={ink.text}
                    fontSize={12}
                    textAnchor="end"
                  >
                    {truncate(category, Math.floor((pad.left - 12) / 7))}
                  </SvgText>
                ))}
              </>
            ) : (
              <>
                <ValueGrid
                  ticks={ticks}
                  y={valueScale}
                  left={pad.left}
                  right={w - pad.right}
                  ink={ink}
                />
                <CategoryLabels
                  labels={categories}
                  x={(i) => band.band(i) + band.bandwidth / 2}
                  y={height - pad.bottom + 4}
                  available={band.bandwidth}
                  ink={ink}
                />
              </>
            )}
            {values.map((row, i) => {
              const start = band.band(i) + (band.bandwidth - group) / 2
              let positive = 0
              let negative = 0
              // In a stack, only the outermost segment on each side gets the rounded end.
              const lastPositive = row.reduce<number>((last, v, j) => ((v ?? 0) > 0 ? j : last), -1)
              const lastNegative = row.reduce<number>((last, v, j) => ((v ?? 0) < 0 ? j : last), -1)
              return (
                <G key={i} opacity={active == null || active === i ? 1 : 0.55}>
                  {row.map((value, j) => {
                    if (value == null || value === 0) return null
                    const offset = stacked ? start : start + j * (thickness + GAP)
                    const from = stacked ? (value > 0 ? positive : negative) : 0
                    const to = from + value
                    if (stacked) {
                      if (value > 0) positive = to
                      else negative = to
                    }
                    const a = valueScale(from)
                    const b = valueScale(to)
                    // A 2px gap separates a stacked segment from the one on its baseline side.
                    const inset = stacked && from !== 0 ? GAP : 0
                    const rounded = !stacked || j === (value > 0 ? lastPositive : lastNegative)
                    const radius = rounded ? RADIUS : 0
                    const d = horizontal
                      ? value > 0
                        ? barPath(
                            Math.min(a, b) + inset,
                            offset,
                            Math.abs(b - a) - inset,
                            thickness,
                            radius,
                            'right',
                          )
                        : barPath(
                            Math.min(a, b),
                            offset,
                            Math.abs(b - a) - inset,
                            thickness,
                            radius,
                            'left',
                          )
                      : value > 0
                        ? barPath(
                            offset,
                            Math.min(a, b),
                            thickness,
                            Math.abs(b - a) - inset,
                            radius,
                            'up',
                          )
                        : barPath(
                            offset,
                            Math.min(a, b) + inset,
                            thickness,
                            Math.abs(b - a) - inset,
                            radius,
                            'down',
                          )
                    return <Path key={j} d={d} fill={colors[j % 8]} />
                  })}
                </G>
              )
            })}
            {horizontal ? null : (
              <Line
                x1={pad.left}
                x2={w - pad.right}
                y1={zero}
                y2={zero}
                stroke={ink.axis}
                strokeWidth={1}
              />
            )}
          </Svg>
        )
      }}
    </ChartFrame>
  )
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, Math.max(1, max - 1))}…` : text
}
