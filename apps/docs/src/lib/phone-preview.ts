import { encode } from 'uqr'
import { siteConfig } from './site'

export interface PhonePreview {
  /** Opens the component's screen in Expo Go. */
  url: string
  /** Modules per side of the QR code, its quiet zone included. */
  size: number
  /** SVG path of the dark modules, one unit to a module. */
  path: string
}

/** Runs at build time, so the page holds the finished code and no QR library. */
export function phonePreview(slug: string): PhonePreview {
  // Expo Go fetches the app from the part before `/--/`, and Expo Router takes
  // the rest as its route.
  const url = `exps://${siteConfig.phonePreviewHost}/--/components/${slug}`
  const { data, size } = encode(url, { ecc: 'M', border: 4 })

  const runs: string[] = []
  data.forEach((row, y) => {
    for (let x = 0; x < size; x++) {
      if (!row[x]) continue
      const start = x
      while (row[x + 1]) x++
      runs.push(`M${start} ${y}h${x - start + 1}v1H${start}z`)
    }
  })

  return { url, size, path: runs.join('') }
}
