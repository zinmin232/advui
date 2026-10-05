import { appExamples } from '@advui/examples/meta'
import { autoGridCells, expect, gridCells, test } from './fixtures'

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

test('app shell moves its sidebar into a drawer on phones', async ({ page }) => {
  await page.goto('/preview/app-shell/dashboard')
  const sidebar = page.getByRole('navigation', { name: 'Main' })
  await expect(sidebar).toBeHidden()
  const trigger = page.getByRole('button', { name: 'Open navigation' })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Main' })
  await expect(drawer).toBeVisible()
  await drawer.getByRole('link', { name: /^Reports/ }).click()
  await expect(drawer).toBeHidden()
  // The preview page is a <main> too; the shell's own is inside it.
  await expect(page.locator('main main').getByText('Reports', { exact: true })).toBeVisible()

  // Keyboard: Enter opens it, Escape closes it and focus goes back to the trigger.
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(drawer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()

  // A drawer left open closes once the window is past the breakpoint.
  await trigger.click()
  await expect(drawer).toBeVisible()
  await page.setViewportSize({ width: 1024, height: 800 })
  await expect(drawer).toBeHidden()
  await expect(sidebar).toBeVisible()
  await expect(trigger).toBeHidden()
})

test('auto grid is one column on a phone', async ({ page }) => {
  await page.goto('/preview/auto-grid/card-gallery')
  const [atlas, beacon] = await autoGridCells(page, ['Atlas', 'Beacon'])
  expect(beacon!.y).toBeGreaterThan(atlas!.y)
  expect(beacon!.x).toBeCloseTo(atlas!.x, 0)
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

// flex={1} sets a 0px basis, so a box that only shares a row on wide screens
// collapses in the phone column: the playground drew its preview under the
// props, and the product example was clipped to a sliver.
test('playground stacks the preview, JSX and props on a phone', async ({ page }) => {
  for (const path of ['/docs/components/badge', '/playground?component=Avatar']) {
    await page.goto(path)
    const jsx = (await page.getByLabel('Generated JSX').boundingBox())!
    const props = (await page.getByRole('group', { name: 'Props' }).boundingBox())!
    expect(props.y, path).toBeGreaterThanOrEqual(jsx.y + jsx.height)
  }
})

test('app examples fit a phone', async ({ page }) => {
  for (const { slug } of appExamples) {
    await page.goto(`/examples/${slug}`)
    await page.getByRole('button', { name: 'Desktop' }).click()
    const frame = page.getByTestId('example-frame')
    const size = await frame.evaluate((el) => ({
      scroll: el.scrollHeight,
      client: el.clientHeight,
    }))
    expect(size.client, `${slug} frame height`).toBeGreaterThan(200)
    expect(size.scroll, `${slug} content is clipped`).toBeLessThanOrEqual(size.client + 1)
    // The long description wraps instead of widening the page.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, slug).toBeLessThanOrEqual(1)
  }
})

test('grid stacks an 8 / 4 layout below md', async ({ page }) => {
  await page.goto('/preview/grid/two-column-8-4')
  const [main, side] = await gridCells(page, ['Sprint progress', 'Details'])
  expect(side!.y).toBeGreaterThan(main!.y)
  expect(side!.x).toBeCloseTo(main!.x, 0)
  expect(side!.width).toBeCloseTo(main!.width, 0)
})
