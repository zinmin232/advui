import { LinePlot, type LinePlotProps } from '../../charts'

export interface AreaChartProps<T extends object = Record<string, unknown>>
  extends LinePlotProps<T> {
  /** Stacks the series, so the top edge is their total (part-to-whole over time). */
  stacked?: boolean
}

/**
 * A line chart with a light wash under each line, from zero. Best for one
 * series, or for stacked totals over time.
 */
export function AreaChart<T extends object>({ stacked = false, ...props }: AreaChartProps<T>) {
  return <LinePlot<T> {...props} area stacked={stacked} />
}
