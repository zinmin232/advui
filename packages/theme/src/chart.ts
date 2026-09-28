import type { ColorMode } from './themes'

/**
 * Categorical colors for chart series, in their fixed order (`$chart1` is the
 * first series). The order is part of the palette: neighbors stay apart under
 * protanopia and deuteranopia (OKLab ΔE ≥ 8) and for full-color vision (≥ 15).
 * Dark mode uses its own steps of the same eight hues, not an inverted light
 * palette. Validated against every preset's light and dark surface.
 *
 * Three light-mode slots (aqua, yellow, magenta) sit below 3:1 on white, so
 * charts always carry a legend and a table view as well as color.
 */
export const chartPalette: Record<ColorMode, readonly string[]> = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
}

/** Theme keys for the chart palette: `{ chart1: '#…', …, chart8: '#…' }`. */
export function chartColors(mode: ColorMode) {
  const [chart1, chart2, chart3, chart4, chart5, chart6, chart7, chart8] = chartPalette[mode] as [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ]
  return { chart1, chart2, chart3, chart4, chart5, chart6, chart7, chart8 }
}
