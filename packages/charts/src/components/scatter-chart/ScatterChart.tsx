import {
  ChartFrame,
  type ChartLabels,
  Circle,
  G,
  Line,
  Svg,
  SvgText,
  ValueGrid,
  ValueGridX,
  cartesianPadding,
  formatCompact,
  formatFull,
  linearScale,
  niceTicks,
  numberAt,
  useChartColors,
  useChartInk,
} from '../../charts'

const RADIUS = 5
const MIN_BUBBLE = 4
const MAX_BUBBLE = 20
/** Room for an axis name above the plot and under the x labels. */
const AXIS_NAME = 18

type Field = 'x' | 'y' | 'size'

// Rows are `object`, not `Record<string, unknown>`: an interface has no index signature.
export interface ScatterChartProps<T extends object = Record<string, unknown>> {
  /** Names the chart: its heading and accessible name. */
  title: string
  description?: string
  /**
   * One object per point, e.g. `{ project: 'Clinics', budget: 120000, reached: 8400 }`.
   * The row type is inferred from here only; the field props must name its fields.
   */
  data: readonly T[]
  /** The numeric field for each point's horizontal position. */
  x: NoInfer<keyof T & string>
  /** The numeric field for each point's vertical position. */
  y: NoInfer<keyof T & string>
  /** Names the x axis in the plot, the tooltip and the table. Default: `x`. */
  xLabel?: string
  /** Names the y axis in the plot, the tooltip and the table. Default: `y`. */
  yLabel?: string
  /** The field naming each point, for the tooltip and the table. */
  index?: NoInfer<keyof T & string>
  /** Heading of the name column in the table view. Default: `index`. */
  indexLabel?: string
  /** The field that groups points into colored series, named in the legend. */
  category?: NoInfer<keyof T & string>
  /** Heading of the group column in the table view. Default: `category`. */
  categoryLabel?: string
  /** A numeric field that sizes each point by its area (a bubble chart). */
  size?: NoInfer<keyof T & string>
  /** Names the size field in the tooltip and the table. Default: `size`. */
  sizeLabel?: string
  /** Both axes start at zero. Default: false. */
  startAtZero?: boolean
  /** Height in pixels, including the axes. Default: 280. */
  height?: number
  /** Fixed width; by default the chart fills its container. */
  width?: number
  /**
   * Formats values in the tooltip and table; `field` says which one, as the
   * axes often have different units. Axis ticks are always compact (1.2K).
   */
  valueFormatter?: (value: number, field: Field) => string
  /** Color of the surface the chart sits on, for the ring around points. Default: `background`. */
  surface?: string
  labels?: Partial<ChartLabels>
}

/**
 * Shows how two measures relate, one point per row, optionally grouped by
 * color and sized by a third measure. Includes a tooltip (hover, tap or
 * arrow keys, left to right), a legend for groups and a table view.
 */
