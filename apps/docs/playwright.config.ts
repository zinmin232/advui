import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PORT ?? 3100)
// Use an installed Chrome locally (no browser download); CI can run `playwright install chromium`.
const channel = process.env.PW_CHANNEL ?? (process.env.CI ? undefined : 'chrome')

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  // Every worker drives a full Chrome against one `next start` process; more
  // than three starves the server on a typical dev machine (CI keeps the default).
  workers: process.env.CI ? undefined : 3,
  retries: process.env.CI ? 2 : 0,
  // CI: live progress in the log, annotations on the run, and an HTML report artifact.
  reporter: process.env.CI ? [['list'], ['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  // Stop and report well before the CI job's own 30-minute limit.
  globalTimeout: process.env.CI ? 15 * 60_000 : undefined,
  expect: {
    // Parallel workers share one `next start` server; client navigations can
    // take several seconds under that load even though every page is static.
    timeout: 15_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
    channel,
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /(visual|mobile)\.spec/,
      use: { ...devices['Desktop Chrome'], channel },
    },
    { name: 'mobile', testMatch: /mobile\.spec/, use: { ...devices['Pixel 7'], channel } },
    { name: 'visual', testMatch: /visual\.spec/, use: { ...devices['Desktop Chrome'], channel } },
  ],
  // Tests run against the production build (`pnpm build` first).
  webServer: {
    command: `pnpm exec next start --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
