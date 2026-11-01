import { expect, test, type Page } from '@playwright/test'
import { box, clearRecorded, failures, hydrated, recordAnimations, recorded, startTrace } from './helpers'

const PAGE = '/components'
const SETTLE = 600
const ONE_FLIGHT: readonly { properties: readonly string[] }[] = [{ properties: ['transform'] }]

async function flights(page: Page): Promise<{ properties: readonly string[] }[]> {
  return (await recorded(page))
    .filter((animation) => animation.variant === 'tooltip')
    .map(({ properties }) => ({ properties }))
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(recordAnimations)
  await page.goto(PAGE)
  await hydrated(page)
})

test('flies a reopened tooltip of a bar after the pointer crosses the gap between triggers', async ({ page }) => {
  await page.getByRole('button', { name: 'Pan' }).hover()
  const popup = page.locator('[data-variant="tooltip"]')
  await expect(popup).toHaveText('Pan')
  const draw = await box(page.getByRole('button', { name: 'Draw bubble' }))
  await clearRecorded(page)
  await page.mouse.move(draw.x + draw.width / 2, draw.y + draw.height / 2, { steps: 12 })
  await expect(popup.filter({ hasText: 'Draw bubble' })).toBeVisible()
  await expect.poll(async () => (await flights(page)).length).toBeGreaterThan(0)
  expect((await flights(page)).every((flight) => flight.properties.every((property) => property === 'transform'))).toBe(true)
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
