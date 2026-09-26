import { test as base } from '@playwright/test'

// Demo content uses remote photos (pravatar, Unsplash). Serve deterministic
// local placeholders so tests never depend on third-party hosts being reachable.
const remotePhotos = /^https:\/\/(i\.pravatar\.cc|images\.unsplash\.com)\//

function placeholder(url: string) {
  let hash = 0
  for (const char of url) hash = (hash * 31 + char.charCodeAt(0)) | 0
  const hue = Math.abs(hash) % 360
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="hsl(${hue} 45% 60%)"/></svg>`
}

export const test = base.extend({
  // The callback is named `provide` (not `use`) so the React hooks lint rule ignores it.
  page: async ({ page }, provide) => {
    await page.route(remotePhotos, (route) =>
      route.fulfill({ contentType: 'image/svg+xml', body: placeholder(route.request().url()) }),
    )
    await provide(page)
  },
})

export { expect } from '@playwright/test'
