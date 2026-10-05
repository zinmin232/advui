import { components } from '@advui/catalog'
import { appExamples } from '@advui/examples/meta'
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { autoGridCells, expect, gridCells, test } from './fixtures'

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

test('component pages install the package the component ships in', async ({ page }) => {
  await page.goto('/docs/components/data-table')
  await expect(page.getByLabel('Package: @advui/data')).toBeVisible()
  await page.getByRole('tab', { name: 'Package' }).click()
  await expect(page.getByText('pnpm add @advui/data')).toBeVisible()
  // The sidebar groups the components of each feature package under its name.
  const nav = page.getByRole('navigation', { name: 'Documentation' })
  for (const name of ['@advui/data', '@advui/charts', '@advui/editor'])
    await expect(nav.getByText(name, { exact: true })).toBeVisible()
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

// Examples hard-code element ids, so a page must render each example once: a
// second copy duplicates the ids and every label then names its field twice.
for (const { slug } of components) {
  test(`no duplicate element ids on /docs/components/${slug}`, async ({ page }) => {
    await page.goto(`/docs/components/${slug}`)
    await page.waitForLoadState('networkidle')
    const duplicates = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((el) => el.id)
      return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))]
    })
    expect(duplicates).toEqual([])
  })
}

test('example fields are named by their label once', async ({ page }) => {
  await page.goto('/docs/components/label')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('#full-name')).toHaveAccessibleName('Full name')
})

test('playground updates the preview and generated JSX', async ({ page }) => {
  await page.goto('/docs/components/button')
  await page.getByRole('radio', { name: 'outline' }).click()
  await page.getByRole('radio', { name: 'lg' }).click()
  await expect(page.getByLabel('Generated JSX')).toHaveText(
    '<Button variant="outline" size="lg">Get started</Button>',
  )
})

test('every playground renders its component, Data ones included', async ({ page }) => {
  for (const { slug } of components.filter((c) => c.playground)) {
    await page.goto(`/docs/components/${slug}`)
    await expect(page.getByLabel('Generated JSX'), slug).toBeVisible()
    await expect(page.getByText(/^Unknown component/), slug).toHaveCount(0)
  }
  // List and Table need rows to show anything.
  await page.goto('/playground?component=List')
  await expect(page.getByRole('listitem')).toHaveCount(3)
  await page.goto('/playground?component=Table')
  await expect(page.getByRole('table', { name: 'Recent invoices' }).getByRole('row')).toHaveCount(4)
})

// The list floats in a portal that ignores the pointer; the options must not.
test('combobox fields open on a click and pick options with the mouse', async ({ page }) => {
  await page.goto('/docs/components/combobox')
  const zone = page.getByRole('combobox', { name: 'Time zone' })
  await zone.click()
  await expect(zone).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('option', { name: /^Bangkok/ }).click()
  await expect(zone).toHaveValue('Bangkok')
  await expect(zone).toHaveAttribute('aria-expanded', 'false')

  await page.goto('/docs/components/multi-select')
  const labels = page.getByRole('combobox', { name: 'Labels' })
  await labels.click()
  await page.getByRole('option', { name: 'Feature' }).click()
  await expect(page.getByRole('button', { name: 'Remove Feature' })).toBeVisible()
  await expect(labels).toHaveAttribute('aria-expanded', 'true')
})

test('grid splits 8 / 4 from md', async ({ page }) => {
  await page.goto('/preview/grid/two-column-8-4')
  const [main, side] = await gridCells(page, ['Sprint progress', 'Details'])
  expect(side!.y).toBeCloseTo(main!.y, 0)
  expect(main!.width).toBeCloseTo(2 * side!.width, 0)
  expect(side!.x).toBeCloseTo(main!.x + main!.width, 0)
})

test('auto grid fits as many columns as the width allows, up to maxColumns', async ({ page }) => {
  await page.goto('/preview/auto-grid/card-gallery')
  const cells = await autoGridCells(page, ['Atlas', 'Beacon', 'Compass', 'Delta', 'Echo'])
  // Desktop Chrome is 1280 wide: room for 5 cells of 220px, capped at 4.
  expect(new Set(cells.slice(0, 4).map((cell) => Math.round(cell.y))).size).toBe(1)
  expect(cells[4]!.y).toBeGreaterThan(cells[0]!.y)
  expect(cells[4]!.x).toBeCloseTo(cells[0]!.x, 0)
  expect(cells[4]!.width).toBeCloseTo(cells[0]!.width, 0)
})

