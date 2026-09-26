import type { FullConfig } from '@playwright/test'

// `next start` loads each route's server bundle on its first request. When all
// workers hit cold routes at once the server can stall long enough for
// `page.goto` to fail, so request the routes the tests use once, one at a time.
const routes = [
  '/',
  '/docs/introduction',
  '/docs/components',
  '/docs/components/button',
  '/docs/components/dialog',
  '/docs/components/select',
  '/examples/login',
  '/examples/mobile-home',
  '/playground',
  '/preview/button/basic',
  '/visual',
]

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL
  if (!baseURL) return
  for (const route of routes) {
    // A failed warm-up is not a test failure; the test itself will report it.
    await fetch(new URL(route, baseURL))
      .then((response) => response.arrayBuffer())
      .catch(() => undefined)
  }
}
