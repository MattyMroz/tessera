import { expect, test, type Locator, type Page } from '@playwright/test'
import { box, clearRecorded, failures, hydrated, recordAnimations, recorded, startTrace } from './helpers'

declare global {
  interface Window {
    tooltipFrames?: TooltipFrame[]
    tooltipOpening?: { entered?: number; opened?: number }
  }
}

type ShownTip = { readonly text: string; readonly x: number; readonly y: number }
type TooltipFrame = { readonly tips: readonly ShownTip[] }

const PAGE = '/components'
const OVERLAYS = '/screens/overlays'
const SETTLE = 600
const GAP_PAUSE = 20
const STILL = 1000
const JITTER_STEPS = 10
const OUTSIDE_X = 4
const SCROLL = 120
const PIXEL = 0.5
const OPEN_DELAY = 400
const AT_ONCE = 100
const ONE_FLIGHT: readonly { properties: readonly string[] }[] = [{ properties: ['transform'] }]

async function flights(page: Page): Promise<{ properties: readonly string[] }[]> {
  return (await recorded(page))
    .filter((animation) => animation.variant === 'tooltip')
    .map(({ properties }) => ({ properties }))
}

async function recordTooltips(page: Page): Promise<void> {
  await page.evaluate(() => {
    const frames: TooltipFrame[] = []
    window.tooltipFrames = frames
    const shown = (popup: HTMLElement): boolean => {
      const positioner = popup.parentElement
      if (!positioner || !popup.hasAttribute('data-open') || popup.hasAttribute('data-closed')) return false
      return [popup, positioner].every((element) => {
        const style = getComputedStyle(element)
        return style.visibility === 'visible' && Number(style.opacity) > 0
      })
    }
    const tick = (): void => {
      if (window.tooltipFrames !== frames) return
      const tips = [...document.querySelectorAll<HTMLElement>('[data-variant="tooltip"]')].filter(shown).map((popup) => {
        const { x, y } = popup.getBoundingClientRect()
        return { text: popup.textContent, x, y }
      })
      frames.push({ tips })
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

function tooltipFrames(page: Page): Promise<TooltipFrame[]> {
  return page.evaluate(() => window.tooltipFrames ?? [])
}

function centre(rect: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

async function moveOffTriggers(page: Page, x: number, y: number): Promise<void> {
  const trigger = await page.evaluate(
    ([left, top]) => document.elementFromPoint(left, top)?.closest('[data-base-ui-tooltip-trigger]')?.outerHTML ?? null,
    [x, y] as const,
  )
  expect(trigger).toBeNull()
  await page.mouse.move(x, y)
}

async function openingTime(page: Page, trigger: Locator, text: string): Promise<number> {
  await trigger.evaluate((element, label) => {
    const opening: { entered?: number; opened?: number } = {}
    window.tooltipOpening = opening
    element.addEventListener('pointerenter', () => (opening.entered ??= performance.now()), { once: true })
    const observer = new MutationObserver(() => {
      const open = [...document.querySelectorAll('[data-variant="tooltip"][data-open]')].some((popup) => popup.textContent === label)
      if (!open || opening.entered === undefined) return
      opening.opened = performance.now()
      observer.disconnect()
    })
    observer.observe(document.body, { subtree: true, childList: true, attributes: true })
  }, text)
  const { x, y } = centre(await box(trigger))
  await page.mouse.move(x, y)
  await expect(page.locator('[data-variant="tooltip"][data-open]', { hasText: text })).toHaveCount(1)
  return page.evaluate(() => (window.tooltipOpening?.opened ?? Number.NaN) - (window.tooltipOpening?.entered ?? Number.NaN))
}

async function shownAgainAfterClosing(page: Page): Promise<number> {
  const frames = await tooltipFrames(page)
  const closed = frames.findIndex((frame) => frame.tips.length === 0)
  expect(closed).toBeGreaterThanOrEqual(0)
  return frames.slice(closed).filter((frame) => frame.tips.length > 0).length
}

const GAPS = [
  { path: PAGE, from: 'Pan', to: 'Draw bubble' },
  { path: PAGE, from: 'Undo', to: 'Redo' },
  { path: OVERLAYS, from: 'Pan', to: 'Draw bubble' },
] as const

test.beforeEach(async ({ page }) => {
  await page.addInitScript(recordAnimations)
  await page.goto(PAGE)
  await hydrated(page)
})

for (const { path, from, to } of GAPS) {
  test(`keeps a tooltip shown in every frame while the pointer crosses the gap from ${from} to ${to} on ${path}`, async ({ page }) => {
    if (path !== PAGE) {
      await page.goto(path)
      await hydrated(page)
    }
    const source = page.getByRole('button', { name: from, exact: true }).first()
    const target = page.getByRole('button', { name: to, exact: true }).first()
    await source.hover()
    const popup = page.locator('[data-variant="tooltip"]')
    await expect(popup).toHaveText(from)
    const left = await box(source)
    const right = await box(target)
    const y = centre(left).y
    const gap = right.x - (left.x + left.width)
    expect(gap).toBeGreaterThan(1)
    await clearRecorded(page)
    await recordTooltips(page)
    await page.mouse.move(left.x + left.width - 1, y)
    for (const share of [1 / 3, 2 / 3]) {
      await page.mouse.move(left.x + left.width + gap * share, y)
      await page.waitForTimeout(GAP_PAUSE)
    }
    await page.mouse.move(right.x + 1, y)
    await page.mouse.move(centre(right).x, y)
    await expect(popup.filter({ hasText: to })).toBeVisible()
    await page.waitForTimeout(SETTLE)

    const frames = await tooltipFrames(page)
    expect(frames.filter((frame) => frame.tips.length === 0)).toEqual([])
    expect(frames.at(-1)?.tips.map((tip) => tip.text)).toEqual([to])
    expect((await flights(page)).every((flight) => flight.properties.every((property) => property === 'transform'))).toBe(true)
  })
}

test('closes the tooltip of a bar when the pointer leaves the bar through a gap', async ({ page }) => {
  await page.getByRole('button', { name: 'Pan' }).hover()
  const popup = page.locator('[data-variant="tooltip"]')
  await expect(popup).toHaveText('Pan')
  const pan = await box(page.getByRole('button', { name: 'Pan' }))
  const draw = await box(page.getByRole('button', { name: 'Draw bubble' }))
  const gap = (pan.x + pan.width + draw.x) / 2
  await page.mouse.move(gap, centre(pan).y)
  await moveOffTriggers(page, gap, pan.y - pan.height / 2)
  await expect(popup).toHaveCount(0)
})

for (const name of ['Pan', 'Save']) {
  test(`keeps the tooltip of ${name} closed after a click until the pointer leaves and comes back`, async ({ page }) => {
    const trigger = page.getByRole('region', { name: 'Tooltip', exact: true }).getByRole('button', { name, exact: true })
    await trigger.hover()
    const popup = page.locator('[data-variant="tooltip"]')
    await expect(popup).toHaveCount(1)
    const { x, y } = centre(await box(trigger))
    await recordTooltips(page)
    await page.mouse.down()
    await page.mouse.up()
    for (let step = 0; step < JITTER_STEPS; step += 1) {
      await page.waitForTimeout(STILL / JITTER_STEPS)
      await page.mouse.move(x + (step % 2), y)
    }
    expect(await shownAgainAfterClosing(page)).toBe(0)

    await moveOffTriggers(page, OUTSIDE_X, y)
    await expect(popup).toHaveCount(0)
    await page.mouse.move(x, y)
    await expect(popup).toHaveCount(1)
  })
}

test('opens the first tooltip the open delay after the pointer enters its trigger', async ({ page }) => {
  const save = page.getByRole('region', { name: 'Tooltip', exact: true }).getByRole('button', { name: 'Save', exact: true })
  await save.scrollIntoViewIfNeeded()
  await moveOffTriggers(page, OUTSIDE_X, centre(await box(save)).y)
  const time = await openingTime(page, save, 'Saves the chapter')
  expect(time).toBeGreaterThanOrEqual(OPEN_DELAY - AT_ONCE / 2)
  expect(time).toBeLessThan(OPEN_DELAY + AT_ONCE)
})

test('opens the tooltip of a neighbour in a bar at once right after a click', async ({ page }) => {
  const pan = page.getByRole('button', { name: 'Pan' })
  await pan.hover()
  await expect(page.locator('[data-variant="tooltip"]')).toHaveText('Pan')
  await page.mouse.down()
  await page.mouse.up()
  expect(await openingTime(page, page.getByRole('button', { name: 'Draw bubble' }), 'Draw bubble')).toBeLessThan(AT_ONCE)
})

for (const scroll of ['wheel', 'scrollBy'] as const) {
  test(`opens a tooltip of a bar on its place right after the page scrolls by ${scroll}`, async ({ page }) => {
    const pan = page.getByRole('button', { name: 'Pan' })
    await pan.scrollIntoViewIfNeeded()
    await page.evaluate((by) => window.scrollBy(0, -by), SCROLL)
    await pan.hover()
    const popup = page.locator('[data-variant="tooltip"]')
    await expect(popup).toHaveText('Pan')
    const before = centre(await box(pan))
    await moveOffTriggers(page, OUTSIDE_X, before.y)
    await expect(popup).toHaveCount(0)
    if (scroll === 'wheel') await page.mouse.wheel(0, SCROLL)
    else await page.evaluate((by) => window.scrollBy(0, by), SCROLL)
    await expect.poll(async () => centre(await box(pan)).y).toBeCloseTo(before.y - SCROLL, 0)
    await clearRecorded(page)
    await recordTooltips(page)
    await pan.hover()
    await expect(popup).toHaveText('Pan')
    await page.waitForTimeout(SETTLE)

    const placed = await box(popup)
    const first = (await tooltipFrames(page)).find((frame) => frame.tips.length > 0)?.tips[0]
    expect(Math.abs((first?.x ?? Number.NaN) - placed.x)).toBeLessThanOrEqual(PIXEL)
    expect(Math.abs((first?.y ?? Number.NaN) - placed.y)).toBeLessThanOrEqual(PIXEL)
    expect(await flights(page)).toEqual([])
  })
}

test('keeps a tooltip of a bar on its trigger while the page scrolls and flies on to the next trigger from where it is seen', async ({ page }) => {
  const pan: Locator = page.getByRole('button', { name: 'Pan' })
  await pan.scrollIntoViewIfNeeded()
  await pan.focus()
  const popup = page.locator('[data-variant="tooltip"]')
  await expect(popup).toHaveText('Pan')
  const offset = async (): Promise<{ x: number; y: number }> => {
    const [tip, trigger] = [await box(popup), await box(pan)]
    return { x: tip.x - trigger.x, y: tip.y - trigger.y }
  }
  const attached = await offset()
  await clearRecorded(page)
  await page.evaluate((by) => window.scrollBy(0, by), SCROLL)
  await page.waitForTimeout(SETTLE)
  expect(await offset()).toEqual(attached)
  expect(await flights(page)).toEqual([])

  const seen = await box(popup)
  await recordTooltips(page)
  await page.keyboard.press('Tab')
  await expect(popup).toHaveText('Draw bubble')
  await page.waitForTimeout(SETTLE)
  const first = (await tooltipFrames(page)).find((frame) => frame.tips.some((tip) => tip.text === 'Draw bubble'))?.tips[0]
  expect(Math.abs((first?.y ?? Number.NaN) - seen.y)).toBeLessThanOrEqual(PIXEL)
  expect(await flights(page)).toEqual(ONE_FLIGHT)
})

test('flies one tooltip popup of a bar between triggers only by transform', async ({ page, browserName }) => {
  const select = page.getByRole('button', { name: 'Select' })
  const pan = page.getByRole('button', { name: 'Pan' })
  await select.hover()
  const popup = page.locator('[data-variant="tooltip"]')
  await expect(popup).toHaveText('Select')
  const before = await popup.elementHandle()

  await clearRecorded(page)
  const trace = browserName === 'chromium' ? await startTrace(page) : undefined
  const start = await box(popup)
  await pan.hover()
  await expect(popup).toHaveText('Pan')
  const positioner = await popup.evaluate((element) => element.parentElement?.getAnimations().length ?? -1)
  await page.waitForTimeout(SETTLE)
  const events = (await trace?.stop()) ?? []

  expect(await popup.evaluate((element, previous) => element === previous, before)).toBe(true)
  expect(await flights(page)).toEqual(ONE_FLIGHT)
  expect(positioner).toBe(0)
  expect((await box(popup)).x).not.toBeCloseTo(start.x, 0)
  if (browserName === 'chromium') expect(failures(events)).toEqual([])
})

test('opens a lone tooltip in place next to another lone tooltip, also one held open by the keyboard focus', async ({ page }) => {
  const popup = page.locator('[data-variant="tooltip"]')
  await page.getByRole('button', { name: 'Undo' }).hover()
  await expect(popup).toHaveText('Undo')
  await clearRecorded(page)
  await page.getByRole('button', { name: 'Redo' }).hover()
  await expect(popup.filter({ hasText: 'Redo' })).toBeVisible()
  await page.waitForTimeout(SETTLE)
  expect(await flights(page)).toEqual([])

  await page.mouse.move(0, 0)
  await expect(popup).toHaveCount(0)
  await page.waitForTimeout(SETTLE)
  await page.getByRole('region', { name: 'Tooltip', exact: true }).getByRole('button', { name: 'Save' }).focus()
  await expect(popup).toHaveText('Saves the chapter')
  await clearRecorded(page)
  await page.getByRole('button', { name: 'Paste' }).hover()
  await expect(popup.filter({ hasText: 'Paste the copied bubble' })).toBeVisible()
  await page.waitForTimeout(SETTLE)
  expect(await flights(page)).toEqual([])
})