test('app shell keeps the sidebar beside Main at desktop widths', async ({ page }) => {
  await page.goto('/preview/app-shell/docs')
  await expect(page.getByRole('navigation', { name: 'Docs' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeHidden()
})

test('video example shows its captions from another origin', async ({ page }) => {
  await page.goto('/preview/video/basic')
  const video = page.locator('video')
  // Without crossOrigin the browser would refuse the cross-origin caption file.
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.textTracks[0]?.cues?.length ?? 0))
    .toBe(7)
  const track = await video.evaluate((v: HTMLVideoElement) => ({
    mode: v.textTracks[0]!.mode,
    first: (v.textTracks[0]!.cues![1] as VTTCue).text,
  }))
  expect(track).toEqual({
    mode: 'showing',
    first: 'Step 1: Wet your hands with clean, running water.',
  })
})

test('form playground disables the fields and Save, but not Cancel', async ({ page }) => {
  await page.goto('/docs/components/form')
  await page.getByLabel('disabled', { exact: true }).click()
  await expect(page.getByLabel('Generated JSX')).toContainText('disabled')
  const preview = page.locator('form').first()
  await expect(preview.getByRole('textbox', { name: 'Name' })).toBeDisabled()
  await expect(preview.getByRole('button', { name: 'Save' })).toBeDisabled()
  await expect(preview.getByRole('button', { name: 'Cancel' })).toBeEnabled()
})

test('grid playground changes the column count', async ({ page }) => {
  await page.goto('/docs/components/grid')
  await page.getByLabel('columns', { exact: true }).fill('3')
  await expect(page.getByLabel('Generated JSX')).toContainText('<Grid columns={3}>')
  const [full, two, one, ...rest] = await gridCells(page, [
    'span full',
    'span 2',
    '1',
    '2',
    '3',
    '4',
  ])
  // Rows: the full item, then "span 2" with "1", then "2", "3" and "4".
  expect(two!.y).toBeGreaterThan(full!.y)
  expect(one!.y).toBeCloseTo(two!.y, 0)
  expect(two!.width).toBeCloseTo(2 * one!.width, 0)
  expect(full!.width).toBeCloseTo(3 * one!.width, 0)
  for (const cell of rest) {
    expect(cell.y).toBeGreaterThan(one!.y)
    expect(cell.y).toBeCloseTo(rest[0]!.y, 0)
    expect(cell.width).toBeCloseTo(one!.width, 0)
  }
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
  '/docs/components/field',
  '/docs/components/password-input',
  '/docs/components/number-input',
  '/docs/components/empty-state',
  '/docs/components/error-state',
  '/docs/components/otp-input',
  '/docs/components/calendar',
  '/docs/components/date-picker',
  '/docs/components/date-range-picker',
  '/docs/components/time-picker',
  '/docs/components/combobox',
  '/docs/components/autocomplete',
  '/docs/components/multi-select',
  '/docs/components/file-upload',
  '/docs/components/file-dropzone',
  '/docs/components/stat',
  '/docs/components/kpi-card',
  '/docs/components/list',
  '/docs/components/timeline',
  '/docs/components/image',
  '/docs/components/table',
  '/docs/components/pagination',
  '/docs/components/stepper',
  '/docs/components/data-table',
  '/docs/components/tree-view',
  '/docs/components/navigation-menu',
  '/docs/components/sidebar',
  '/docs/components/search',
  '/docs/components/command-palette',
  '/docs/components/image-gallery',
  '/docs/components/bar-chart',
  '/docs/components/line-chart',
  '/docs/components/area-chart',
  '/docs/components/pie-chart',
  '/docs/components/resizable-panel',
  '/docs/components/data-grid',
  '/docs/components/video',
  '/docs/components/audio-player',
  '/docs/components/rich-text-editor',
  '/docs/components/loading-button',
  '/docs/components/form',
  '/docs/components/grid',
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

test('date picker opens, moves by keyboard, picks and passes axe while open', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/date-picker')
  await page.waitForLoadState('networkidle')
  const trigger = page.getByRole('button', { name: 'Due date' }).first()
  await trigger.focus()
  await page.keyboard.press('Enter')
  const grid = page.getByRole('grid', { name: 'October 2026' })
  await expect(grid).toBeVisible()
  expect(await seriousViolations(page)).toEqual([])
  // Tab reaches the picked day; arrows move to the 15th, Enter picks it.
  await grid.getByRole('gridcell', { name: /October 14, 2026/ }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(grid.getByRole('gridcell', { name: /October 15, 2026/ })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(grid).toBeHidden()
  await expect(trigger).toContainText('Oct 15, 2026')
  expect(errors).toEqual([])
})

test('combobox filters, picks by keyboard and passes axe while open', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('/docs/components/combobox')
  await page.waitForLoadState('networkidle')
  const input = page.getByRole('combobox', { name: 'Time zone' }).first()
  await input.fill('')
  await input.pressSequentially('o')
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  // The list floats against the field: below it, or above when there is no room.
  const field = (await input.boundingBox())!
  const list = (await listbox.boundingBox())!
  const gap = Math.min(
    Math.abs(list.y - (field.y + field.height)),
    Math.abs(field.y - (list.y + list.height)),
  )
  expect(gap).toBeLessThan(20)
  expect(await seriousViolations(page)).toEqual([])
  await page.keyboard.press('ArrowDown')
  const active = await input.getAttribute('aria-activedescendant')
  await expect(page.locator(`[id="${active}"]`)).toHaveText(/Bangkok/)
  await page.keyboard.press('Enter')
  await expect(listbox).toBeHidden()
  await expect(input).toHaveValue('Bangkok')
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
