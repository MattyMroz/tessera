import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, clearRecorded, colorOf, failures, hover, offCompositor, recordAnimations, recorded, row, startTrace, visit } from './helpers'

declare global {
  interface Window {
    submenuOpenedAfter?: Promise<number>
    parentPillChanges?: number
  }
}

const COMPONENTS = '/components'
const EDGES = '/screens/edges'
const OVERLAYS = '/screens/overlays'
const TOLERANCE = 0.5
const INSTANT_SUBMENU = 50
const WIDE = 1280
const NARROW = 1040
const NARROW_WINDOW = 400
const TALL_WINDOW = 800
const SCROLL_STEP = 12
const SETTLE = 300
const OUTSIDE = 80
const MOVE_STEPS = 4
const EDGE = 8
const DIAGONAL_STEPS = 16

async function openMenu(page: Page): Promise<Locator> {
  await page.addInitScript(recordAnimations)
  await visit(page, COMPONENTS)
  const section = page.getByRole('region', { name: 'Menu', exact: true })
  await section.getByRole('button', { name: 'Project', exact: true }).click()
  const menu = page.getByRole('menu').first()
  await expect(menu).toBeVisible()
  return menu
}

function pill(menu: Locator): Locator {
  return menu.locator(':scope > [data-recipe="indicator"]')
}

async function distance(menu: Locator, target: Locator): Promise<number> {
  const [from, to] = await Promise.all([pill(menu).boundingBox(), target.boundingBox()])
  if (!from || !to) return Number.POSITIVE_INFINITY
  return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y), Math.abs(from.width - to.width), Math.abs(from.height - to.height))
}

async function expectPillOn(menu: Locator, target: Locator): Promise<void> {
  await expect(pill(menu)).toHaveAttribute('data-visible', 'true')
  await expect.poll(() => distance(menu, target)).toBeLessThanOrEqual(TOLERANCE)
}

async function expectPillHidden(menu: Locator): Promise<void> {
  await expect(pill(menu)).toHaveAttribute('data-visible', 'false')
  await expect.poll(() => pill(menu).evaluate((element) => getComputedStyle(element).opacity)).toBe('0')
}

async function leaveMenu(page: Page, menu: Locator, from: Locator): Promise<void> {
  const { x, width } = await box(menu)
  const { y, height } = await box(from)
  await page.mouse.move(x + width + OUTSIDE, y + height / 2, { steps: MOVE_STEPS })
}

async function enterSubmenu(page: Page, trigger: Locator): Promise<Locator> {
  const submenu = page.getByRole('menu').nth(1)
  await expect(submenu).toBeVisible()
  await submenu.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => undefined))))
  const [from, to] = await Promise.all([box(trigger), box(submenu)])
  const y = from.y + from.height / 2
  expect(y).toBeGreaterThan(to.y + EDGE)
  expect(y).toBeLessThan(to.y + to.height - EDGE)
  await page.mouse.move(to.x + EDGE, y, { steps: MOVE_STEPS })
  return submenu
}

async function pauseLoops(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      if (animation.effect?.getComputedTiming().iterations === Number.POSITIVE_INFINITY) animation.pause()
    }
  })
}

async function offset(popup: Locator, trigger: Locator): Promise<{ x: number; y: number }> {
  const [from, to] = await Promise.all([box(popup), box(trigger)])
  return { x: from.x - to.x, y: from.y - to.y }
}

test('keeps the pill on the last row over a separator, a group label and a disabled row', async ({ page }) => {
  const menu = await openMenu(page)
  const last = row(menu, 'Show reading order')
  await hover(page, last)
  await expectPillOn(menu, last)
  await hover(page, menu.getByRole('separator').nth(1))
  await expectPillOn(menu, last)
  const first = row(menu, 'Show bubbles')
  await hover(page, first)
  await hover(page, menu.getByText('View', { exact: true }))
  await expectPillOn(menu, first)
  const open = row(menu, 'Open')
  await hover(page, open)
  await expectPillOn(menu, open)
  await hover(page, row(menu, 'Revert'))
  await expectPillOn(menu, open)
})