export function ScatterChart<T extends object>({
  title,
  description,
  data,
  x,
  y,
  xLabel = x,
  yLabel = y,
  index,
  indexLabel,
  category,
  categoryLabel,
  size,
  sizeLabel = size ?? 'size',
  startAtZero = false,
  height = 280,
  width,
  valueFormatter = formatFull,
  surface = 'background',
  labels,
}: ScatterChartProps<T>) {
  const colors = useChartColors()
  const ink = useChartInk(surface)

  // Groups keep the order they first appear in, and their color with it.
  const groups: string[] = []
  const rows = data.map((row, i) => {
    const group = category != null ? String(row[category] ?? '') : ''
    if (category != null && !groups.includes(group)) groups.push(group)
    return {
      i,
      name: index != null ? String(row[index] ?? '') : null,
      group,
      x: numberAt(row, x),
      y: numberAt(row, y),
      size: size != null ? numberAt(row, size) : null,
    }
  })
  // A point needs both values. The arrow keys step through them left to right.
  const points = rows
    .flatMap((r) => (r.x != null && r.y != null ? [{ ...r, x: r.x, y: r.y }] : []))
    .sort((a, b) => a.x - b.x || a.y - b.y)

  const range = (values: number[]) =>
    niceTicks(
      startAtZero ? Math.min(0, ...values) : Math.min(...values),
      startAtZero ? Math.max(0, ...values) : Math.max(...values),
    )
  const xTicks = range(points.map((p) => p.x))
  const yTicks = range(points.map((p) => p.y))

  // Area, not radius, follows the value, so a bubble twice the size looks it.
  const largest = Math.max(0, ...points.map((p) => p.size ?? 0))
  const radiusOf = (value: number | null) =>
    size == null
      ? RADIUS
      : value == null || value <= 0 || largest === 0
        ? MIN_BUBBLE
        : Math.max(MIN_BUBBLE, MAX_BUBBLE * Math.sqrt(value / largest))

  const xLabelWidth = Math.max(...xTicks.map((t) => formatCompact(t).length)) * 7
  const pad = {
    top: AXIS_NAME + 8,
    // The last x label is centered on the edge of the plot: leave it half its width.
    right: Math.max(size == null ? 12 : MAX_BUBBLE, xLabelWidth / 2 + 4),
    bottom: cartesianPadding(yTicks).bottom + AXIS_NAME,
    left: cartesianPadding(yTicks).left,
  }
  const scales = (w: number) => ({
    px: linearScale([xTicks[0]!, xTicks.at(-1)!], [pad.left, w - pad.right]),
    py: linearScale([yTicks[0]!, yTicks.at(-1)!], [height - pad.bottom, pad.top]),
  })

  const format = (value: number | null, field: Field) =>
    value == null ? '–' : valueFormatter(value, field)
  const colorOf = (group: string) => colors[Math.max(0, groups.indexOf(group)) % 8]!
  const nameHeading = indexLabel ?? index ?? ''
  const groupHeading = categoryLabel ?? category ?? ''

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={
        groups.length > 1
          ? groups.map((group) => ({ label: group, color: colorOf(group), shape: 'dot' as const }))
          : []
      }
      height={height}
      width={width}
      count={points.length}
      hitTest={(cx, cy, w) => {
        const { px, py } = scales(w)
        let found: number | null = null
        let nearest = Infinity
        for (const [k, p] of points.entries()) {
          const distance = Math.hypot(px(p.x) - cx, py(p.y) - cy)
          // A margin around each point, so small dots are easy to hover and tap.
          if (distance <= Math.max(16, radiusOf(p.size) + 6) && distance < nearest) {
            found = k
            nearest = distance
          }
        }
        return found
      }}
      anchor={(k, w) => {
        const { px, py } = scales(w)
        return { x: px(points[k]!.x), y: py(points[k]!.y) }
      }}
      tooltip={(k) => {
        const p = points[k]!
        const row = (label: string, value: string) => ({
          label,
          value,
          color: colorOf(p.group),
          shape: 'dot' as const,
        })
        return {
          // Unnamed points go by their group, or else their row number.
          title: p.name ?? (category != null ? p.group : String(p.i + 1)),
          rows: [
            ...(category != null && p.name != null ? [row(groupHeading, p.group)] : []),
            row(xLabel, format(p.x, 'x')),
            row(yLabel, format(p.y, 'y')),
            ...(size != null ? [row(sizeLabel, format(p.size, 'size'))] : []),
          ],
        }
      }}
      table={{
        columns: [
          ...(index != null ? [nameHeading] : []),
          ...(category != null ? [groupHeading] : []),
          xLabel,
          yLabel,
          ...(size != null ? [sizeLabel] : []),
        ],
        rows: rows.map((r) => [
          ...(index != null ? [r.name ?? ''] : []),
          ...(category != null ? [r.group] : []),
          format(r.x, 'x'),
          format(r.y, 'y'),
          ...(size != null ? [format(r.size, 'size')] : []),
        ]),
        numeric: [
          ...(index != null ? [false] : []),
          ...(category != null ? [false] : []),
          true,
          true,
          ...(size != null ? [true] : []),
        ],
      }}
      labels={labels}
    >
      {(w, active) => {
        const { px, py } = scales(w)
        const focus = active != null ? points[active] : undefined
        // Big bubbles first, so the small ones stay on top of them.
        const order =
          size != null ? [...points].sort((a, b) => (b.size ?? 0) - (a.size ?? 0)) : points
        return (
          <Svg width={w} height={height}>
            <ValueGrid ticks={yTicks} y={py} left={pad.left} right={w - pad.right} ink={ink} />
            <ValueGridX
              ticks={xTicks}
              x={px}
              top={pad.top}
              bottom={height - pad.bottom}
              ink={ink}
            />
            <SvgText x={0} y={12} fill={ink.text} fontSize={12}>
              {yLabel}
            </SvgText>
            <SvgText
              x={w - pad.right}
              y={height - 4}
              fill={ink.text}
              fontSize={12}
              textAnchor="end"
            >
              {xLabel}
            </SvgText>
            {focus ? (
              <>
                <Line
                  x1={pad.left}
                  x2={px(focus.x)}
                  y1={py(focus.y)}
                  y2={py(focus.y)}
                  stroke={ink.axis}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <Line
                  x1={px(focus.x)}
                  x2={px(focus.x)}
                  y1={py(focus.y)}
                  y2={height - pad.bottom}
                  stroke={ink.axis}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              </>
            ) : null}
            <G opacity={focus ? 0.4 : 1}>
              {order.map((p) => (
                <Circle
                  key={p.i}
                  cx={px(p.x)}
                  cy={py(p.y)}
                  r={radiusOf(p.size)}
                  fill={colorOf(p.group)}
                  fillOpacity={size != null ? 0.7 : 0.85}
                  stroke={ink.surface}
                  strokeWidth={1}
                />
              ))}
            </G>
            {focus ? (
              <Circle
                cx={px(focus.x)}
                cy={py(focus.y)}
                r={radiusOf(focus.size) + 1}
                fill={colorOf(focus.group)}
                stroke={ink.surface}
                strokeWidth={2}
              />
            ) : null}
          </Svg>
        )
      }}
    </ChartFrame>
  )
}
