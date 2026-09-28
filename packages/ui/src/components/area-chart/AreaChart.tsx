import { LinePlot, type LinePlotProps } from '../../charts'

export interface AreaChartProps extends LinePlotProps {
  /** Stacks the series, so the top edge is their total (part-to-whole over time). */
  stacked?: boolean
}

/**
 * A line chart with a light wash under each line, from zero. Best for one
 * series, or for stacked totals over time.
 */
export function AreaChart({ stacked = false, ...props }: AreaChartProps) {
  return <LinePlot {...props} area stacked={stacked} />
}
