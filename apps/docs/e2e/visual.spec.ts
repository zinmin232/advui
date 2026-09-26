import { expect, test } from './fixtures'

// Visual regression for every documented example, in light and dark mode.
// Baselines live next to this file; refresh with `pnpm --filter @advui/docs test:visual:update`.
for (const mode of ['light', 'dark'] as const) {
  test(`component examples — ${mode}`, async ({ page }) => {
    await page.addInitScript((m) => window.localStorage.setItem('aui-color-mode', m), mode)
    await page.goto('/visual')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('html')).toHaveClass(new RegExp(`t_${mode}`))
    // Photos are placeholders (see fixtures.ts); hide them so baselines only cover our UI.
    await page.addStyleTag({ content: 'img { visibility: hidden !important }' })
    const items = page.locator('[data-visual]')
    const count = await items.count()
    expect(count).toBeGreaterThan(40)
    for (let i = 0; i < count; i++) {
      const item = items.nth(i)
      const name = await item.getAttribute('data-visual')
      await expect(item).toHaveScreenshot(`${mode}--${name}.png`)
    }
  })
}
