import { useIconColor } from '@advui/icons'
import {
  CategoryLabels,
  ChartFrame,
  type ChartLabels,
  type ChartSeries,
  Rect,
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

const GAP = 2
const ROW_HEIGHT = 32

/** Round edges from low to high, with the first count that gives `min` to `max` shades. */
function stepEdges(low: number, high: number, [min, max]: [number, number]) {
  return (
    [min + 2, min + 3, min + 4, min + 5]
      .map((count) => niceTicks(low, high, count))
      .find((ticks) => ticks.length > min && ticks.length <= max + 1) ??
    niceTicks(low, high, min + 2)
  )
}

/** The step a value falls in: the top edge itself belongs to the last one. */
function stepOf(edges: readonly number[], value: number) {
  const above = edges.findIndex((edge) => value < edge)
  return above === -1 ? edges.length - 2 : Math.max(0, above - 1)
}

// "−20 to −10" rather than "-20–-10", which reads as one number.
const range = (from: number, to: number) =>
  from < 0 || to < 0
    ? `${formatCompact(from)} to ${formatCompact(to)}`
    : `${formatCompact(from)}–${formatCompact(to)}`

export type HeatmapColor =
  'chart1' | 'chart2' | 'chart3' | 'chart4' | 'chart5' | 'chart6' | 'chart7' | 'chart8'

// Rows are `object`, not `Record<string, unknown>`: an interface has no index signature.
export interface HeatmapProps<T extends object = Record<string, unknown>> {
  /** Names the chart: its heading and accessible name. */
  title: string
  description?: string
  /**
   * One object per row of cells, e.g. `{ state: 'Kachin', health: 12, wash: 4 }`. The
   * row type is inferred from here only; `index` and `series` must name its fields.
   */
  data: readonly T[]
  /** The field holding each row's name. */
  index: NoInfer<keyof T & string>
  /** Heading of the row-name column in the table view. Default: `index`. */
  indexLabel?: string
  /** The numeric fields, one column of cells each. */
  series: readonly ChartSeries<NoInfer<keyof T & string>>[]
  /** The palette color the steps are shades of (above `midpoint` when diverging). Default: `chart1`. */
  color?: HeatmapColor
  /**
   * `sequential` shades one color, darker for more. `diverging` shades
   * `negativeColor` below `midpoint` and `color` above it, darker further from
   * it, for changes or values around a target. Default: `sequential`.
   */
  scale?: 'sequential' | 'diverging'
  /** Diverging: the value where the two colors meet. Default: 0. */
  midpoint?: number
  /** Diverging: the palette color below `midpoint`. Default: `chart2`. */
  negativeColor?: HeatmapColor
  /** Height in pixels. Default: 32 per row, plus the column labels. */
  height?: number
  /** Fixed width; by default the chart fills its container. */
  width?: number
  /** Formats values in the tooltip and table. The legend's ranges are compact (1.2K). */
  valueFormatter?: (value: number) => string
  /** The legend entry for empty cells, for translation. */
  text?: { noData?: string }
  labels?: Partial<ChartLabels>
}

/**
 * Values across two categories as a grid of shaded cells, darker for more:
 * where activity concentrates by place and sector, or by day and hour. A
 * diverging scale shades two colors away from a midpoint, for changes. The
 * legend gives each shade's range; the tooltip (hover, tap or arrow keys in
 * two directions) and the table view give exact values.
 */
export function Heatmap<T extends object>({
  title,
  description,
  data,
  index,
  indexLabel = index,
  series,
  color = 'chart1',
  scale = 'sequential',
  midpoint = 0,
  negativeColor = 'chart2',
  height: heightProp,
  width,
  valueFormatter = formatFull,
  text: textProp,
  labels,
}: HeatmapProps<T>) {
  const text = { noData: 'No data', ...textProp }
  const palette = useChartColors()
  const colorOf = (key: HeatmapColor) => palette[Number(key.slice(5)) - 1] ?? 'currentColor'
  const ink = useChartInk('background')
  const outline = useIconColor('foreground') ?? 'currentColor'
  const rows = data.length
  const columns = series.length
  const names = data.map((row) => String(row[index] ?? ''))
  const values = data.map((row) => series.map((s) => numberAt(row, s.key)))
  const all = values.flat().filter((v): v is number => v != null)

  // Shades step at round values (0–10, 10–20…). Sequential: four to six steps
  // from the lowest value (or 0) to the highest. Diverging: two to four steps
  // of the distance from the midpoint, the same on both sides.
  const diverging = scale === 'diverging'
  const edges = diverging
    ? stepEdges(0, Math.max(0, ...all.map((v) => Math.abs(v - midpoint))), [2, 4])
    : stepEdges(Math.min(0, ...all), Math.max(0, ...all), [4, 6])
  const steps = edges.length - 1
  // The top step is the full color; the lightest stays visible on the surface.
  const opacityAt = (step: number) => 0.2 + (0.8 * step) / Math.max(1, steps - 1)
  const fill = colorOf(color)
  const negativeFill = colorOf(negativeColor)
  const shadeOf = (value: number) =>
    diverging
      ? {
          fill: value < midpoint ? negativeFill : fill,
          opacity: opacityAt(stepOf(edges, Math.abs(value - midpoint))),
        }
      : { fill, opacity: opacityAt(stepOf(edges, value)) }
  const legendSteps = diverging
    ? [
        // From the strongest below the midpoint to the strongest above it.
        ...Array.from({ length: steps }, (_, i) => steps - 1 - i).map((step) => ({
          label: range(midpoint - edges[step + 1]!, midpoint - edges[step]!),
          color: negativeFill,
          opacity: opacityAt(step),
        })),
        ...Array.from({ length: steps }, (_, step) => ({
          label: range(midpoint + edges[step]!, midpoint + edges[step + 1]!),
          color: fill,
          opacity: opacityAt(step),
        })),
      ]
    : Array.from({ length: steps }, (_, step) => ({
        label: range(edges[step]!, edges[step + 1]!),
        color: fill,
        opacity: opacityAt(step),
      }))

  const labelWidth = Math.min(160, Math.max(1, ...names.map((name) => name.length)) * 7 + 12)
  const pad = { top: 0, right: 0, bottom: 24, left: labelWidth }
  const height = heightProp ?? Math.max(96, rows * ROW_HEIGHT + pad.bottom)
  const cellsAt = (w: number) => ({
    cw: (w - pad.left - pad.right) / Math.max(1, columns),
    ch: (height - pad.top - pad.bottom) / Math.max(1, rows),
  })

  const format = (value: number | null) => (value == null ? '–' : valueFormatter(value))
  const missing = all.length < rows * columns

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={[
        ...legendSteps.map((step) => ({ ...step, shape: 'square' as const })),
        ...(missing ? [{ label: text.noData, color: ink.grid, shape: 'square' as const }] : []),
      ]}
      height={height}
      width={width}
      count={rows * columns}
      columns={columns}
      hitTest={(x, y, w) => {
        const { cw, ch } = cellsAt(w)
        const c = Math.floor((x - pad.left) / cw)
        const r = Math.floor((y - pad.top) / ch)
        return c >= 0 && c < columns && r >= 0 && r < rows ? r * columns + c : null
      }}
      anchor={(k, w) => {
        const { cw, ch } = cellsAt(w)
        return {
          x: pad.left + ((k % columns) + 0.5) * cw,
          y: pad.top + Math.floor(k / columns) * ch,
        }
      }}
      tooltip={(k) => {
        const r = Math.floor(k / columns)
        const c = k % columns
        const value = values[r]?.[c] ?? null
        return {
          title: names[r]!,
          rows: [
            {
              label: series[c]!.label,
              value: format(value),
              color: value == null ? ink.grid : shadeOf(value).fill,
              opacity: value == null ? undefined : shadeOf(value).opacity,
              shape: 'square',
            },
          ],
        }
      }}
      table={{
        columns: [indexLabel, ...series.map((s) => s.label)],
        rows: data.map((_, r) => [names[r]!, ...values[r]!.map(format)]),
        numeric: [false, ...series.map(() => true)],
      }}
      labels={labels}
    >
      {(w, active) => {
        const { cw, ch } = cellsAt(w)
        const radius = Math.min(4, cw / 4, ch / 4)
        return (
          <Svg width={w} height={height}>
            {values.map((row, r) =>
              row.map((value, c) => (
                <Rect
                  key={`${r}-${c}`}
                  x={pad.left + c * cw + GAP / 2}
                  y={pad.top + r * ch + GAP / 2}
                  width={Math.max(0, cw - GAP)}
                  height={Math.max(0, ch - GAP)}
                  rx={radius}
                  fill={value == null ? ink.grid : shadeOf(value).fill}
                  fillOpacity={value == null ? 1 : shadeOf(value).opacity}
                />
              )),
            )}
            {active != null ? (
              <Rect
                x={pad.left + (active % columns) * cw + GAP / 2}
                y={pad.top + Math.floor(active / columns) * ch + GAP / 2}
                width={Math.max(0, cw - GAP)}
                height={Math.max(0, ch - GAP)}
                rx={radius}
                fill="none"
                stroke={outline}
                strokeWidth={2}
              />
            ) : null}
            {names.map((name, r) => (
              <SvgText
                key={`row-${r}`}
                x={pad.left - 8}
                y={pad.top + (r + 0.5) * ch}
                dy="0.35em"
                fill={ink.text}
                fontSize={12}
                fontWeight={
                  active != null && Math.floor(active / columns) === r ? '600' : undefined
                }
                textAnchor="end"
              >
                {truncate(name, Math.floor((pad.left - 12) / 7))}
              </SvgText>
            ))}
            <CategoryLabels
              labels={series.map((s) => s.label)}
              x={(c) => pad.left + (c + 0.5) * cw}
              y={height - pad.bottom + 4}
              available={cw}
              ink={ink}
            />
          </Svg>
        )
      }}
    </ChartFrame>
  )
}
