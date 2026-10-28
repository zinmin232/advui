import {
  CategoryLabels,
  ChartFrame,
  type ChartLabels,
  type ChartSeries,
  Circle,
  G,
  Line,
  Path,
  Svg,
  ValueGrid,
  bandScale,
  barPath,
  cartesianPadding,
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

/** One series of a Composed Chart: drawn as bars (the default) or as a line. */
export interface ComposedSeries<Key extends string = string> extends ChartSeries<Key> {
  /** How the series is drawn. Default: `bar`. */
  type?: 'bar' | 'line'
  /** Draws a line dashed, as for a target or a forecast. */
  dashed?: boolean
}

// Rows are `object`, not `Record<string, unknown>`: an interface has no index signature.
export interface ComposedChartProps<T extends object = Record<string, unknown>> {
  /** Names the chart: its heading and accessible name. */
  title: string
  description?: string
  /**
   * One object per category, e.g. `{ month: 'Jan', reached: 120, target: 150 }`. The
   * row type is inferred from here only; `index` and `series` must name its fields.
   */
  data: readonly T[]
  /** The field holding each row's category name. */
  index: NoInfer<keyof T & string>
  /** Heading of the category column in the table view. Default: `index`. */
  indexLabel?: string
  /** The numeric fields to plot, in color order, each as bars or a line. */
  series: readonly ComposedSeries<NoInfer<keyof T & string>>[]
  /** Stacks the bar series in one bar per category. Lines are never stacked. */
  stacked?: boolean
  /** Height in pixels, including the axes. Default: 240. */
  height?: number
  /** Fixed width; by default the chart fills its container. */
  width?: number
  /** Formats values in the tooltip and table. Axis ticks are always compact (1.2K). */
  valueFormatter?: (value: number) => string
  /** Color of the surface the chart sits on, for the ring around markers. Default: `background`. */
  surface?: string
  labels?: Partial<ChartLabels>
}

/**
 * Bars and lines on one value axis, such as monthly results against a target
 * or a running total. Includes a legend, a tooltip (hover, tap or arrow keys)
 * and a table view.
 */
export function ComposedChart<T extends object>({
  title,
  description,
  data,
  index,
  indexLabel = index,
  series,
  stacked = false,
  height = 240,
  width,
  valueFormatter = formatFull,
  surface = 'background',
  labels,
}: ComposedChartProps<T>) {
  const colors = useChartColors()
  const ink = useChartInk(surface)
  const categories = data.map((row) => String(row[index] ?? ''))
  const values = data.map((row) => series.map((s) => numberAt(row, s.key)))
  const isLine = (j: number) => series[j]!.type === 'line'
  const bars = series.flatMap((_, j) => (isLine(j) ? [] : [j]))
  const lines = series.flatMap((_, j) => (isLine(j) ? [j] : []))

  // Bars need the zero line, and stacks their sums; lines need each value.
  const extents = values.flatMap((row) => [
    ...(stacked
      ? [
          bars.reduce((sum, j) => sum + Math.max(0, row[j] ?? 0), 0),
          bars.reduce((sum, j) => sum + Math.min(0, row[j] ?? 0), 0),
        ]
      : bars.map((j) => row[j] ?? 0)),
    ...lines.flatMap((j) => (row[j] == null ? [] : [row[j]])),
  ])
  const ticks = niceTicks(Math.min(0, ...extents), Math.max(0, ...extents))
  const pad = cartesianPadding(ticks)

  const layoutAt = (w: number) => {
    const y = linearScale([ticks[0]!, ticks.at(-1)!], [height - pad.bottom, pad.top])
    const band = bandScale(data.length, [pad.left, w - pad.right])
    const k = stacked ? 1 : Math.max(1, bars.length)
    const thickness = Math.max(2, Math.min(MAX_BAR, (band.bandwidth * 0.7 - GAP * (k - 1)) / k))
    const group = k * thickness + (k - 1) * GAP
    return { y, band, thickness, group, x: (i: number) => band.band(i) + band.bandwidth / 2 }
  }

  const format = (value: number | null) => (value == null ? '–' : valueFormatter(value))
  const shapeOf = (j: number) => (isLine(j) ? ('line' as const) : ('square' as const))

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={
        series.length > 1
          ? series.map((s, j) => ({ label: s.label, color: colors[j % 8]!, shape: shapeOf(j) }))
          : []
      }
      height={height}
      width={width}
      count={data.length}
      hitTest={(px, _py, w) => {
        const { band } = layoutAt(w)
        const i = Math.floor((px - pad.left) / band.bandwidth)
        return i >= 0 && i < data.length ? i : null
      }}
      anchor={(i, w) => ({ x: layoutAt(w).x(i), y: pad.top })}
      tooltip={(i) => ({
        title: categories[i]!,
        rows: series.map((s, j) => ({
          label: s.label,
          value: format(values[i]![j]!),
          color: colors[j % 8]!,
          shape: shapeOf(j),
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
        const { y, band, thickness, group, x } = layoutAt(w)
        const zero = y(0)
        return (
          <Svg width={w} height={height}>
            <ValueGrid ticks={ticks} y={y} left={pad.left} right={w - pad.right} ink={ink} />
            <CategoryLabels
              labels={categories}
              x={x}
              y={height - pad.bottom + 4}
              available={band.bandwidth}
              ink={ink}
            />
            {values.map((row, i) => {
              const start = band.band(i) + (band.bandwidth - group) / 2
              let positive = 0
              let negative = 0
              // In a stack, only the outermost segment on each side gets the rounded end.
              const lastPositive = bars.reduce((last, j) => ((row[j] ?? 0) > 0 ? j : last), -1)
              const lastNegative = bars.reduce((last, j) => ((row[j] ?? 0) < 0 ? j : last), -1)
              return (
                <G key={i} opacity={active == null || active === i ? 1 : 0.55}>
                  {bars.map((j, slot) => {
                    const value = row[j]
                    if (value == null || value === 0) return null
                    const offset = stacked ? start : start + slot * (thickness + GAP)
                    const from = stacked ? (value > 0 ? positive : negative) : 0
                    const to = from + value
                    if (stacked) {
                      if (value > 0) positive = to
                      else negative = to
                    }
                    const a = y(from)
                    const b = y(to)
                    // A 2px gap separates a stacked segment from the one on its baseline side.
                    const inset = stacked && from !== 0 ? GAP : 0
                    const rounded = !stacked || j === (value > 0 ? lastPositive : lastNegative)
                    const d =
                      value > 0
                        ? barPath(
                            offset,
                            Math.min(a, b),
                            thickness,
                            Math.abs(b - a) - inset,
                            rounded ? RADIUS : 0,
                            'up',
                          )
                        : barPath(
                            offset,
                            Math.min(a, b) + inset,
                            thickness,
                            Math.abs(b - a) - inset,
                            rounded ? RADIUS : 0,
                            'down',
                          )
                    return <Path key={j} d={d} fill={colors[j % 8]} />
                  })}
                </G>
              )
            })}
            {bars.length > 0 ? (
              <Line
                x1={pad.left}
                x2={w - pad.right}
                y1={zero}
                y2={zero}
                stroke={ink.axis}
                strokeWidth={1}
              />
            ) : null}
            {/* Lines go over the bars, with a marker on every value, ringed in the surface color. */}
            {lines.map((j) => {
              const color = colors[j % 8]!
              // A missing value breaks the line instead of dropping to zero.
              const runs: number[][] = [[]]
              values.forEach((row, i) => {
                if (row[j] == null) runs.push([])
                else runs.at(-1)!.push(i)
              })
              return (
                <G key={series[j]!.key}>
                  {runs
                    .filter((run) => run.length > 1)
                    .map((run) => (
                      <Path
                        key={run[0]}
                        d={run
                          .map((i, k) => `${k === 0 ? 'M' : 'L'}${x(i)},${y(values[i]![j]!)}`)
                          .join('')}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeDasharray={series[j]!.dashed ? '6 4' : undefined}
                      />
                    ))}
                  {values.map((row, i) =>
                    row[j] == null ? null : (
                      <Circle
                        key={i}
                        cx={x(i)}
                        cy={y(row[j])}
                        r={active === i ? 4 : 3}
                        fill={color}
                        stroke={ink.surface}
                        strokeWidth={active === i ? 2 : 1.5}
                      />
                    ),
                  )}
                </G>
              )
            })}
          </Svg>
        )
      }}
    </ChartFrame>
  )
}
