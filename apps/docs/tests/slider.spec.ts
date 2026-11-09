import { expect, test, type Locator, type Page } from '@playwright/test'
import { clearRenders, hydrated, installCommitProbe, settle, visit } from './helpers'

const PAGE = '/components'
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const TOLERANCE = 0.5
const STILL = 0.01
const STEP_TOLERANCE = 1.5
const DRAG = 40
const NEAR = 6
const FAR = 300
const BAND_SHARE = 2 / 7
const FROZEN_GRIP = "[data-slot='grip'] { transition: none !important; scale: none !important; background: gray !important; }"

type Parts = {
  readonly track: { readonly left: number; readonly right: number; readonly width: number; readonly height: number }
  readonly lane: { readonly left: number; readonly width: number }
  readonly cap: { readonly left: number; readonly right: number; readonly width: number; readonly height: number }
  readonly bar: { readonly right: number }
  readonly grip: number
  readonly middle: number
}

function slider(page: Page, id: string): Locator {
  return page.getByTestId(id).getByRole('slider')
}

function parts(control: Locator): Promise<Parts> {
  return control.evaluate((element) => {
    const rect = (selector: string): DOMRect => {
      const part = selector === '' ? element : element.querySelector(selector)
      if (!part) throw new Error(`no ${selector}`)
      return part.getBoundingClientRect()
    }
    const track = rect('')
    const lane = rect("[data-slot='lane']")
    const cap = rect("[data-slot='ride']")
    const bar = rect("[data-slot='bar']")
    const grip = rect("[data-slot='grip']")
    return {
      track: { left: track.left, right: track.right, width: track.width, height: track.height },
      lane: { left: lane.left, width: lane.width },
      cap: { left: cap.left, right: cap.right, width: cap.width, height: cap.height },
      bar: { right: bar.right },
      grip: grip.left + grip.width / 2,
      middle: track.top + track.height / 2,
    }
  })
}

function valueOf(control: Locator): Promise<number> {
  return control.evaluate((element) => Number(element.getAttribute('aria-valuenow')))
}

test.beforeEach(async ({ page }) => {
  await visit(page, PAGE)
  await page.getByRole('region', { name: 'Slider', exact: true }).scrollIntoViewIfNeeded()
})

test('names a slider, tells its range and value and keeps a disabled one out of the tab order', async ({ page }) => {
  const opacity = slider(page, 'slider-opacity')
  await expect(opacity).toHaveAccessibleName('Opacity')
  await expect(opacity).toHaveAttribute('aria-valuemin', '0')
  await expect(opacity).toHaveAttribute('aria-valuemax', '100')
  await expect(opacity).toHaveAttribute('aria-valuenow', '40')
  await expect(opacity).toHaveAttribute('aria-valuetext', '40%')
  await expect(opacity).toHaveAttribute('tabindex', '0')
  const disabled = page.getByRole('slider', { name: 'Disabled', exact: true })
  await expect(disabled).toHaveAttribute('aria-disabled', 'true')
  await expect(disabled).toHaveAttribute('tabindex', '-1')
  const before = await parts(disabled)
  await page.mouse.click(before.track.left + before.track.width / 4, before.middle)
  await settle(page)
  expect(Math.abs((await parts(disabled)).grip - before.grip)).toBeLessThan(STILL)
  await expect(disabled).toHaveAttribute('aria-valuenow', '60')
})

test('ends the pill at the value in every size and joins the bar to the middle of its end', async ({ page }) => {
  for (const size of SIZES) {
    const { lane, cap, bar } = await parts(slider(page, `slider-size-${size}`))
    expect(Math.abs(cap.right - (lane.left + lane.width / 2)), `${size}: end of the pill`).toBeLessThan(TOLERANCE)
    expect(Math.abs(bar.right - (cap.left + cap.width / 2)), `${size}: seam`).toBeLessThan(TOLERANCE)
    expect(Math.abs(cap.width - cap.height), `${size}: end as wide as the pill is high`).toBeLessThan(TOLERANCE)
  }
})

test('keeps every pixel of a slider on a press of the end of the pill and on a held pointer that wobbles across', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'pixel equality of a press is measured in Chromium')
  await page.addStyleTag({ content: FROZEN_GRIP })
  for (const id of ['slider-opacity', 'slider-effort', 'slider-weight']) {
    const control = slider(page, id)
    const { grip, middle, track } = await parts(control)
    const clip = { x: Math.floor(track.left) - NEAR, y: Math.floor(middle - track.height / 2) - NEAR, width: Math.ceil(track.width) + NEAR + NEAR, height: Math.ceil(track.height) + NEAR + NEAR }
    await page.mouse.move(grip + 1, middle)
    await settle(page)
    const rest = await page.screenshot({ clip })
    await page.mouse.down()
    await settle(page)
    expect((await page.screenshot({ clip })).equals(rest), `${id}: press`).toBe(true)
    await page.mouse.move(grip + 1, middle + 1)
    await settle(page)
    expect((await page.screenshot({ clip })).equals(rest), `${id}: wobble`).toBe(true)
    await expect(control).not.toHaveAttribute('data-moving')
    await page.mouse.up()
    await settle(page)
  }
})