test('keeps the pill on the last row when the arrows reach a disabled row', async ({ page }) => {
  await visit(page, COMPONENTS)
  await page.getByRole('region', { name: 'Menu', exact: true }).getByRole('button', { name: 'Project', exact: true }).focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu').first()
  await expect(row(menu, 'New chapter')).toBeFocused()
  await page.keyboard.press('ArrowDown')
  const open = row(menu, 'Open')
  await expect(open).toBeFocused()
  await expectPillOn(menu, open)
  await page.keyboard.press('ArrowDown')
  await expect(row(menu, 'Revert')).toBeFocused()
  await page.waitForTimeout(SETTLE)
  await expectPillOn(menu, open)
})

test('hides the pill when the pointer leaves the menu or the window loses focus and shows it on the next hovered row', async ({ page }) => {
  const menu = await openMenu(page)
  const open = row(menu, 'Open')
  await hover(page, open)
  await expectPillOn(menu, open)
  await leaveMenu(page, menu, open)
  await expectPillHidden(menu)
  const target = row(menu, 'Delete project')
  await hover(page, target)
  await expectPillOn(menu, target)
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expectPillHidden(menu)
  await hover(page, open)
  await expectPillOn(menu, open)
})

test('starts the arrows at the first row after the pointer leaves the menu', async ({ page }) => {
  const menu = await openMenu(page)
  const open = row(menu, 'Open')
  await hover(page, open)
  await expectPillOn(menu, open)
  await leaveMenu(page, menu, open)
  await expectPillHidden(menu)
  await page.keyboard.press('ArrowDown')
  const first = row(menu, 'New chapter')
  await expect(first).toBeFocused()
  await expectPillOn(menu, first)
})

test('shows no pill in a freshly opened menu until a row is hovered or an arrow is pressed', async ({ page }) => {
  const menu = await openMenu(page)
  await page.waitForTimeout(SETTLE)
  await expect(pill(menu)).toHaveAttribute('data-visible', 'false')
  await hover(page, row(menu, 'Open'))
  await expectPillOn(menu, row(menu, 'Open'))
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
  await page.getByRole('region', { name: 'Menu', exact: true }).getByRole('button', { name: 'Project', exact: true }).click()
  const reopened = page.getByRole('menu').first()
  await expect(reopened).toBeVisible()
  await page.waitForTimeout(SETTLE)
  await expect(pill(reopened)).toHaveAttribute('data-visible', 'false')
  await page.keyboard.press('ArrowDown')
  await expectPillOn(reopened, row(reopened, 'New chapter'))
})

test('moves on with the arrows from the row under the pill', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Base UI does not highlight a hovered row in headless WebKit')
  const menu = await openMenu(page)
  await hover(page, row(menu, 'New chapter'))
  await page.keyboard.press('ArrowDown')
  const open = row(menu, 'Open')
  await expect(open).toBeFocused()
  await expectPillOn(menu, open)
})

test('keeps the parent pill on the submenu trigger while the pointer crosses other rows on its way into the submenu', async ({ page }) => {
  await page.setViewportSize({ width: WIDE, height: TALL_WINDOW })
  const menu = await openMenu(page)
  const exportRow = row(menu, 'Export')
  await hover(page, exportRow)
  const submenu = page.getByRole('menu').nth(1)
  await expect(submenu).toBeVisible()
  await expectPillOn(menu, exportRow)
  await pill(menu).evaluate((element) => {
    window.parentPillChanges = 0
    new MutationObserver((records) => (window.parentPillChanges = (window.parentPillChanges ?? 0) + records.length)).observe(element, {
      attributes: true,
    })
  })
  const from = await box(exportRow)
  const goal = row(submenu, 'Chapter as CBZ')
  const to = await box(goal)
  const crossed = [row(menu, 'Share'), row(menu, 'Delete project')]
  const path = { from: { x: from.x + EDGE, y: from.y + from.height / 2 }, to: { x: to.x + EDGE, y: to.y + to.height / 2 } }
  for (const passed of crossed) {
    const { y: top, height } = await box(passed)
    const along = (top + height / 2 - path.from.y) / (path.to.y - path.from.y)
    expect(along).toBeGreaterThan(0)
    expect(along).toBeLessThan(1)
    expect(path.from.x + along * (path.to.x - path.from.x)).toBeLessThan(from.x + from.width)
  }
  await pauseLoops(page)
  await page.mouse.move(path.from.x, path.from.y)
  await page.mouse.move(path.to.x, path.to.y, { steps: DIAGONAL_STEPS })
  await expect(page.getByRole('menu')).toHaveCount(2)
  await expectPillOn(submenu, goal)
  await expectPillOn(menu, exportRow)
  expect(await page.evaluate(() => window.parentPillChanges)).toBe(0)
})

