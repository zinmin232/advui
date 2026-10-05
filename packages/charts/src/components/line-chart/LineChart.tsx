import { LinePlot, type LinePlotProps } from '../../charts'

export type LineChartProps<T extends object = Record<string, unknown>> = LinePlotProps<T>

/**
 * Shows change over an ordered axis (months, years) as 2px lines, with a
 * crosshair tooltip (hover, tap or arrow keys), a legend and a table view.
 */
export function LineChart<T extends object>(props: LineChartProps<T>) {
  return <LinePlot<T> {...props} />
}