test('follows the pointer one to one from a grab of the end of the pill', async ({ page }) => {
  const control = slider(page, 'slider-opacity')
  const before = await parts(control)
  await page.mouse.move(before.grip + NEAR, before.middle)
  await page.mouse.down()
  await expect(control).toHaveAttribute('data-dragging')
  expect(Math.abs((await parts(control)).grip - before.grip)).toBeLessThan(STILL)
  await page.mouse.move(before.grip + NEAR + DRAG, before.middle, { steps: 5 })
  expect(Math.abs((await parts(control)).grip - before.grip - DRAG)).toBeLessThan(TOLERANCE)
  await expect(control).toHaveAttribute('data-moving')
  await page.mouse.up()
  await settle(page)
  await expect(control).not.toHaveAttribute('data-dragging')
  await expect(control).not.toHaveAttribute('data-moving')
  expect(Math.abs((await parts(control)).grip - before.grip - DRAG)).toBeLessThan(STEP_TOLERANCE)
})

test('moves the end of the pill where it is tapped, next to the grip and far from it', async ({ page }) => {
  const control = slider(page, 'slider-opacity')
  for (const by of [NEAR, -NEAR - NEAR, DRAG + DRAG]) {
    const before = await parts(control)
    await page.mouse.click(before.grip + by, before.middle)
    await settle(page)
    expect(Math.abs((await parts(control)).grip - before.grip - by), `tap ${by} px from the grip`).toBeLessThan(STEP_TOLERANCE)
  }
})

test('brings the end of the pill under a pointer that presses the middle of the pill and keeps it there', async ({ page }) => {
  const control = slider(page, 'slider-opacity')
  await page.keyboard.press('Tab')
  await control.focus()
  await page.keyboard.press('End')
  await settle(page)
  const { lane, middle } = await parts(control)
  const pressed = lane.left + lane.width / 4
  await page.mouse.move(pressed, middle)
  await page.mouse.down()
  await settle(page)
  expect(Math.abs((await parts(control)).grip - pressed)).toBeLessThan(TOLERANCE)
  await page.mouse.move(pressed + DRAG, middle, { steps: 5 })
  expect(Math.abs((await parts(control)).grip - pressed - DRAG)).toBeLessThan(TOLERANCE)
  await page.mouse.up()
})

test('keeps the pill of a stepped slider on its step until the pointer reaches the next one, never ahead of the pointer', async ({ page }) => {
  const control = slider(page, 'slider-effort')
  const start = await parts(control)
  const step = start.lane.width / 3
  await page.mouse.move(start.grip, start.middle)
  await page.mouse.down()
  for (let moved = 4; moved < step - 4; moved += 4) {
    await page.mouse.move(start.grip + moved, start.middle)
    await expect(control).toHaveAttribute('aria-valuetext', 'Medium')
    expect((await parts(control)).grip, `pointer ${moved} px along`).toBeLessThanOrEqual(start.grip + moved + TOLERANCE)
  }
  await page.mouse.move(start.grip + step + 1, start.middle)
  await expect(control).toHaveAttribute('aria-valuetext', 'High')
  await settle(page)
  expect(Math.abs((await parts(control)).grip - start.grip - step)).toBeLessThan(TOLERANCE)
  await page.mouse.move(start.grip + 4, start.middle, { steps: 6 })
  await expect(control).toHaveAttribute('aria-valuetext', 'High')
  await page.mouse.move(start.grip - 1, start.middle)
  await expect(control).toHaveAttribute('aria-valuetext', 'Medium')
  await page.mouse.up()
  await settle(page)
  expect(Math.abs((await parts(control)).grip - start.grip)).toBeLessThan(TOLERANCE)
})

test('stretches the track past an end up to two sevenths of the pill height and springs back', async ({ page }) => {
  const control = slider(page, 'slider-opacity')
  const rest = await parts(control)
  await page.mouse.move(rest.grip, rest.middle)
  await page.mouse.down()
  await page.mouse.move(rest.track.right + FAR, rest.middle, { steps: 6 })
  await expect(control).toHaveAttribute('data-over')
  await expect(control).toHaveAttribute('data-wall', 'end')
  await expect(control).toHaveAttribute('aria-valuenow', '100')
  const stretched = await parts(control)
  expect(Math.abs(stretched.track.width - rest.track.width - rest.cap.height * BAND_SHARE)).toBeLessThan(TOLERANCE)
  expect(Math.abs(stretched.track.left - rest.track.left)).toBeLessThan(TOLERANCE)
  await page.mouse.move(rest.track.right + FAR + FAR, rest.middle, { steps: 3 })
  expect(Math.abs((await parts(control)).track.width - stretched.track.width)).toBeLessThan(TOLERANCE)
  await page.mouse.up()
  await settle(page)
  await expect(control).not.toHaveAttribute('data-over')
  expect(Math.abs((await parts(control)).track.width - rest.track.width)).toBeLessThan(TOLERANCE)
})

