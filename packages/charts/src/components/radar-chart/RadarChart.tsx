import {
  ChartFrame,
  type ChartLabels,
  type ChartSeries,
  Circle,
  G,
  Line,
  Path,
  Svg,
  SvgText,
  formatCompact,
  formatFull,
  niceTicks,
  numberAt,
  truncate,
  useChartColors,
  useChartInk,
} from '../../charts'

/** Widest a spoke label may grow, in pixels, before it is cut. */
const MAX_LABEL = 96

// Rows are `object`, not `Record<string, unknown>`: an interface has no index signature.
export interface RadarChartProps<T extends object = Record<string, unknown>> {
  /** Names the chart: its heading and accessible name. */
  title: string
  description?: string
  /**
   * One object per spoke, e.g. `{ sector: 'Health', planned: 80, reached: 64 }`. The
   * row type is inferred from here only; `index` and `series` must name its fields.
   */
  data: readonly T[]
  /** The field holding each spoke's name. */
  index: NoInfer<keyof T & string>
  /** Heading of the spoke column in the table view. Default: `index`. */
  indexLabel?: string
  /** The numeric fields to draw, one shape each, in color order. */
  series: readonly ChartSeries<NoInfer<keyof T & string>>[]
  /** The value at the edge. Default: the largest value, rounded up. Larger values stop at the edge. */
  max?: number
  /** Shape of the rings behind the data. Default: `polygon`. */
  grid?: 'polygon' | 'circle'
  /** Height in pixels. Default: 300. */
  height?: number
  /** Fixed width; by default the chart fills its container. */
  width?: number
  /** Formats values in the tooltip and table. Ring labels are compact (1.2K). */
  valueFormatter?: (value: number) => string
  /** Color of the surface the chart sits on, for the ring around markers. Default: `background`. */
  surface?: string
  labels?: Partial<ChartLabels>
}

/**
 * Compares a few items across several measures at once, one spoke per
 * measure from a shared zero. Includes a legend, a tooltip (hover, tap or
 * arrow keys, spoke by spoke) and a table view.
 */