test('opens a submenu at once and keeps the pill on its trigger', async ({ page }) => {
  const menu = await openMenu(page)
  await hover(page, row(menu, 'Show reading order'))
  const exportRow = row(menu, 'Export')
  await exportRow.evaluate((trigger) => {
    window.submenuOpenedAfter = new Promise((resolve) => {
      let start: number | undefined
      trigger.addEventListener('pointerover', () => (start ??= performance.now()))
      new MutationObserver((_, observer) => {
        if (start === undefined || document.querySelectorAll('[role="menu"]').length < 2) return
        observer.disconnect()
        resolve(performance.now() - start)
      }).observe(document.body, { childList: true, subtree: true })
    })
  })
  await hover(page, exportRow)
  expect(await page.evaluate(() => window.submenuOpenedAfter)).toBeLessThan(INSTANT_SUBMENU)
  const submenu = await enterSubmenu(page, exportRow)
  const png = row(submenu, 'Pages as PNG')
  await hover(page, png)
  await expectPillOn(submenu, png)
  await expectPillOn(menu, exportRow)
})

test('keeps the parent pill on the submenu trigger while the pointer is in the submenu', async ({ page }) => {
  const menu = await openMenu(page)
  const exportRow = row(menu, 'Export')
  await hover(page, exportRow)
  const submenu = await enterSubmenu(page, exportRow)
  const png = row(submenu, 'Pages as PNG')
  await hover(page, png)
  await page.waitForTimeout(SETTLE)
  await expectPillOn(submenu, png)
  await expectPillOn(menu, exportRow)
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expectPillHidden(submenu)
  await expectPillOn(menu, exportRow)
})

test('flies the submenu from its sibling on transform only', async ({ page }) => {
  const menu = await openMenu(page)
  await hover(page, row(menu, 'Export'))
  await expect(page.getByRole('menu')).toHaveCount(2)
  await clearRecorded(page)
  await hover(page, row(menu, 'Share'))
  await expect(row(page.getByRole('menu').nth(1), 'Invite people')).toBeVisible()
  const flights = (await recorded(page)).filter((animation) => animation.role === 'menu')
  expect(flights.length).toBeGreaterThan(0)
  expect(flights.flatMap((animation) => animation.properties)).toContain('transform')
  expect(offCompositor(flights)).toEqual([])
})

test('opens a menu of the trigger width at least as wide as its trigger', async ({ page }) => {
  await visit(page, COMPONENTS)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  const trigger = page.getByRole('complementary', { name: 'Theme' }).getByRole('button', { name: /^accent / })
  await trigger.click()
  const menu = page.getByRole('menu')
  await expect(menu).toHaveAttribute('data-width', 'trigger')
  await expect.poll(() => menu.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0)
  await expect.poll(() => trigger.evaluate((element) => element.getAnimations().length)).toBe(0)
  const [popup, anchor] = await Promise.all([box(menu), box(trigger)])
  expect(popup.width).toBeGreaterThanOrEqual(anchor.width - TOLERANCE)
})

