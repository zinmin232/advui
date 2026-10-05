import { type Page, test as base } from '@playwright/test'

// Demo content uses remote photos (pravatar, Unsplash). Serve deterministic
// local placeholders so tests never depend on third-party hosts being reachable.
const remotePhotos = /^https:\/\/(i\.pravatar\.cc|images\.unsplash\.com)\//

function placeholder(url: string) {
  let hash = 0
  for (const char of url) hash = (hash * 31 + char.charCodeAt(0)) | 0
  const hue = Math.abs(hash) % 360
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="hsl(${hue} 45% 60%)"/></svg>`
}

// Demo audio and video (MDN's CC0 samples) get 30 seconds of silence instead, so
// players load, show a length and never fail because of the network.
const remoteMedia = /^https:\/\/interactive-examples\.mdn\.mozilla\.net\/media\//

function silentWav(seconds: number) {
  const rate = 8000
  const samples = rate * seconds
  const wav = Buffer.alloc(44 + samples, 128)
  wav.write('RIFF', 0)
  wav.writeUInt32LE(36 + samples, 4)
  wav.write('WAVEfmt ', 8)
  wav.writeUInt32LE(16, 16) // PCM chunk size
  wav.writeUInt16LE(1, 20) // PCM
  wav.writeUInt16LE(1, 22) // mono
  wav.writeUInt32LE(rate, 24)
  wav.writeUInt32LE(rate, 28) // bytes per second
  wav.writeUInt16LE(1, 32) // block align
  wav.writeUInt16LE(8, 34) // bits per sample
  wav.write('data', 36)
  wav.writeUInt32LE(samples, 40)
  return wav
}

const silence = silentWav(30)

export const test = base.extend({
  // The callback is named `provide` (not `use`) so the React hooks lint rule ignores it.
  page: async ({ page }, provide) => {
    await page.route(remotePhotos, (route) =>
      route.fulfill({ contentType: 'image/svg+xml', body: placeholder(route.request().url()) }),
    )
    await page.route(remoteMedia, (route) =>
      route.fulfill({ contentType: 'audio/wav', body: silence }),
    )
    await provide(page)
  },
})

/**
 * Boxes of the Grid cells that hold these texts: the nearest ancestor whose
 * parent is the wrapping row. Checks layout in a real browser, which unit
 * tests cannot.
 */
export function gridCells(page: Page, texts: string[]) {
  return page.evaluate((labels) => {
    return labels.map((label) => {
      const text = [...document.querySelectorAll('body *')].find(
        (el) => el.children.length === 0 && el.textContent === label,
      )
      let cell = text
      while (cell?.parentElement && getComputedStyle(cell.parentElement).flexWrap !== 'wrap')
        cell = cell.parentElement
      if (!cell) throw new Error(`No grid cell holds "${label}"`)
      const { x, y, width } = cell.getBoundingClientRect()
      return { x, y, width }
    })
  }, texts)
}

/** Boxes of the AutoGrid cells that hold these texts: the children of the CSS grid. */
export function autoGridCells(page: Page, texts: string[]) {
  return page.evaluate((labels) => {
    return labels.map((label) => {
      const text = [...document.querySelectorAll('body *')].find(
        (el) => el.children.length === 0 && el.textContent === label,
      )
      let cell = text
      while (cell?.parentElement && getComputedStyle(cell.parentElement).display !== 'grid')
        cell = cell.parentElement
      if (!cell?.parentElement) throw new Error(`No auto grid cell holds "${label}"`)
      const { x, y, width } = cell.getBoundingClientRect()
      return { x, y, width }
    })
  }, texts)
}

export { expect } from '@playwright/test'