export function RadarChart<T extends object>({
  title,
  description,
  data,
  index,
  indexLabel = index,
  series,
  max,
  grid = 'polygon',
  height = 300,
  width,
  valueFormatter = formatFull,
  surface = 'background',
  labels,
}: RadarChartProps<T>) {
  const colors = useChartColors()
  const ink = useChartInk(surface)
  const n = data.length
  const spokes = data.map((row) => String(row[index] ?? ''))
  const values = data.map((row) => series.map((s) => numberAt(row, s.key)))

  // With `max`, rings take the first round step that lands on it (1 to 5 for 5).
  const ticks =
    max != null
      ? ([6, 5, 4, 3].map((count) => niceTicks(0, max, count)).find((t) => t.at(-1) === max) ??
        niceTicks(0, max))
      : niceTicks(0, Math.max(0, ...values.flat().map((v) => v ?? 0)))
  const top = max ?? ticks.at(-1)!
  // A ring at each tick inside the edge, and one at the edge itself.
  const rings = [...ticks.filter((t) => t > 0 && t < top), top]

  const labelWidth = Math.min(MAX_LABEL, Math.max(1, ...spokes.map((s) => s.length)) * 7)
  const geometry = (w: number) => ({
    cx: w / 2,
    cy: height / 2,
    radius: Math.max(16, Math.min(w / 2 - labelWidth - 12, height / 2 - 28)),
  })
  // Spoke i points up for i = 0 and goes round clockwise.
  const angle = (i: number) => (Math.PI * 2 * i) / Math.max(1, n)
  const pointAt = (cx: number, cy: number, r: number, i: number) => ({
    x: cx + r * Math.sin(angle(i)),
    y: cy - r * Math.cos(angle(i)),
  })
  const scaleOf = (radius: number) => (value: number) =>
    (Math.max(0, Math.min(value, top)) / (top || 1)) * radius

  const format = (value: number | null) => (value == null ? '–' : valueFormatter(value))

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={
        series.length > 1
          ? series.map((s, j) => ({ label: s.label, color: colors[j % 8]!, shape: 'square' }))
          : []
      }
      height={height}
      width={width}
      count={n}
      hitTest={(x, y, w) => {
        const { cx, cy, radius } = geometry(w)
        if (n === 0 || Math.hypot(x - cx, y - cy) > radius + 24) return null
        const a = (Math.atan2(x - cx, cy - y) + Math.PI * 2) % (Math.PI * 2)
        return Math.round(a / angle(1)) % n
      }}
      anchor={(i, w) => {
        const { cx, cy, radius } = geometry(w)
        return { x: pointAt(cx, cy, radius, i).x, y: 0 }
      }}
      tooltip={(i) => ({
        title: spokes[i]!,
        rows: series.map((s, j) => ({
          label: s.label,
          value: format(values[i]![j]!),
          color: colors[j % 8]!,
          shape: 'square',
        })),
      })}
      table={{
        columns: [indexLabel, ...series.map((s) => s.label)],
        rows: data.map((_, i) => [spokes[i]!, ...values[i]!.map(format)]),
        numeric: [false, ...series.map(() => true)],
      }}
      labels={labels}
    >
      {(w, active) => {
        const { cx, cy, radius } = geometry(w)
        const r = scaleOf(radius)
        const polygon = (radii: (number | null)[]) => {
          // A missing value leaves its spoke out; the shape joins its neighbours.
          const corners = radii.flatMap((v, i) => (v == null ? [] : [pointAt(cx, cy, v, i)]))
          return corners.map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x},${p.y}`).join('') + 'Z'
        }
        return (
          <Svg width={w} height={height}>
            {rings.map((ring) =>
              grid === 'circle' ? (
                <Circle
                  key={ring}
                  cx={cx}
                  cy={cy}
                  r={r(ring)}
                  fill="none"
                  stroke={ink.grid}
                  strokeWidth={1}
                />
              ) : (
                <Path
                  key={ring}
                  d={polygon(spokes.map(() => r(ring)))}
                  fill="none"
                  stroke={ink.grid}
                  strokeWidth={1}
                />
              ),
            )}
            {spokes.map((spoke, i) => {
              const end = pointAt(cx, cy, radius, i)
              const label = pointAt(cx, cy, radius + 10, i)
              const sin = Math.sin(angle(i))
              const cos = Math.cos(angle(i))
              return (
                <G key={`${spoke}-${i}`}>
                  <Line
                    x1={cx}
                    y1={cy}
                    x2={end.x}
                    y2={end.y}
                    stroke={active === i ? ink.axis : ink.grid}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={label.x}
                    y={label.y}
                    // Labels lean away from the center: above at the top, below at the bottom.
                    dy={cos > 0.3 ? '-0.4em' : cos < -0.3 ? '0.8em' : '0.35em'}
                    fill={ink.text}
                    fontSize={12}
                    fontWeight={active === i ? '600' : undefined}
                    textAnchor={sin > 0.3 ? 'start' : sin < -0.3 ? 'end' : 'middle'}
                  >
                    {truncate(spoke, Math.floor(labelWidth / 7))}
                  </SvgText>
                </G>
              )
            })}
            {rings.map((ring) => (
              <SvgText
                key={`value-${ring}`}
                x={cx + 4}
                y={cy - r(ring)}
                dy="-0.25em"
                fill={ink.text}
                fontSize={10}
              >
                {formatCompact(ring)}
              </SvgText>
            ))}
            {series.map((s, j) => {
              const color = colors[j % 8]!
              const radii = values.map((row) => (row[j] == null ? null : r(row[j])))
              const drawn = radii.filter((v) => v != null).length
              if (drawn === 0) return null
              // A lone value has no shape to draw: show it as a dot.
              if (drawn === 1) {
                const only = radii.findIndex((v) => v != null)
                const p = pointAt(cx, cy, radii[only]!, only)
                return <Circle key={s.key} cx={p.x} cy={p.y} r={3} fill={color} />
              }
              return (
                <Path
                  key={s.key}
                  d={polygon(radii)}
                  fill={color}
                  fillOpacity={0.12}
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              )
            })}
            {/* Every series' marker on the active spoke, ringed in the surface color. */}
            {active != null
              ? series.map((s, j) => {
                  const value = values[active]?.[j]
                  if (value == null) return null
                  const p = pointAt(cx, cy, r(value), active)
                  return (
                    <Circle
                      key={`marker-${s.key}`}
                      cx={p.x}
                      cy={p.y}
                      r={4}
                      fill={colors[j % 8]!}
                      stroke={ink.surface}
                      strokeWidth={2}
                    />
                  )
                })
              : null}
          </Svg>
        )
      }}
    </ChartFrame>
  )
}
