import { expect, gridCells, test } from './fixtures'

test('sidebar becomes a drawer on phones', async ({ page }) => {
  await page.goto('/docs/components/button')
  await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeHidden()
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const drawer = page.getByRole('dialog', { name: 'Navigation' })
  await expect(drawer).toBeVisible()
  await drawer.getByRole('link', { name: /^Checkbox/ }).click()
  await expect(page).toHaveURL(/\/docs\/components\/checkbox$/)
  await expect(drawer).toBeHidden()
})

test('pages do not overflow horizontally on a phone', async ({ page }) => {
  for (const path of ['/', '/docs/components/select', '/examples/mobile-home']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, path).toBeLessThanOrEqual(1)
  }
})

test('grid stacks an 8 / 4 layout below md', async ({ page }) => {
  await page.goto('/preview/grid/two-column-8-4')
  const [main, side] = await gridCells(page, ['Sprint progress', 'Details'])
  expect(side!.y).toBeGreaterThan(main!.y)
  expect(side!.x).toBeCloseTo(main!.x, 0)
  expect(side!.width).toBeCloseTo(main!.width, 0)
})
