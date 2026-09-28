import { Line, SvgText } from './svg'
import { formatCompact } from './format'

/** Space around the plot for axis labels. */
export function cartesianPadding(
  ticks: number[],
  format: (value: number) => string = formatCompact,
) {
  // About 7px per character of the widest tick label at 12px.
  const labelWidth = Math.max(...ticks.map((t) => format(t).length)) * 7
  return { top: 8, right: 8, bottom: 24, left: labelWidth + 12 }
}

/** Horizontal gridlines with value labels on the left. */
export function ValueGrid({
  ticks,
  y,
  left,
  right,
  ink,
  format = formatCompact,
}: {
  ticks: number[]
  y: (value: number) => number
  left: number
  right: number
  ink: { text: string; grid: string; axis: string }
  format?: (value: number) => string
}) {
  return (
    <>
      {ticks.map((tick) => (
        <Line
          key={`grid-${tick}`}
          x1={left}
          x2={right}
          y1={y(tick)}
          y2={y(tick)}
          stroke={tick === 0 ? ink.axis : ink.grid}
          strokeWidth={1}
        />
      ))}
      {ticks.map((tick) => (
        <SvgText
          key={`label-${tick}`}
          x={left - 8}
          y={y(tick)}
          dy="0.35em"
          fill={ink.text}
          fontSize={12}
          textAnchor="end"
        >
          {format(tick)}
        </SvgText>
      ))}
    </>
  )
}

/**
 * Category labels under the plot. When they would overlap, only every nth
 * is drawn (the first and the rest in steps), so none collide.
 */
export function CategoryLabels({
  labels,
  x,
  y,
  available,
  ink,
}: {
  labels: string[]
  x: (index: number) => number
  y: number
  /** Width each label may use before thinning kicks in. */
  available: number
  ink: { text: string }
}) {
  const widest = Math.max(1, ...labels.map((l) => l.length)) * 7 + 8
  const step = Math.max(1, Math.ceil(widest / Math.max(1, available)))
  return (
    <>
      {labels.map((label, index) =>
        index % step === 0 ? (
          <SvgText
            key={`${label}-${index}`}
            x={x(index)}
            y={y}
            dy="0.9em"
            fill={ink.text}
            fontSize={12}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ) : null,
      )}
    </>
  )
}
