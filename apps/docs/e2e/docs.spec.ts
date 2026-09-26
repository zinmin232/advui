import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

test('home page renders the hero and live components without errors', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Build once')
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
  expect(errors).toEqual([])
})

test('sidebar is generated from metadata and marks the current page', async ({ page }) => {
  await page.goto('/docs/components/button')
  const nav = page.getByRole('navigation', { name: 'Documentation' })
  await expect(nav.getByRole('link', { name: /Button/ }).first()).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(nav.getByRole('link', { name: /Data Grid/ })).toBeVisible()
  await nav.getByRole('link', { name: /^Switch/ }).click()
  await expect(page).toHaveURL(/\/docs\/components\/switch$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Switch' })).toBeVisible()
})

test('component page contains every documentation section', async ({ page }) => {
  await page.goto('/docs/components/button')
  for (const heading of [
    'Installation',
    'Usage',
    'Examples',
    'API reference',
    'Accessibility',
    'Responsive behavior',
    'Platform notes',
    'Related components',
  ]) {
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible()
  }
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText(
    'Buttons & Actions',
  )
  await expect(page.getByRole('table').first()).toContainText('variant')
})

test('playground updates the preview and generated JSX', async ({ page }) => {
  await page.goto('/docs/components/button')
  await page.getByRole('radio', { name: 'outline' }).click()
  await page.getByRole('radio', { name: 'lg' }).click()
  await expect(page.getByLabel('Generated JSX')).toHaveText(
    '<Button variant="outline" size="lg">Get started</Button>',
  )
})

test('command palette searches and navigates with the keyboard', async ({ page }) => {
  await page.goto('/docs/introduction')
  await page.keyboard.press('Control+k')
  const input = page.getByRole('combobox', { name: 'Search' })
  await expect(input).toBeFocused()
  await input.fill('tabs')
  await expect(page.getByRole('option').first()).toContainText('Tabs')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/docs\/components\/tabs$/)
})

test('color mode toggle switches themes and persists', async ({ page }) => {
  await page.goto('/docs/introduction')
  const html = page.locator('html')
  await page.getByRole('button', { name: /^Color mode/ }).click()
  await page.getByRole('button', { name: /^Color mode: light/ }).click()
  await expect(html).toHaveClass(/t_dark/)
  await page.reload()
  await expect(html).toHaveClass(/t_dark/)
})

test('theme customizer restyles the whole site live', async ({ page }) => {
  await page.goto('/docs/components/card')
  const before = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--primary'),
  )
  await page.getByRole('button', { name: 'Customize theme' }).click()
  const panel = page.getByRole('dialog', { name: 'Customize' })
  await panel.getByRole('radio', { name: 'Emerald' }).click()
  await panel.getByRole('radio', { name: 'Large' }).first().click()
  await expect
    .poll(() =>
      page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary')),
    )
    .not.toBe(before)
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--t-radius-lg').trim(),
      ),
    )
    .toBe('12px')
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
})

test('registry JSON is published for the CLI', async ({ request }) => {
  const index = await (await request.get('/r/index.json')).json()
  expect(index.items.map((item: { name: string }) => item.name)).toContain('button')
  const button = await (await request.get('/r/button.json')).json()
  expect(button.registryDependencies).toContain('spinner')
  expect(button.files[0].content).toContain('export const Button')
})

for (const path of [
  '/',
  '/docs/introduction',
  '/docs/components/button',
  '/docs/components/dialog',
  '/examples/login',
]) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(serious.map((v) => `${v.id}: ${v.nodes.length} node(s) — ${v.help}`)).toEqual([])
  })
}

test('no serious accessibility violations in dark mode', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('aui-color-mode', 'dark'))
  for (const path of ['/docs/components/button', '/docs/components/card', '/examples/dashboard']) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('html')).toHaveClass(/t_dark/)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(serious.map((v) => `${path} ${v.id}: ${v.nodes.length} node(s)`)).toEqual([])
  }
})
