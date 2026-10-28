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
  /** The palette color the steps are shades of. Default: `chart1`. */
  color?: HeatmapColor
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
 * where activity concentrates by place and sector, or by day and hour. The
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
  height: heightProp,
  width,
  valueFormatter = formatFull,
  text: textProp,
  labels,
}: HeatmapProps<T>) {
  const text = { noData: 'No data', ...textProp }
  const fill = useChartColors()[Number(color.slice(5)) - 1] ?? 'currentColor'
  const ink = useChartInk('background')
  const outline = useIconColor('foreground') ?? 'currentColor'
  const rows = data.length
  const columns = series.length
  const names = data.map((row) => String(row[index] ?? ''))
  const values = data.map((row) => series.map((s) => numberAt(row, s.key)))
  const all = values.flat().filter((v): v is number => v != null)

  // Shades step at round values (0–10, 10–20…): the first step that gives four to six.
  const [low, high] = [Math.min(0, ...all), Math.max(0, ...all)]
  const edges =
    [6, 7, 8, 9]
      .map((count) => niceTicks(low, high, count))
      .find((ticks) => ticks.length >= 5 && ticks.length <= 7) ?? niceTicks(low, high, 6)
  const shades = edges.length - 1
  const shadeOf = (value: number) => {
    const above = edges.findIndex((edge) => value < edge)
    // The top edge itself belongs to the last shade.
    return above === -1 ? shades - 1 : Math.max(0, above - 1)
  }
  // The top shade is the full color; the lightest stays visible on the surface.
  const opacityOf = (value: number) => 0.2 + (0.8 * shadeOf(value)) / Math.max(1, shades - 1)

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
        ...Array.from({ length: shades }, (_, shade) => ({
          label: `${formatCompact(edges[shade]!)}–${formatCompact(edges[shade + 1]!)}`,
          color: fill,
          opacity: opacityOf(edges[shade]!),
          shape: 'square' as const,
        })),
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
              color: value == null ? ink.grid : fill,
              opacity: value == null ? undefined : opacityOf(value),
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
                  fill={value == null ? ink.grid : fill}
                  fillOpacity={value == null ? 1 : opacityOf(value)}
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
