import { CategoryLabels, ValueGrid, cartesianPadding } from './cartesian'
import {
  ChartFrame,
  type ChartLabels,
  type ChartSeries,
  useChartColors,
  useChartInk,
} from './ChartFrame'
import { formatFull, numberAt } from './format'
import { linearScale, niceTicks } from './scale'
import { Circle, G, Line, Path, Svg } from './svg'

export interface LinePlotProps {
  title: string
  description?: string
  /** One object per x position, e.g. `{ month: 'Jan', reached: 1200 }`. */
  data: Record<string, unknown>[]
  /** The field holding each row's x label. */
  index: string
  /** Heading of the x column in the table view. Default: `index`. */
  indexLabel?: string
  /** The numeric fields to plot, in color order. */
  series: ChartSeries[]
  /** Height in pixels, including the axes. Default: 240. */
  height?: number
  width?: number
  /** Formats values in the tooltip and table. Axis ticks are compact (1.2K). */
  valueFormatter?: (value: number) => string
  /** Plot area always starts at zero. Default: true for areas, false for lines. */
  startAtZero?: boolean
  /**
   * Color of the surface the chart sits on, for the ring around markers.
   * Default: `$background`; use `$card` inside a Card.
   */
  surface?: string
  labels?: Partial<ChartLabels>
}

/** Shared by LineChart and AreaChart. */
export function LinePlot({
  title,
  description,
  data,
  index,
  indexLabel = index,
  series,
  height = 240,
  width,
  valueFormatter = formatFull,
  startAtZero,
  surface = '$background',
  labels,
  area = false,
  stacked = false,
}: LinePlotProps & { area?: boolean; stacked?: boolean }) {
  const colors = useChartColors()
  const ink = useChartInk(surface)
  const categories = data.map((row) => String(row[index] ?? ''))
  const values = data.map((row) => series.map((s) => numberAt(row, s.key)))

  // Stacked areas draw each series on top of the ones before it.
  const tops = values.map((row) => {
    let sum = 0
    return row.map((v) => (v == null ? null : stacked ? (sum += v) : v))
  })
  const all = tops.flat().filter((v): v is number => v != null)
  const zero = startAtZero ?? area
  const ticks = niceTicks(
    zero ? Math.min(0, ...all) : Math.min(...all),
    zero ? Math.max(0, ...all) : Math.max(...all),
  )
  const pad = cartesianPadding(ticks)
  const n = data.length

  const scales = (w: number) => {
    const step = (w - pad.left - pad.right) / Math.max(1, n)
    return {
      step,
      x: (i: number) => pad.left + (i + 0.5) * step,
      y: linearScale([ticks[0]!, ticks.at(-1)!], [height - pad.bottom, pad.top]),
    }
  }

  const format = (value: number | null) => (value == null ? '–' : valueFormatter(value))
  const shape = area ? ('square' as const) : ('line' as const)

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={
        series.length > 1
          ? series.map((s, i) => ({ label: s.label, color: colors[i % 8]!, shape }))
          : []
      }
      height={height}
      width={width}
      count={n}
      hitTest={(x, _y, w) => {
        const { step } = scales(w)
        const i = Math.round((x - pad.left) / step - 0.5)
        return Math.max(0, Math.min(n - 1, i))
      }}
      anchor={(i, w) => ({ x: scales(w).x(i), y: pad.top })}
      tooltip={(i) => ({
        title: categories[i]!,
        rows: series.map((s, j) => ({
          label: s.label,
          value: format(values[i]![j]!),
          color: colors[j % 8]!,
          shape,
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
        const { x, y, step } = scales(w)
        const base = (i: number, j: number) =>
          stacked && j > 0 ? (tops[i]![j - 1] ?? 0) : Math.max(ticks[0]!, 0)
        return (
          <Svg width={w} height={height}>
            <ValueGrid ticks={ticks} y={y} left={pad.left} right={w - pad.right} ink={ink} />
            <CategoryLabels
              labels={categories}
              x={x}
              y={height - pad.bottom + 4}
              available={step}
              ink={ink}
            />
            {active != null ? (
              <Line
                x1={x(active)}
                x2={x(active)}
                y1={pad.top}
                y2={height - pad.bottom}
                stroke={ink.axis}
                strokeWidth={1}
              />
            ) : null}
            {series.map((s, j) => {
              const color = colors[j % 8]!
              // A missing value breaks the line instead of dropping to zero.
              const runs: number[][] = [[]]
              tops.forEach((row, i) => {
                if (row[j] == null) runs.push([])
                else runs.at(-1)!.push(i)
              })
              return (
                <G key={s.key}>
                  {runs
                    .filter((run) => run.length > 0)
                    .map((run) => {
                      const line = run
                        .map((i, k) => `${k === 0 ? 'M' : 'L'}${x(i)},${y(tops[i]![j]!)}`)
                        .join('')
                      const fill = area
                        ? `${line}${[...run]
                            .reverse()
                            .map((i) => `L${x(i)},${y(base(i, j))}`)
                            .join('')}Z`
                        : null
                      // A lone value between gaps has no line to draw: show it as a dot.
                      if (run.length === 1) {
                        const i = run[0]!
                        return <Circle key={i} cx={x(i)} cy={y(tops[i]![j]!)} r={3} fill={color} />
                      }
                      return (
                        <G key={run[0]}>
                          {fill ? <Path d={fill} fill={color} fillOpacity={0.1} /> : null}
                          <Path
                            d={line}
                            fill="none"
                            stroke={color}
                            strokeWidth={2}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                        </G>
                      )
                    })}
                </G>
              )
            })}
            {/* End markers, and every series' marker at the hovered position, ringed in the surface color. */}
            {series.map((s, j) => {
              const color = colors[j % 8]!
              const lastIndex = tops.reduce<number>(
                (last, row, i) => (row[j] != null ? i : last),
                -1,
              )
              const points = new Set([lastIndex, ...(active != null ? [active] : [])])
              return [...points]
                .filter((i) => i >= 0 && tops[i]?.[j] != null)
                .map((i) => (
                  <Circle
                    key={`${s.key}-${i}`}
                    cx={x(i)}
                    cy={y(tops[i]![j]!)}
                    r={4}
                    fill={color}
                    stroke={ink.surface}
                    strokeWidth={2}
                  />
                ))
            })}
          </Svg>
        )
      }}
    </ChartFrame>
  )
}
