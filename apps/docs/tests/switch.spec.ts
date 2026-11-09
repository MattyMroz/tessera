import { expect, test, type Locator, type Page } from '@playwright/test'
import { choose, visit } from './helpers'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const TOLERANCE = 0.5
const STRETCH = 1.25
const FRAME_SAMPLES = 30
const FRAME_MS = 16
const THUMB_SHARE = 0.75
const SHARE_TOLERANCE = 0.001
const LAYOUT_TOLERANCE = 0.01
const PAINT_TOLERANCE = 1
const ZOOMS = [0.5, 0.67, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 2] as const
const VIEWPORT = { width: 1280, height: 800 }
const PLATE_MARGIN = 1
const COVERED = 0.5

type Box = { readonly x: number; readonly y: number; readonly width: number; readonly height: number }

async function paintedOffset(page: Page, target: Locator, box: Box, state: 'off' | 'on', zoom: number): Promise<{ x: number; y: number }> {
  const ride = target.locator('[data-recipe="indicator"]')
  const shot = await page.screenshot({ animations: 'disabled' })
  await ride.evaluate((element) => element.style.setProperty('visibility', 'hidden'))
  const bare = await page.screenshot({ animations: 'disabled' })
  await ride.evaluate((element) => element.style.removeProperty('visibility'))
  return page.evaluate(
    async ({ shots, box, state, zoom, margin, HALF }) => {
      const read = async (data: string) => {
        const image = new Image()
        image.src = `data:image/png;base64,${data}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')
        if (!context) throw new Error('no canvas')
        context.drawImage(image, 0, 0)
        const { data: channels, width } = context.getImageData(0, 0, image.width, image.height)
        return (x: number, y: number) => {
          const at = (y * width + x) * 4
          return 0.2126 * (channels[at] ?? 0) + 0.7152 * (channels[at + 1] ?? 0) + 0.0722 * (channels[at + 2] ?? 0)
        }
      }
      const [light, plate] = await Promise.all(shots.map(read))
      if (!light || !plate) throw new Error('no shot')
      const height = box.height * zoom
      const left = box.x * zoom
      const top = box.y * zoom
      const right = (box.x + box.width) * zoom
      const bottom = (box.y + box.height) * zoom
      const column = Math.floor(state === 'on' ? right - height / 2 : left + height / 2)
      const row = Math.floor((top + bottom) / 2)
      const page = plate(column, Math.floor(top) - margin)
      const trackLight = plate(Math.floor((left + right) / 2), row)
      const thumbLight = light(column, row)
      const share = (value: number, from: number, to: number) => (to === from ? 0 : (value - from) / (to - from))
      const gapAt = (x: number, y: number) =>
        share(plate(x, y), page, trackLight) >= HALF && share(light(x, y), plate(x, y), thumbLight) < HALF ? 1 : 0
      const sum = (from: number, to: number, at: (step: number) => number) => {
        let total = 0
        for (let step = from; step <= to; step += 1) total += at(step)
        return total
      }
      const above = sum(Math.floor(top), row, (y) => gapAt(column, y))
      const below = sum(row + 1, Math.ceil(bottom) - 1, (y) => gapAt(column, y))
      const end = state === 'on' ? sum(column + 1, Math.ceil(right) - 1, (x) => gapAt(x, row)) : sum(Math.floor(left), column, (x) => gapAt(x, row))
      return { x: end - (above + below) / 2, y: (below - above) / 2 }
    },
    { shots: [shot.toString('base64'), bare.toString('base64')], box, state, zoom, margin: PLATE_MARGIN, HALF: COVERED },
  )
}

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

test('keeps the thumb three quarters of the track with one inset on every side at every size', async ({ page }) => {
  for (const size of SIZES) {
    for (const state of ['off', 'on'] as const) {
      const seen = await geometry(track(page, `${size} ${state}`))
      const inset = state === 'off' ? seen.start : seen.end
      expect(Math.abs(seen.thumb / seen.height - THUMB_SHARE), `${size} ${state} thumb ${seen.thumb} of ${seen.height}`).toBeLessThanOrEqual(SHARE_TOLERANCE)
      expect(Math.abs(seen.top - inset), `${size} ${state} top`).toBeLessThanOrEqual(LAYOUT_TOLERANCE)
      expect(Math.abs(seen.bottom - inset), `${size} ${state} bottom`).toBeLessThanOrEqual(LAYOUT_TOLERANCE)
      expect(Math.abs(seen.width - seen.height - seen.thumb), `${size} width = track + thumb`).toBeLessThanOrEqual(LAYOUT_TOLERANCE)
    }
  }
})

test('paints the thumb in the middle of its end of the track at every browser zoom', async ({ browser }) => {
  test.slow()
  const misses: string[] = []
  for (const zoom of ZOOMS) {
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: zoom })
    const page = await context.newPage()
    await visit(page, '/components')
    await page.mouse.move(0, 0)
    for (const size of SIZES) {
      for (const state of ['off', 'on'] as const) {
        const target = track(page, `${size} ${state}`)
        await target.scrollIntoViewIfNeeded()
        const box = await target.boundingBox()
        if (!box) throw new Error('no track')
        const offset = await paintedOffset(page, target, box, state, zoom)
        if (Math.hypot(offset.x, offset.y) > PAINT_TOLERANCE) misses.push(`${zoom}x ${size} ${state}: ${offset.x.toFixed(2)}, ${offset.y.toFixed(2)}`)
      }
    }
    await context.close()
  }
  expect(misses).toEqual([])
})

test('shows the thumb on its place before any script runs', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/components')
  for (const size of SIZES) {
    for (const state of ['off', 'on'] as const) {
      const target = track(page, `${size} ${state}`)
      const opacity = await target.evaluate((element) => getComputedStyle(element.querySelector('[data-recipe="indicator"]') ?? element).opacity)
      expect(opacity, `${size} ${state} visible`).toBe('1')
      const seen = await geometry(target)
      const inset = state === 'off' ? seen.start : seen.end
      expect(Math.abs(seen.thumb / seen.height - THUMB_SHARE), `${size} ${state} thumb`).toBeLessThanOrEqual(SHARE_TOLERANCE)
      expect(Math.abs(seen.top - inset), `${size} ${state} top`).toBeLessThanOrEqual(LAYOUT_TOLERANCE)
      expect(Math.abs(seen.bottom - inset), `${size} ${state} bottom`).toBeLessThanOrEqual(LAYOUT_TOLERANCE)
    }
  }
  await context.close()
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

test('keeps the thumb its own shape on a press with the motion off', async ({ page }) => {
  await choose(page, 'motion', 'off')
  for (const state of ['off', 'on'] as const) {
    const target = track(page, `lg ${state}`)
    await target.scrollIntoViewIfNeeded()
    const rest = await geometry(target)
    const rect = await target.boundingBox()
    if (!rect) throw new Error('no track')
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
    await page.mouse.down()
    await expect(target).toHaveAttribute('data-pressing', '')
    const pressed = await geometry(target)
    expect(Math.abs(pressed.thumb - rest.thumb), `${state} not stretched`).toBeLessThanOrEqual(TOLERANCE)
    await page.mouse.move(0, 0)
    await page.mouse.up()
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