test('opens a menu without locking the scroll of the page or touching the style of the body', async ({ page }) => {
  await visit(page, COMPONENTS)
  const before = await page.evaluate(() => ({ style: document.body.getAttribute('style'), overflow: getComputedStyle(document.body).overflow }))
  await page.getByRole('region', { name: 'Menu', exact: true }).getByRole('button', { name: 'Project', exact: true }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  const open = await page.evaluate(() => ({ style: document.body.getAttribute('style'), overflow: getComputedStyle(document.body).overflow }))
  expect(open).toEqual(before)
})

test('keeps the parent pill on the trigger of a submenu that opens with defaultOpen', async ({ page }) => {
  await visit(page, EDGES)
  await page.getByRole('button', { name: 'Mount a menu with an open submenu', exact: true }).click()
  const menus = page.getByRole('menu')
  await expect(menus).toHaveCount(2)
  await expect(menus.nth(1)).toBeVisible()
  await expectPillOn(menus.first(), row(menus.first(), 'Export'))
})

test('takes the side gap off the width of a submenu beside its menu in a narrow window', async ({ page }) => {
  await page.setViewportSize({ width: NARROW_WINDOW, height: TALL_WINDOW })
  const menu = await openMenu(page)
  await hover(page, row(menu, 'Export'))
  const submenu = page.getByRole('menu').nth(1)
  await expect(submenu).toBeVisible()
  await expect(submenu).toHaveAttribute('data-side', 'inline-end')
  const room = await submenu.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      max: Number.parseFloat(style.maxInlineSize),
      available: Number.parseFloat(style.getPropertyValue('--available-width')),
      gap: Number.parseFloat(style.getPropertyValue('--ts-space-inset')),
      window: document.documentElement.clientWidth,
    }
  })
  expect(room.gap).toBeGreaterThan(0)
  expect(room.available).toBeLessThan(room.window)
  expect(Math.abs(room.max - (room.available - room.gap))).toBeLessThanOrEqual(TOLERANCE)
  const { x, width } = await box(submenu)
  expect(x + width).toBeLessThanOrEqual(room.window + TOLERANCE)
})

test('wraps every icon of a row in the icon slot, keeps the slot of an unchecked item and draws the chevron in it', async ({ page }) => {
  const menu = await openMenu(page)
  const slot = (name: string): Locator => row(menu, name).locator(':scope > [data-slot="icon"]')
  await expect(slot('Delete project').locator(':scope > svg')).toHaveCount(1)
  await expect(slot('Show bubbles').locator(':scope > svg')).toHaveCount(1)
  await expect(slot('Show reading order').locator('svg')).toHaveCount(0)
  const [checked, unchecked] = await Promise.all([box(slot('Show bubbles')), box(slot('Show reading order'))])
  expect(unchecked.width).toBeGreaterThan(0)
  expect(Math.abs(unchecked.width - checked.width)).toBeLessThanOrEqual(TOLERANCE)
  await expect(row(menu, 'Export').locator(':scope > [data-slot="trail"] > [data-slot="icon"] > svg')).toHaveCount(1)
  await expect(menu.locator('svg[data-slot]')).toHaveCount(0)
})

test('marks an item with a tone and colours its text with the role of the tone', async ({ page }) => {
  const menu = await openMenu(page)
  const toned = row(menu, 'Delete project')
  const plain = row(menu, 'Open')
  await expect(toned).toHaveAttribute('data-tone', 'danger')
  await expect(plain).not.toHaveAttribute('data-tone')
  const [danger, label] = await Promise.all([toned, plain].map((target) => target.evaluate((element) => getComputedStyle(element).color)))
  expect({ danger, label }).toEqual({ danger: await colorOf(page, 'var(--ts-color-danger)'), label: await colorOf(page, 'var(--ts-color-label)') })
})

test('keeps the menu open when a checkbox item is clicked', async ({ page }) => {
  const menu = await openMenu(page)
  const item = row(menu, 'Show reading order')
  await hover(page, item)
  await item.click()
  await expect(item).toHaveAttribute('aria-checked', 'true')
  await expect(menu).toBeVisible()
})