test('keeps the page as wide as the window at the highest value of every slider', async ({ page }) => {
  const controls = page.getByRole('region', { name: 'Slider', exact: true }).getByRole('slider')
  for (const control of await controls.all()) {
    if ((await control.getAttribute('aria-disabled')) === 'true') continue
    await control.focus()
    await page.keyboard.press('End')
  }
  await settle(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
})

test('hides the text at the end of the track before the pill covers it and shows it again', async ({ page }) => {
  const control = slider(page, 'slider-opacity')
  const end = control.locator("[data-slot='end']")
  await expect(end).not.toHaveAttribute('data-covered')
  await control.focus()
  await page.keyboard.press('End')
  await expect(end).toHaveAttribute('data-covered')
  await page.keyboard.press('Home')
  await expect(end).not.toHaveAttribute('data-covered')
})

test('steps with the keys, mirrors the horizontal arrows from right to left and commits each key', async ({ page }) => {
  const control = slider(page, 'slider-controlled')
  await control.focus()
  for (const [key, value] of [
    ['ArrowRight', 31],
    ['ArrowLeft', 30],
    ['ArrowUp', 31],
    ['ArrowDown', 30],
    ['PageUp', 40],
    ['PageDown', 30],
    ['End', 100],
    ['Home', 0],
  ] as const) {
    await page.keyboard.press(key)
    await expect(control, key).toHaveAttribute('aria-valuenow', String(value))
    await expect(page.getByTestId('slider-volume')).toHaveText(String(value))
  }
  await control.evaluate((element) => element.parentElement?.setAttribute('dir', 'rtl'))
  await page.keyboard.press('ArrowLeft')
  await expect(control).toHaveAttribute('aria-valuenow', '1')
  await page.keyboard.press('ArrowRight')
  await expect(control).toHaveAttribute('aria-valuenow', '0')
})

test('grows the pill from the right in a right to left slider and follows the pointer there', async ({ page }) => {
  const control = slider(page, 'slider-opacity')
  await control.evaluate((element) => element.parentElement?.setAttribute('dir', 'rtl'))
  const before = await parts(control)
  expect(Math.abs(before.cap.left - (before.lane.left + before.lane.width * 0.6)), 'the pill ends at 40 % from the right').toBeLessThan(TOLERANCE)
  await page.mouse.move(before.grip, before.middle)
  await page.mouse.down()
  await page.mouse.move(before.grip - DRAG, before.middle, { steps: 5 })
  expect(Math.abs((await parts(control)).grip - before.grip + DRAG)).toBeLessThan(TOLERANCE)
  expect(await valueOf(control)).toBeGreaterThan(40)
  await page.mouse.up()
})

test('returns to the value of a consumer that turns a change down', async ({ page }) => {
  const control = slider(page, 'slider-capped')
  const before = await parts(control)
  await page.mouse.move(before.grip, before.middle)
  await page.mouse.down()
  await page.mouse.move(before.track.right - NEAR, before.middle, { steps: 6 })
  await page.mouse.up()
  await settle(page)
  await expect(control).toHaveAttribute('aria-valuenow', '50')
  await expect(control).toHaveAttribute('aria-valuetext', '50%')
  const { lane, cap } = await parts(control)
  expect(Math.abs(cap.right - (lane.left + lane.width / 2))).toBeLessThan(TOLERANCE)
})

test('renders only the value text of an uncontrolled slider while the pointer drags it', async ({ page }) => {
  await page.addInitScript(installCommitProbe)
  await page.reload()
  await hydrated(page)
  const control = slider(page, 'slider-opacity')
  await control.scrollIntoViewIfNeeded()
  await expect.poll(() => page.evaluate(() => window.labRenders?.length ?? 0)).toBeGreaterThan(0)
  const before = await parts(control)
  await page.mouse.move(before.grip, before.middle)
  await page.mouse.down()
  await clearRenders(page)
  await page.mouse.move(before.grip + DRAG, before.middle, { steps: 8 })
  await expect.poll(() => valueOf(control)).toBeGreaterThan(40)
  const hosts = await page.evaluate(() => (window.labRenders ?? []).map(({ host }) => host?.getAttribute('data-slot') ?? host?.localName ?? 'none'))
  expect(hosts.length).toBeGreaterThan(0)
  expect(hosts.filter((host) => host !== 'label')).toEqual([])
  await page.mouse.up()
})
