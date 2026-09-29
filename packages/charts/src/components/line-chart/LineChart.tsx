import { LinePlot, type LinePlotProps } from '../../charts'

export type LineChartProps = LinePlotProps

/**
 * Shows change over an ordered axis (months, years) as 2px lines, with a
 * crosshair tooltip (hover, tap or arrow keys), a legend and a table view.
 */
export function LineChart(props: LineChartProps) {
  return <LinePlot {...props} />
}