test('slides the pill on the compositor', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'the trace comes from the Chrome DevTools protocol')
  const menu = await openMenu(page)
  const trace = await startTrace(page)
  const last = row(menu, 'Open')
  for (const name of ['New chapter', 'Show bubbles', 'Export', 'Delete project']) await hover(page, row(menu, name))
  await hover(page, last)
  await expectPillOn(menu, last)
  const events = await trace.stop()
  const slides = (await recorded(page)).filter((animation) => animation.recipe === 'indicator')
  expect(slides.length).toBeGreaterThan(0)
  expect(offCompositor(slides)).toEqual([])
  expect(events.filter((event) => event.name === 'Animation').length).toBeGreaterThan(0)
  expect(failures(events)).toEqual([])
})

test('walks a menu with the arrows and opens its submenu with ArrowRight', async ({ page }) => {
  await visit(page, OVERLAYS)
  await page.getByRole('region', { name: 'Island', exact: true }).getByRole('button', { name: 'Project', exact: true }).focus()
  await page.keyboard.press('Enter')
  const menus = page.getByRole('menu')
  await expect(row(menus, 'Open')).toBeFocused()
  for (let step = 0; step < 3; step += 1) await page.keyboard.press('ArrowDown')
  const exportRow = row(menus, 'Export')
  await expect(exportRow).toBeFocused()
  await expect.poll(async () => Math.abs((await box(pill(menus))).y - (await box(exportRow)).y)).toBeLessThan(TOLERANCE)
  await page.keyboard.press('ArrowRight')
  await expect(menus).toHaveCount(2)
  await expect(row(menus.nth(1), 'Pages as WebP')).toBeFocused()
})

test('keeps an open submenu on its trigger while the dialog scrolls and the window resizes', async ({ page }) => {
  await page.addInitScript(recordAnimations)
  await visit(page, OVERLAYS)
  await page.getByRole('region', { name: 'Card', exact: true }).getByRole('button', { name: 'Chapter settings' }).click()
  const dialog = page.getByRole('dialog', { name: 'Chapter settings' })
  await expect(dialog).toBeVisible()
  const height = await dialog.evaluate((element) => element.scrollHeight)
  await page.setViewportSize({ width: WIDE, height })
  await expect.poll(() => dialog.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)

  await dialog.getByRole('button', { name: 'Project', exact: true }).focus()
  await page.keyboard.press('Enter')
  const menus = page.getByRole('menu')
  await expect(row(menus, 'Open')).toBeFocused()
  for (let step = 0; step < 3; step += 1) await page.keyboard.press('ArrowDown')
  const exportRow = row(menus, 'Export')
  await expect(exportRow).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(menus).toHaveCount(2)
  const submenu = menus.nth(1)
  await expect(row(submenu, 'Pages as WebP')).toBeFocused()
  await expect.poll(() => submenu.evaluate((element) => element.getAnimations().length)).toBe(0)
  const resting = await offset(submenu, exportRow)
  const triggerBefore = await box(exportRow)
  await clearRecorded(page)

  const scrolled = await dialog.evaluate((element, step) => {
    const before = element.scrollTop
    element.scrollTop = before > step ? before - step : before + step
    return element.scrollTop - before
  }, SCROLL_STEP)
  expect(Math.abs(scrolled)).toBeGreaterThan(0)
  await expect.poll(async () => Math.abs((await box(exportRow)).y - triggerBefore.y)).toBeGreaterThan(TOLERANCE)
  await expect.poll(async () => Math.abs((await offset(submenu, exportRow)).y - resting.y)).toBeLessThan(TOLERANCE)

  await page.setViewportSize({ width: NARROW, height })
  await expect.poll(async () => Math.abs((await box(exportRow)).x - triggerBefore.x)).toBeGreaterThan(TOLERANCE)
  await expect(menus).toHaveCount(2)
  await expect.poll(async () => Math.abs((await offset(submenu, exportRow)).x - resting.x)).toBeLessThan(TOLERANCE)
  expect((await offset(submenu, exportRow)).y).toBeCloseTo(resting.y, 0)

  expect((await recorded(page)).filter((animation) => animation.role === 'menu')).toEqual([])
})
