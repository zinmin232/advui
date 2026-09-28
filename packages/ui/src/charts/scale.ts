/** Clean, round tick values ("nice numbers") covering [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0]
  if (min === max) {
    if (min === 0) return [0, 1]
    ;[min, max] = min > 0 ? [0, min] : [min, 0]
  }
  const step = niceStep((max - min) / Math.max(1, count - 1))
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const ticks: number[] = []
  // Rounding keeps 0.1 + 0.2 style float noise out of the labels.
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toPrecision(12)))
  return ticks
}

function niceStep(raw: number): number {
  const power = 10 ** Math.floor(Math.log10(raw))
  const fraction = raw / power
  const nice =
    fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10
  return nice * power
}

/** Maps a value in [d0, d1] to [r0, r1]. */
export function linearScale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const span = d1 - d0 || 1
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0)
}

/**
 * Splits [start, end] into `count` equal bands; `band(i)` is the start of
 * band i and `bandwidth` its size.
 */
export function bandScale(count: number, [start, end]: [number, number]) {
  const bandwidth = (end - start) / Math.max(1, count)
  return { band: (index: number) => start + index * bandwidth, bandwidth }
}

/**
 * A rectangle with rounded corners on its data end only (the end away from
 * the baseline), as an SVG path. `direction` is where the data end points.
 */
export function barPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  direction: 'up' | 'down' | 'right' | 'left',
): string {
  if (width <= 0 || height <= 0) return ''
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  const x2 = x + width
  const y2 = y + height
  switch (direction) {
    case 'up':
      return `M${x},${y2}V${y + r}Q${x},${y} ${x + r},${y}H${x2 - r}Q${x2},${y} ${x2},${y + r}V${y2}Z`
    case 'down':
      return `M${x},${y}V${y2 - r}Q${x},${y2} ${x + r},${y2}H${x2 - r}Q${x2},${y2} ${x2},${y2 - r}V${y}Z`
    case 'right':
      return `M${x},${y}H${x2 - r}Q${x2},${y} ${x2},${y + r}V${y2 - r}Q${x2},${y2} ${x2 - r},${y2}H${x}Z`
    case 'left':
      return `M${x2},${y}H${x + r}Q${x},${y} ${x},${y + r}V${y2 - r}Q${x},${y2} ${x + r},${y2}H${x2}Z`
  }
}

/** A pie or donut slice as an SVG path; angles in radians, 0 at 12 o'clock. */
export function arcPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
): string {
  const point = (radius: number, angle: number) =>
    `${cx + radius * Math.sin(angle)},${cy - radius * Math.cos(angle)}`
  const large = end - start > Math.PI ? 1 : 0
  // A full circle cannot be one arc: split it in two.
  if (end - start >= Math.PI * 2 - 1e-6) {
    const mid = start + Math.PI
    return inner > 0
      ? `M${point(outer, start)}A${outer},${outer} 0 1 1 ${point(outer, mid)}A${outer},${outer} 0 1 1 ${point(outer, start)}` +
          `M${point(inner, start)}A${inner},${inner} 0 1 0 ${point(inner, mid)}A${inner},${inner} 0 1 0 ${point(inner, start)}Z`
      : `M${point(outer, start)}A${outer},${outer} 0 1 1 ${point(outer, mid)}A${outer},${outer} 0 1 1 ${point(outer, start)}Z`
  }
  return inner > 0
    ? `M${point(outer, start)}A${outer},${outer} 0 ${large} 1 ${point(outer, end)}L${point(inner, end)}A${inner},${inner} 0 ${large} 0 ${point(inner, start)}Z`
    : `M${cx},${cy}L${point(outer, start)}A${outer},${outer} 0 ${large} 1 ${point(outer, end)}Z`
}
