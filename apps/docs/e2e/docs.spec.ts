import { appExamples } from '@advui/examples/meta'
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

test('customizer switches the site to Material 3', async ({ page }) => {
  await page.goto('/docs/components/button')
  await page.getByRole('button', { name: 'Customize theme' }).click()
  const panel = page.getByRole('dialog', { name: 'Customize' })
  await panel.getByRole('radio', { name: 'Material 3' }).click()
  const cssVar = (name: string) =>
    page.evaluate(
      (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
      name,
    )
  // Material baseline seed → tonal-spot primary; pill buttons from the shape scale.
  await expect.poll(() => cssVar('--primary')).toBe('#65558f')
  await expect.poll(() => cssVar('--t-radius-button')).toBe('9999px')
  await expect(panel.getByLabel('Seed color', { exact: true })).toBeVisible()
  await expect(panel.getByText('Preset', { exact: true })).toBeHidden()
  await panel.getByRole('radio', { name: 'Adv UI' }).click()
  await expect.poll(() => cssVar('--t-radius-button')).not.toBe('9999px')
})

// The desktop frame has no fixed height, so a screen that sizes itself with
// flex={1} collapses and is clipped (it happened to the login example).
test('app examples are not clipped in the desktop frame', async ({ page }) => {
  for (const { slug } of appExamples) {
    await page.goto(`/examples/${slug}`)
    await page.getByRole('button', { name: 'Desktop' }).click()
    const frame = page.getByTestId('example-frame')
    await expect(frame).toBeVisible()
    const size = await frame.evaluate((el) => ({
      scroll: el.scrollHeight,
      client: el.clientHeight,
    }))
    expect(size.client, `${slug} frame height`).toBeGreaterThan(200)
    expect(size.scroll, `${slug} content is clipped`).toBeLessThanOrEqual(size.client + 1)
  }
})

test('registry JSON is published for the CLI', async ({ request }) => {
  const index = await (await request.get('/r/index.json')).json()
  expect(index.items.map((item: { name: string }) => item.name)).toContain('button')
  const button = await (await request.get('/r/button.json')).json()
  expect(button.registryDependencies).toContain('spinner')
  expect(button.files[0].content).toContain('export const Button')
})

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.length} node(s) — ${v.help}`)
}

for (const path of [
  '/',
  '/docs/introduction',
  '/docs/components/button',
  '/docs/components/dialog',
  '/docs/components/accordion',
  '/docs/components/slider',
  '/docs/components/popover',
  '/docs/components/dropdown-menu',
  '/docs/components/alert-dialog',
  '/docs/components/sheet',
  '/docs/components/toggle',
  '/docs/components/toggle-group',
  '/docs/components/breadcrumb',
  '/docs/components/fab',
  '/docs/components/chip',
  '/docs/components/snackbar',
  '/docs/components/navigation-bar',
  '/docs/components/button-group',
  '/docs/components/collapsible',
  '/docs/components/circular-progress',
  '/docs/components/aspect-ratio',
  '/docs/components/scroll-area',
  '/docs/components/menu',
  '/docs/components/context-menu',
  '/docs/components/drawer',
  '/docs/components/hover-card',
  '/docs/components/form-field',
  '/docs/components/password-input',
  '/docs/components/number-input',
  '/docs/components/empty-state',
  '/docs/components/error-state',
  '/examples/login',
]) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    expect(await seriousViolations(page)).toEqual([])
  })
}

// Overlays are only in the DOM while open, so check them open, with real focus handling.
test('popover opens as a named dialog and returns focus on Escape', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/popover')
  await page.waitForLoadState('networkidle')
  const trigger = page.getByRole('button', { name: 'Dimensions' }).first()
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Dimensions' })
  await expect(dialog).toBeVisible()
  expect(await seriousViolations(page)).toEqual([])
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  expect(errors).toEqual([])
})

test('dropdown menu is keyboard operable', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/dropdown-menu')
  await page.waitForLoadState('networkidle')
  const trigger = page.getByRole('button', { name: 'My account' }).first()
  await trigger.focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  // Focus moves into the menu: to the first item, or to the menu itself when the
  // browser reports pointer movement while it opens (Radix heuristic). Arrow
  // keys, Home and End work from either.
  await expect.poll(() => menu.evaluate((el) => el.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Home')
  await expect(menu.getByRole('menuitem', { name: 'Profile' })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(menu.getByRole('menuitem', { name: 'Billing' })).toBeFocused()
  expect(await seriousViolations(page)).toEqual([])
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()
  expect(errors).toEqual([])
})

test('alert dialog starts on Cancel and returns focus on Escape', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/alert-dialog')
  await page.waitForLoadState('networkidle')
  const trigger = page.getByRole('button', { name: 'Delete project' }).first()
  await trigger.click()
  const dialog = page.getByRole('alertdialog', { name: 'Delete “Atlas”?' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  expect(await seriousViolations(page)).toEqual([])
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  expect(errors).toEqual([])
})

test('sheet is hidden until opened, traps focus and returns it on Escape', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/sheet')
  await page.waitForLoadState('networkidle')
  // Closed sheets stay mounted off-screen; they must not reach the accessibility tree.
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const trigger = page.getByRole('button', { name: 'Edit profile' }).first()
  await trigger.click()
  const sheet = page.getByRole('dialog', { name: 'Edit profile' })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole('textbox').first()).toBeFocused()
  expect(await seriousViolations(page)).toEqual([])
  // Shift+Tab from the first field wraps to the last control inside the sheet.
  await page.keyboard.press('Shift+Tab')
  await expect.poll(() => sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(trigger).toBeFocused()
  expect(errors).toEqual([])
})

test('context menu opens at the pointer and closes with Escape', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/context-menu')
  await page.waitForLoadState('networkidle')
  await page.getByText('Right-click here').first().click({ button: 'right' })
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitemcheckbox', { name: 'Show bookmarks' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  expect(await seriousViolations(page)).toEqual([])
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  expect(errors).toEqual([])
})

test('drawer traps focus and returns it on Escape', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/drawer')
  await page.waitForLoadState('networkidle')
  const trigger = page.getByRole('button', { name: 'Open navigation' }).first()
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Acme Inc.' })
  await expect(drawer).toBeVisible()
  // Focus lands on the selected page in the drawer's Menu.
  await expect(drawer.getByRole('menuitem', { name: 'Home' })).toBeFocused()
  expect(await seriousViolations(page)).toEqual([])
  await page.keyboard.press('Shift+Tab')
  await expect.poll(() => drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()
  expect(errors).toEqual([])
})

test('hover card opens on hover and keyboard focus, and describes the link', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/hover-card')
  await page.waitForLoadState('networkidle')
  const link = page.getByRole('link', { name: '@ada' }).first()
  await link.hover()
  const card = page.getByRole('tooltip')
  await expect(card).toBeVisible()
  await expect(link).toHaveAccessibleDescription(/Ada Lovelace/)
  expect(await seriousViolations(page)).toEqual([])
  await page.mouse.move(0, 0)
  await expect(card).toBeHidden()
  await link.focus()
  await expect(card).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(card).toBeHidden()
  await expect(link).toBeFocused()
  expect(errors).toEqual([])
})

test('menu is one Tab stop and arrow keys move between items', async ({ page }) => {
  await page.goto('/docs/components/menu')
  await page.waitForLoadState('networkidle')
  const menu = page.getByRole('menu', { name: 'Mailboxes' }).first()
  const inbox = menu.getByRole('menuitem', { name: /Inbox/ })
  await expect(inbox).toHaveAttribute('aria-current', 'true')
  await expect(inbox).toHaveAttribute('tabindex', '-1')
  await menu.focus()
  await expect(inbox).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(menu.getByRole('menuitem', { name: 'Starred' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(menu.getByRole('menuitem', { name: 'Starred' })).toHaveAttribute(
    'aria-current',
    'true',
  )
})

test('toggle group is one Tab stop and arrow keys choose', async ({ page }) => {
  await page.goto('/docs/components/toggle-group')
  await page.waitForLoadState('networkidle')
  const group = page.getByRole('radiogroup', { name: 'Text alignment' }).first()
  const left = group.getByRole('radio', { name: 'Align left' })
  const center = group.getByRole('radio', { name: 'Align center' })
  await expect(left).toHaveAttribute('aria-checked', 'true')
  await expect(center).toHaveAttribute('tabindex', '-1')
  await left.focus()
  await page.keyboard.press('ArrowRight')
  await expect(center).toBeFocused()
  await expect(center).toHaveAttribute('aria-checked', 'true')
  await expect(center).toHaveAttribute('tabindex', '0')
})

test('snackbar announces politely and its action works from the keyboard', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/snackbar')
  await page.waitForLoadState('networkidle')
  // The live region is in the page before any message, so it gets announced.
  const regions = page.getByRole('status')
  await expect(regions.first()).toHaveAttribute('aria-live', 'polite')
  await page.getByRole('button', { name: 'Go offline' }).first().click()
  const message = page.getByText(/offline. Changes will sync/).first()
  await expect(message).toBeVisible()
  expect(await seriousViolations(page)).toEqual([])
  const retry = page.getByRole('button', { name: 'Retry' })
  await retry.focus()
  await page.keyboard.press('Enter')
  await expect(message).toBeHidden()
  expect(errors).toEqual([])
})

test('collapsible opens from the keyboard and passes axe while open', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/collapsible')
  await page.waitForLoadState('networkidle')
  const trigger = page.getByRole('button', { name: 'Advanced options' }).first()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  const content = page.locator(`[id="${await trigger.getAttribute('aria-controls')}"]`)
  await expect(content).toBeHidden()
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(content.getByLabel('URL slug')).toBeVisible()
  expect(await seriousViolations(page)).toEqual([])
  expect(errors).toEqual([])
})

test('scroll area scrolls from the keyboard', async ({ page }) => {
  await page.goto('/docs/components/scroll-area')
  await page.waitForLoadState('networkidle')
  const region = page.getByRole('region', { name: 'Release tags' }).first()
  await region.focus()
  await expect(region).toBeFocused()
  await page.keyboard.press('PageDown')
  await expect.poll(() => region.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)
})

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
