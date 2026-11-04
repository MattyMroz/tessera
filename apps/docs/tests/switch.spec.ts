import { expect, test, type Locator, type Page } from '@playwright/test'
import { visit } from './helpers'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const TOLERANCE = 0.5
const STRETCH = 1.25
const FRAME_SAMPLES = 30
const FRAME_MS = 16

function track(page: Page, name: string): Locator {
  return page.getByRole('region', { name: 'Switch', exact: true }).getByRole('switch', { name, exact: true })
}

function geometry(target: Locator) {
  return target.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const squash = element.querySelector('[data-slot="squash"]')
    const bars = [...element.querySelectorAll('[data-slot="bar"]')].map((bar) => bar.getBoundingClientRect().width)
    const cap = squash?.getBoundingClientRect()
    if (!cap || bars.length !== 2) throw new Error('no thumb')
    const [towardsEnd = 0, towardsStart = 0] = bars
    const left = cap.left - towardsStart
    const right = cap.right + towardsEnd
    return { width: rect.width, height: rect.height, start: left - rect.left, end: rect.right - right, top: cap.top - rect.top, bottom: rect.bottom - cap.bottom, thumb: right - left }
  })
}

function thumbPath(page: Page, target: Locator): Promise<number[]> {
  return target.evaluate(async (element, { samples, frame }) => {
    const ride = element.querySelector('[data-recipe="indicator"]')
    if (!ride) throw new Error('no thumb')
    const xs: number[] = []
    for (let index = 0; index < samples; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, frame))
      xs.push(new DOMMatrix(getComputedStyle(ride).transform).m41)
    }
    return xs
  }, { samples: FRAME_SAMPLES, frame: FRAME_MS })
}

test.beforeEach(async ({ page }) => {
  await visit(page, '/components')
})

test('centres the thumb on whole pixels with one inset on every side at every size', async ({ page }) => {
  for (const size of SIZES) {
    for (const state of ['off', 'on'] as const) {
      const seen = await geometry(track(page, `${size} ${state}`))
      const inset = state === 'off' ? seen.start : seen.end
      expect(Number.isInteger(Math.round(inset * 1000) / 1000), `${size} ${state} inset ${inset}`).toBe(true)
      expect(Math.abs(seen.top - inset), `${size} ${state} top`).toBeLessThanOrEqual(TOLERANCE)
      expect(Math.abs(seen.bottom - inset), `${size} ${state} bottom`).toBeLessThanOrEqual(TOLERANCE)
      expect(Math.abs(seen.width - seen.height - seen.thumb), `${size} width = track + thumb`).toBeLessThanOrEqual(TOLERANCE)
    }
  }
})

test('never scales the track and stretches only the thumb towards the middle on a press', async ({ page }) => {
  for (const state of ['off', 'on'] as const) {
    const target = track(page, `lg ${state}`)
    await target.scrollIntoViewIfNeeded()
    const rest = await geometry(target)
    const rect = await target.boundingBox()
    if (!rect) throw new Error('no track')
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
    await page.mouse.down()
    await expect(target).toHaveAttribute('data-pressing', '')
    await page.waitForTimeout(400)
    const pressed = await geometry(target)
    expect(await target.evaluate((element) => getComputedStyle(element).scale), state).toBe('none')
    expect(Math.abs(pressed.thumb - rest.thumb * STRETCH), `${state} stretched`).toBeLessThanOrEqual(TOLERANCE)
    if (state === 'off') expect(Math.abs(pressed.start - rest.start), 'off keeps its start').toBeLessThanOrEqual(TOLERANCE)
    else expect(Math.abs(pressed.end - rest.end), 'on keeps its end').toBeLessThanOrEqual(TOLERANCE)
    await page.mouse.move(0, 0)
    await page.mouse.up()
    await page.waitForTimeout(500)
  }
})

test('rides the thumb the same overshoot both ways and settles on its place', async ({ page }) => {
  const target = track(page, 'lg off')
  await target.scrollIntoViewIfNeeded()
  const on = thumbPath(page, target)
  await target.click()
  const forth = await on
  const back = thumbPath(page, target)
  await target.click()
  const home = await back
  const final = { forth: forth.at(-1) ?? 0, back: home.at(-1) ?? 0 }
  const over = Math.max(...forth) - final.forth
  const under = final.back - Math.min(...home)
  expect(over).toBeGreaterThan(0)
  expect(Math.abs(over - under)).toBeLessThanOrEqual(TOLERANCE)
  expect(Math.abs(final.back - (forth[0] ?? Number.NaN))).toBeLessThanOrEqual(TOLERANCE)
})

test('sets a label beside the track at the label gap, centred on it, and presses and toggles the track from a click on the label', async ({ page }) => {
  for (const size of SIZES) {
    const target = page.getByTestId(`switch-labels-${size}`).getByRole('switch', { name: 'Bluetooth', exact: true })
    const label = page.getByTestId(`switch-labels-${size}`).getByText('Bluetooth', { exact: true })
    await target.scrollIntoViewIfNeeded()
    const box = await target.boundingBox()
    const text = await label.boundingBox()
    if (!box || !text) throw new Error('no label')
    const gap = await target.evaluate((element) => Number.parseFloat(getComputedStyle(element.parentElement ?? element).columnGap))
    expect(Math.abs(text.x - (box.x + box.width) - gap), `${size} gap`).toBeLessThanOrEqual(TOLERANCE)
    expect(Math.abs(text.y + text.height / 2 - (box.y + box.height / 2)), `${size} centred`).toBeLessThanOrEqual(TOLERANCE)
  }
  const group = page.getByTestId('switch-labels-lg')
  const target = group.getByRole('switch', { name: 'Bluetooth', exact: true })
  const text = await group.getByText('Bluetooth', { exact: true }).boundingBox()
  if (!text) throw new Error('no label')
  await page.mouse.move(text.x + text.width / 2, text.y + text.height / 2)
  await page.mouse.down()
  await expect(target).toHaveAttribute('data-pressing', '')
  await page.mouse.up()
  await expect(target).toHaveAttribute('aria-checked', 'true')
  const off = group.getByRole('switch', { name: 'Airplane mode', exact: true })
  const dim = await off.evaluate((element) => [getComputedStyle(element).opacity, getComputedStyle(element.closest('label')?.querySelector('[data-variant="label"]') ?? element).opacity])
  const [trackOpacity, labelOpacity] = dim
  expect(labelOpacity, 'disabled label dims with its track').toBe(trackOpacity)
})
