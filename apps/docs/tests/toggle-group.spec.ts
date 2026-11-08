import { TYPEAHEAD_RESET } from '@mattymroz/tessera/lib/collection'
import { milliseconds } from '@mattymroz/tessera/lib/motion'
import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  box,
  clearRecorded,
  clearRenders,
  failures,
  installCommitProbe,
  lightness,
  offCompositor,
  pixels,
  raisedShadow,
  recordAnimations,
  recorded,
  startTrace,
  visit,
} from './helpers'

const PAGE = '/components'
const EDGES = '/screens/edges'
const TOLERANCE = 0.5
const SETTLE = 600
const TYPEAHEAD_MARGIN = 100
const PILL_EDGE = 6
const TRACK_EDGE = 1
const PILL_STEP = 0.06
const HOVER_STEP = 0.02
const MILLISECONDS = 1000
const RANGES = ['Day', 'Week', 'Month'] as const
const CORNERS = ['none', 'sm', 'md', 'lg', 'full'] as const
const CURVES = ['round', 'squircle'] as const

type Shape = { readonly radius: number; readonly corner: string; readonly height: number; readonly padding: number; readonly border: number }

function shapeOf(element: Element): Shape {
  const style = getComputedStyle(element)
  return {
    radius: Number.parseFloat(style.borderTopLeftRadius),
    corner: style.getPropertyValue('corner-top-left-shape'),
    height: element.getBoundingClientRect().height,
    padding: Number.parseFloat(style.paddingTop),
    border: Number.parseFloat(style.borderTopWidth),
  }
}

function group(page: Page, name: string): Locator {
  return page.getByRole('radiogroup', { name, exact: true })
}

function activePill(scope: Locator): Locator {
  return scope.locator('[data-recipe="indicator"]:not([data-variant="hover"])')
}

function hoverPill(scope: Locator): Locator {
  return scope.locator('[data-recipe="indicator"][data-variant="hover"]')
}

function widthsOf(scope: Locator): Promise<number[]> {
  return scope.getByRole('radio').evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width))
}

function spread(sizes: readonly number[]): number {
  return Math.max(...sizes) - Math.min(...sizes)
}

async function expectChosen(scope: Locator, name: string): Promise<void> {
  const option = scope.getByRole('radio', { name, exact: true })
  await expect(option).toHaveAttribute('aria-checked', 'true')
  await expect(option).toBeFocused()
  await expect(scope.locator('[aria-checked="true"]')).toHaveCount(1)
  await expect.poll(async () => Math.abs((await box(activePill(scope))).x - (await box(option)).x)).toBeLessThan(TOLERANCE)
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(recordAnimations)
  await visit(page, PAGE)
})

test('renders one radio button per option and nothing else', async ({ page }) => {
  const range = group(page, 'Range (md)')
  await expect(range.locator(':scope > :not([data-recipe="indicator"])')).toHaveCount(RANGES.length)
  await expect(range.locator(':scope > button[role="radio"]')).toHaveCount(RANGES.length)
  await expect(range.locator('input')).toHaveCount(0)
  await expect(range.getByRole('radio', { name: 'Week' })).toHaveAttribute('aria-checked', 'true')
  await expect(range.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'false')
})

test('enters a group with Tab on the chosen option', async ({ page }) => {
  await group(page, 'Range (sm)').getByRole('radio', { name: 'Week' }).focus()
  await page.keyboard.press('Tab')
  await expect(group(page, 'Range (md)').getByRole('radio', { name: 'Week' })).toBeFocused()
})

test('enters a group whose chosen option is disabled on the first enabled option and a group without a choice once', async ({ page }) => {
  await group(page, 'With a disabled option').getByRole('radio', { name: 'Day' }).focus()
  await page.keyboard.press('Tab')
  const disabled = group(page, 'Chosen option disabled')
  await expect(disabled.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true')
  await expect(disabled.getByRole('radio', { name: 'Week' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expectChosen(disabled, 'Month')
  await page.keyboard.press('Tab')
  const open = group(page, 'Nothing chosen yet')
  await expect(open.getByRole('radio', { name: 'Day' })).toBeFocused()
  await expect(open.locator('[aria-checked="true"]')).toHaveCount(0)
  await page.keyboard.press('Tab')
  await expect(group(page, 'One character').getByRole('radio', { name: '1' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(open.getByRole('radio', { name: 'Day' })).toBeFocused()
})

test('re-renders at most the tab stop and the newly chosen option on the first choice of a group', async ({ page }) => {
  await page.addInitScript(installCommitProbe)
  await page.reload()
  const open = group(page, 'Nothing chosen yet')
  await expect(open.getByRole('radio', { name: 'Day' })).toHaveAttribute('tabindex', '0')
  await expect.poll(() => page.evaluate(() => window.labRenders?.length ?? 0)).toBeGreaterThan(0)
  await clearRenders(page)

  await open.getByRole('radio', { name: 'Month' }).click()
  await expectChosen(open, 'Month')
  const options = await page.evaluate(() =>
    (window.labRenders ?? []).flatMap(({ host }) => (host?.matches('[role="radio"]') ? [host.textContent ?? ''] : [])),
  )
  expect(options.toSorted()).toEqual(['Day', 'Month'])
  expect(await open.getByRole('radio').evaluateAll((elements) => elements.map((element) => element.getAttribute('tabindex')))).toEqual(['-1', '-1', '0'])
})

test('shows the focus ring on the option a typed letter moves to after a click', async ({ page }) => {
  const range = group(page, 'Range (md)')
  await range.getByRole('radio', { name: 'Week' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-input', 'pointer')
  await page.keyboard.press('m')
  await expectChosen(range, 'Month')
  await expect(page.locator('html')).toHaveAttribute('data-input', 'keyboard')
  expect(await range.getByRole('radio', { name: 'Month' }).evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid')
})

test('slides the pill of the mode group of the theme panel, though the theme change holds the plates', async ({ page }) => {
  const mode = page.getByRole('radiogroup', { name: 'mode', exact: true })
  await mode.getByRole('radio', { name: 'light', exact: true }).click()
  await page.waitForTimeout(500)
  await mode.evaluate((element) => {
    const animate = Element.prototype.animate
    const durations: number[] = []
    element.setAttribute('data-durations', '')
    Element.prototype.animate = function (keyframes, options) {
      if (element.contains(this)) durations.push(typeof options === 'number' ? options : Number(options?.duration))
      element.setAttribute('data-durations', durations.join(' '))
      return animate.call(this, keyframes, options)
    }
  })
  await mode.getByRole('radio', { name: 'system', exact: true }).click()
  await expect(mode).toHaveAttribute('data-durations', /[1-9]/)
})

test('reads the motion of a group again at every slide, so a subtree switched to motion off stops sliding', async ({ page }) => {
  const widths = group(page, 'Different widths')
  const active = activePill(widths)
  const slide = async (name: string): Promise<number> => {
    await clearRecorded(page)
    const option = widths.getByRole('radio', { name, exact: true })
    await option.click()
    await expect.poll(async () => Math.abs((await box(active)).x - (await box(option)).x)).toBeLessThan(TOLERANCE)
    await page.waitForTimeout(SETTLE)
    return (await recorded(page)).filter((animation) => animation.recipe === 'indicator').length
  }
  const setMotion = (motion: string | null): Promise<void> =>
    widths.evaluate((element, value) => {
      const parent = element.parentElement
      if (!parent) throw new Error('no parent')
      if (value === null) parent.removeAttribute('data-motion')
      else parent.setAttribute('data-motion', value)
    }, motion)
  await expect(active).toHaveAttribute('data-visible', 'true')
  expect(await slide('B')).toBeGreaterThan(0)
  await setMotion('off')
  expect(await slide('A')).toBe(0)
  await setMotion(null)
  expect(await slide('B')).toBeGreaterThan(0)
})

test('moves the choice with the arrows, wraps at the ends and jumps with Home and End', async ({ page }) => {
  const range = group(page, 'Range (md)')
  await range.getByRole('radio', { name: 'Week' }).focus()
  const steps: readonly (readonly [string, string])[] = [
    ['ArrowRight', 'Month'],
    ['ArrowRight', 'Day'],
    ['ArrowLeft', 'Month'],
    ['ArrowDown', 'Day'],
    ['ArrowUp', 'Month'],
    ['Home', 'Day'],
    ['End', 'Month'],
  ]
  for (const [key, chosen] of steps) {
    await page.keyboard.press(key)
    await expectChosen(range, chosen)
  }
})

test('moves the choice to the next option that starts with a typed letter, also by the name of an icon-only option', async ({ page }) => {
  const range = group(page, 'Range (md)')
  await range.getByRole('radio', { name: 'Week' }).focus()
  await page.keyboard.press('m')
  await expectChosen(range, 'Month')
  await page.waitForTimeout(TYPEAHEAD_RESET + TYPEAHEAD_MARGIN)
  await page.keyboard.press('D')
  await expectChosen(range, 'Day')

  await visit(page, EDGES)
  const icons = page.getByRole('region', { name: 'Toggle group', exact: true }).getByTestId('full').getByRole('radiogroup', { name: 'Icons only' })
  await icons.getByRole('radio', { name: 'left' }).focus()
  await page.keyboard.press('r')
  await expectChosen(icons, 'right')
})

test('swaps the left and right arrows in a group laid out from right to left', async ({ page }) => {
  await visit(page, EDGES)
  const range = group(page, 'Range from the right')
  await range.getByRole('radio', { name: 'Week' }).focus()
  for (const [key, chosen] of [
    ['ArrowLeft', 'Month'],
    ['ArrowRight', 'Week'],
    ['ArrowRight', 'Day'],
  ] as const) {
    await page.keyboard.press(key)
    await expectChosen(range, chosen)
  }
})

test('sizes the active pill to the chosen option through the instance keys', async ({ page }) => {
  const widths = group(page, 'Different widths')
  const pill = activePill(widths)
  const long = widths.getByRole('radio', { name: 'A much longer label' })
  await long.click()
  await expect.poll(async () => Math.abs((await box(pill)).x - (await box(long)).x)).toBeLessThan(TOLERANCE)
  const [size, target] = await Promise.all([
    pill.evaluate((element) => {
      if (!(element instanceof HTMLElement)) throw new Error('not an element')
      return {
        inline: Number.parseFloat(element.style.getPropertyValue('--ts-i-inline-size')),
        block: Number.parseFloat(element.style.getPropertyValue('--ts-i-block-size')),
        width: element.style.width,
        height: element.style.height,
      }
    }),
    box(long),
  ])
  expect(size.width).toBe('')
  expect(size.height).toBe('')
  expect(Math.abs(size.inline - target.width)).toBeLessThan(TOLERANCE)
  expect(Math.abs(size.block - target.height)).toBeLessThan(TOLERANCE)
  const drawn = await box(pill)
  expect(Math.abs(drawn.width - target.width)).toBeLessThan(TOLERANCE)
  expect(Math.abs(drawn.height - target.height)).toBeLessThan(TOLERANCE)
})

test('re-renders only the previously and the newly chosen option when the choice changes', async ({ page }) => {
  await page.addInitScript(installCommitProbe)
  await page.reload()
  const days = group(page, '5 options')
  await expect(activePill(days)).toHaveAttribute('data-visible', 'true')
  await expect.poll(() => page.evaluate(() => window.labRenders?.length ?? 0)).toBeGreaterThan(0)
  await clearRenders(page)

  await days.getByRole('radio', { name: 'Thu' }).click()
  await expectChosen(days, 'Thu')
  const options = await page.evaluate(() =>
    (window.labRenders ?? []).flatMap(({ host }) => (host?.matches('[role="radio"]') ? [host.textContent ?? ''] : [])),
  )
  expect(options.toSorted()).toEqual(['Mon', 'Thu'])
})

test('slides the active pill of a toggle group only by transform onto the chosen option', async ({ page, browserName }) => {
  const widths = group(page, 'Different widths')
  const active = activePill(widths)
  const medium = widths.getByRole('radio', { name: 'Medium' })
  const long = widths.getByRole('radio', { name: 'A much longer label' })
  await expect(active).toHaveAttribute('data-visible', 'true')
  expect(Math.abs((await box(active)).x - (await box(medium)).x)).toBeLessThan(TOLERANCE)

  await clearRecorded(page)
  const trace = browserName === 'chromium' ? await startTrace(page) : undefined
  await long.click()
  await expect(long).toHaveAttribute('aria-checked', 'true')
  await expect.poll(async () => Math.abs((await box(active)).x - (await box(long)).x)).toBeLessThan(TOLERANCE)
  await expect.poll(async () => Math.abs((await box(active)).width - (await box(long)).width)).toBeLessThan(TOLERANCE)
  const events = (await trace?.stop()) ?? []

  const slides = (await recorded(page)).filter((animation) => animation.recipe === 'indicator')
  expect(slides.length).toBeGreaterThan(0)
  expect(slides.flatMap((animation) => animation.properties)).toContain('transform')
  expect(offCompositor(slides)).toEqual([])
  if (browserName === 'chromium') {
    expect(events.some((event) => event.cat?.includes('blink.animations'))).toBe(true)
    expect(failures(events)).toEqual([])
  }
})

test('squashes the choice pill at the wall of the track only by transform', async ({ page, browserName }) => {
  const widths = group(page, 'Different widths')
  const active = activePill(widths)
  const hover = widths.locator('[data-recipe="indicator"][data-variant="hover"]')
  const last = widths.getByRole('radio', { name: 'B', exact: true })
  await expect(active).toHaveAttribute('data-visible', 'true')

  await clearRecorded(page)
  const trace = browserName === 'chromium' ? await startTrace(page) : undefined
  await last.hover()
  await expect(hover).toHaveAttribute('data-visible', 'true')
  await page.mouse.down()
  await page.mouse.up()
  await expect(active).toHaveAttribute('data-wall', 'end')
  await page.waitForTimeout(SETTLE)
  const events = (await trace?.stop()) ?? []

  const slides = (await recorded(page)).filter((animation) => animation.recipe === 'indicator')
  expect(slides.length).toBeGreaterThan(0)
  expect(slides.flatMap((animation) => animation.properties)).toContain('transform')
  expect(offCompositor(slides)).toEqual([])
  if (browserName === 'chromium') {
    expect(events.some((event) => event.cat?.includes('blink.animations'))).toBe(true)
    expect(failures(events)).toEqual([])
  }
})

test('raises the chosen pill by default with the raised shadow on a grey track without an outline', async ({ page }) => {
  const range = group(page, 'Range (raised)')
  const pill = activePill(range)
  const fill = pill.locator('[data-slot="squash"]')
  await expect(pill).toHaveAttribute('data-variant', 'raised')
  await expect(pill).toHaveAttribute('data-visible', 'true')
  const shadow = await raisedShadow(page)
  expect(shadow).not.toBe('none')
  const look = await fill.evaluate((element) => {
    const style = getComputedStyle(element)
    return { shadow: style.boxShadow, border: style.borderTopWidth, opacity: style.opacity }
  })
  expect(look).toEqual({ shadow, border: '0px', opacity: '1' })
  const track = await range.evaluate((element) => {
    const style = getComputedStyle(element)
    return { border: style.borderTopColor, background: style.backgroundColor }
  })
  expect(track.border).toBe('rgba(0, 0, 0, 0)')
  expect(track.background).not.toBe('rgba(0, 0, 0, 0)')
  await expect(activePill(group(page, 'Range (active)'))).toHaveAttribute('data-variant', 'active')

  await clearRecorded(page)
  const month = range.getByRole('radio', { name: 'Month' })
  await month.click()
  await expect.poll(async () => Math.abs((await box(pill)).x - (await box(month)).x)).toBeLessThan(TOLERANCE)
  const slides = (await recorded(page)).filter((animation) => animation.recipe === 'indicator')
  expect(slides.flatMap((animation) => animation.properties)).toContain('transform')
  expect(offCompositor(slides)).toEqual([])
})

test('hides the hover pill over the chosen option, when the pointer leaves the track and when the window loses focus', async ({ page }) => {
  const widths = group(page, 'Different widths')
  const hover = hoverPill(widths)
  await widths.getByRole('radio', { name: 'Medium' }).hover()
  await expect(hover).toHaveAttribute('data-visible', 'false')
  const last = widths.getByRole('radio', { name: 'B', exact: true })
  await last.hover()
  await expect(hover).toHaveAttribute('data-visible', 'true')
  await page.mouse.move(0, 0)
  await expect(hover).toHaveAttribute('data-visible', 'false')
  await last.hover()
  await expect(hover).toHaveAttribute('data-visible', 'true')
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect(hover).toHaveAttribute('data-visible', 'false')
})

test('keeps the segment gap of the space engine between the options of a toggle group and of a button group track', async ({ page }) => {
  const segment = await page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ts-space-segment')))
  expect(segment).toBeGreaterThan(0)
  for (const scope of [group(page, 'Range (raised)'), group(page, 'Different widths'), page.getByRole('group', { name: 'History', exact: true })]) {
    const gaps = await scope.locator(':scope > [data-recipe="control"]').evaluateAll((elements) => {
      const boxes = elements.map((element) => element.getBoundingClientRect())
      return boxes.slice(1).map((next, index) => next.left - (boxes[index]?.right ?? 0))
    })
    expect(gaps.length).toBeGreaterThan(0)
    for (const gap of gaps) expect(Math.abs(gap - segment)).toBeLessThanOrEqual(TOLERANCE)
  }
})

test('paints the hover pill under the chosen pill, also where the two overlap', async ({ page }) => {
  const range = group(page, 'Range (raised)')
  await range.scrollIntoViewIfNeeded()
  await expect(activePill(range)).toHaveAttribute('data-visible', 'true')
  const order = await range.evaluate((element) => {
    const pills = [...element.querySelectorAll(':scope > [data-recipe="indicator"]')]
    return pills.map((pill) => pill.getAttribute('data-variant'))
  })
  expect(order).toEqual(['hover', 'raised'])
  const chosen = await box(range.getByRole('radio', { name: 'Day' }))
  const sample = { x: chosen.x + chosen.width / 2, y: chosen.y + 2 }
  const [alone] = await pixels(page, [sample])
  await range.evaluate((element) => {
    const [hover, active] = [...element.querySelectorAll<HTMLElement>(':scope > [data-recipe="indicator"]')]
    if (!hover || !active) throw new Error('no pills')
    hover.style.transform = active.style.transform
    for (const key of ['--ts-i-inline-size', '--ts-i-block-size']) hover.style.setProperty(key, active.style.getPropertyValue(key))
    hover.setAttribute('data-visible', 'true')
    for (const squash of hover.querySelectorAll<HTMLElement>('[data-slot="squash"]')) squash.style.setProperty('opacity', '1')
  })
  await page.waitForTimeout(SETTLE)
  const [covered] = await pixels(page, [sample])
  expect(covered).toEqual(alone)
})

for (const mode of ['light', 'dark'] as const) {
  test(`keeps the hover pill of a track clearly weaker than the chosen pill and still visible in the ${mode} mode`, async ({ page }) => {
    await page.evaluate((value) => document.documentElement.setAttribute('data-mode', value), mode)
    const range = group(page, 'Range (raised)')
    await range.scrollIntoViewIfNeeded()
    const [chosen, hovered, track] = await Promise.all([box(range.getByRole('radio', { name: 'Day' })), box(range.getByRole('radio', { name: 'Week' })), box(range)])
    await page.mouse.move(hovered.x + hovered.width / 2, hovered.y + hovered.height / 2)
    await expect(hoverPill(range)).toHaveAttribute('data-visible', 'true')
    await page.waitForTimeout(SETTLE)
    const edge = (target: { x: number; y: number; height: number }): { x: number; y: number } => ({ x: target.x + PILL_EDGE, y: target.y + target.height / 2 })
    const [raised, hover, ground] = (await pixels(page, [edge(chosen), edge(hovered), { x: track.x + track.width - TRACK_EDGE, y: track.y + track.height / 2 }])).map(lightness)
    if (raised === undefined || hover === undefined || ground === undefined) throw new Error('no pixels')
    expect(Math.abs(raised - hover), `${mode}: chosen ${raised} hover ${hover}`).toBeGreaterThanOrEqual(PILL_STEP)
    expect(Math.abs(hover - ground), `${mode}: hover ${hover} track ${ground}`).toBeGreaterThanOrEqual(HOVER_STEP)
  })
}

test('fades the hover pill out over the hover exit time and at once with motion off', async ({ page }) => {
  const range = group(page, 'Range (raised)')
  const exit = (): Promise<string> => hoverPill(range).evaluate((element) => getComputedStyle(element).transitionDuration)
  const hoverOut = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ts-motion-duration-hover-out'))
  expect(milliseconds(hoverOut)).toBeGreaterThan(0)
  expect(await exit()).toBe(`${milliseconds(hoverOut) / MILLISECONDS}s`)
  await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'off'))
  expect(await exit()).toBe('0s')
})

test('fades the hover pill out over the exit time when the option under the cursor is chosen, while the chosen pill slides there, and keeps it out', async ({ page }) => {
  const range = group(page, 'Range (raised)')
  const month = range.getByRole('radio', { name: 'Month', exact: true })
  const exitTime = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ts-motion-duration-hover-out'))
  await month.hover()
  await expect(hoverPill(range)).toHaveAttribute('data-visible', 'true')
  await page.waitForTimeout(SETTLE)
  await month.click()
  const motion = await range.evaluate((element) => {
    const hover = element.querySelector('[data-recipe="indicator"][data-variant="hover"]')
    const chosen = element.querySelector('[data-recipe="indicator"]:not([data-variant="hover"])')
    const fades = (hover?.getAnimations() ?? []).flatMap((animation) =>
      animation instanceof CSSTransition && animation.transitionProperty === 'opacity' ? [Number(animation.effect?.getComputedTiming().duration)] : [],
    )
    return { fades, slides: chosen?.getAnimations().length ?? 0 }
  })
  expect(motion.fades).toEqual([milliseconds(exitTime)])
  expect(motion.fades[0]).toBeGreaterThan(0)
  expect(motion.slides).toBeGreaterThan(0)
  await expect(hoverPill(range)).toHaveAttribute('data-visible', 'false')
  await page.waitForTimeout(SETTLE)
  expect(await hoverPill(range).evaluate((element) => ({ visible: element.getAttribute('data-visible'), opacity: getComputedStyle(element).opacity }))).toEqual({ visible: 'false', opacity: '0' })
})

test('keeps the hover pill on the last option over a disabled option', async ({ page }) => {
  const options = group(page, 'With a disabled option')
  const hover = hoverPill(options)
  const month = options.getByRole('radio', { name: 'Month' })
  await month.hover()
  await expect(hover).toHaveAttribute('data-visible', 'true')
  await expect.poll(async () => Math.abs((await box(hover)).x - (await box(month)).x)).toBeLessThan(TOLERANCE)
  await options.getByRole('radio', { name: 'Week' }).hover()
  await page.waitForTimeout(SETTLE)
  await expect(hover).toHaveAttribute('data-visible', 'true')
  expect(Math.abs((await box(hover)).x - (await box(month)).x)).toBeLessThan(TOLERANCE)
})

test('gives every option the width of the widest one and slides the pill without resizing it', async ({ page }) => {
  const widths = group(page, 'Different widths')
  expect(spread(await widthsOf(widths))).toBeLessThanOrEqual(TOLERANCE)
  const longest = widths.getByRole('radio', { name: 'A much longer label' }).locator('[data-slot="label"]')
  expect(await longest.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)

  const active = activePill(widths)
  await expect(active).toHaveAttribute('data-visible', 'true')
  const before = (await box(active)).width
  const last = widths.getByRole('radio', { name: 'B', exact: true })
  await last.click()
  await expect.poll(async () => Math.abs((await box(active)).x - (await box(last)).x)).toBeLessThan(TOLERANCE)
  expect(Math.abs((await box(active)).width - before)).toBeLessThan(TOLERANCE)
})

test('keeps an option at least as wide as it is tall', async ({ page }) => {
  for (const name of ['One character', 'Alignment']) {
    const sizes = await group(page, name)
      .getByRole('radio')
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect()))
    for (const { width, height } of sizes) expect(width - height, name).toBeGreaterThanOrEqual(-TOLERANCE)
  }
})

test('narrows the options in a narrow container and cuts their labels with an ellipsis', async ({ page }) => {
  const narrow = group(page, 'In a narrow container')
  const room = await narrow.evaluate((element) => element.parentElement?.getBoundingClientRect().width ?? 0)
  expect((await box(narrow)).width).toBeLessThanOrEqual(room + TOLERANCE)
  expect(spread(await widthsOf(narrow))).toBeLessThanOrEqual(TOLERANCE)
  const labels = await narrow.locator('[data-slot="label"]').evaluateAll((elements) =>
    elements.map((element) => ({ cut: element.scrollWidth > element.clientWidth, overflow: getComputedStyle(element).textOverflow })),
  )
  expect(labels.some((label) => label.cut)).toBe(true)
  expect(labels.every((label) => label.overflow === 'ellipsis')).toBe(true)
})

test('keeps every pill unpressed while the option under the active pill is pressed', async ({ page }) => {
  const range = group(page, 'Range (md)')
  await expect(activePill(range)).toHaveAttribute('data-visible', 'true')
  await range.getByRole('radio', { name: 'Week' }).hover()
  await page.mouse.down()
  await page.waitForTimeout(SETTLE)
  const parts = await range
    .locator('[data-recipe="indicator"], [data-recipe="indicator"] *')
    .evaluateAll((elements) => elements.map((element) => ({ scale: getComputedStyle(element).scale, pressing: element.hasAttribute('data-pressing') })))
  await page.mouse.up()
  expect(parts.length).toBeGreaterThan(0)
  expect(parts).toEqual(parts.map(() => ({ scale: 'none', pressing: false })))
})

test('gives a pressed option no press step: the hover pill keeps its fill and neither the option nor a pill scales', async ({ page }) => {
  const range = group(page, 'Range (md)')
  const month = range.getByRole('radio', { name: 'Month', exact: true })
  await expect(month).toHaveAttribute('aria-checked', 'false')
  const fill = (): Promise<number> => hoverPill(range).locator('[data-slot="squash"]').evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))
  const track = await page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ts-state-indicator-track')))
  await month.hover()
  await expect(hoverPill(range)).toHaveAttribute('data-visible', 'true')
  expect(await fill()).toBeCloseTo(track, 3)
  await page.mouse.down()
  await page.waitForTimeout(SETTLE)
  await expect(month).not.toHaveAttribute('data-pressing')
  expect(await fill()).toBeCloseTo(track, 3)
  const scales = await range.locator('[role="radio"], [data-recipe="indicator"], [data-recipe="indicator"] *').evaluateAll((elements) => [
    ...new Set(elements.flatMap((element) => [getComputedStyle(element).scale, getComputedStyle(element, '::before').scale])),
  ])
  expect(scales).toEqual(['none'])
  await page.mouse.up()
  await expect(month).toHaveAttribute('aria-checked', 'true')
})

test('keeps the track concentric with the active pill for every corner and curve', async ({ page }) => {
  const tracks = [group(page, 'Range (md)'), group(page, 'Range in a card (raised)')]
  for (const corners of CORNERS) {
    for (const curve of CURVES) {
      await page.evaluate(
        ({ corners, curve }) => {
          document.documentElement.setAttribute('data-corners', corners)
          document.documentElement.setAttribute('data-curve', curve)
        },
        { corners, curve },
      )
      for (const track of tracks) {
        const outer = await track.evaluate(shapeOf)
        const inner = await activePill(track).locator('[data-slot="squash"]').evaluate(shapeOf)
        const inset = corners === 'none' ? 0 : outer.padding + outer.border
        const label = `${corners} ${curve}`
        expect(Math.abs(outer.radius - inner.radius - inset), label).toBeLessThanOrEqual(TOLERANCE)
        expect(outer.corner, label).toBe(inner.corner)
        if (corners === 'full') {
          expect(Math.abs(outer.radius - outer.height / 2), label).toBeLessThanOrEqual(TOLERANCE)
          expect(Math.abs(inner.radius - inner.height / 2), label).toBeLessThanOrEqual(TOLERANCE)
        }
      }
    }
  }
})

const SCALES = [1, 1.25, 1.5] as const
const CROSS_EDGE = 10
const CROSS_STEP = 1
const CROSS_PAUSE = 16
const GAP_DWELL = 150
const GLIDE_SAMPLE = 8
const HOVER_SHOWN = 0.5
const MIN_CROSS_FRAMES = 20

type CrossFrame = { readonly opacity: number; readonly x: number }

async function watchHoverPill(pill: Locator): Promise<() => Promise<CrossFrame[]>> {
  await pill.evaluate((element, every) => {
    const frames: { opacity: number; x: number }[] = []
    const store = window as unknown as { __cross: typeof frames; __crossing: boolean }
    store.__cross = frames
    store.__crossing = true
    const sample = (): void => {
      if (!store.__crossing) return
      frames.push({ opacity: Number.parseFloat(getComputedStyle(element).opacity), x: element.getBoundingClientRect().x })
      setTimeout(sample, every)
    }
    sample()
  }, GLIDE_SAMPLE)
  return () =>
    pill.evaluate(() => {
      const store = window as unknown as { __cross: CrossFrame[]; __crossing: boolean }
      store.__crossing = false
      return store.__cross
    })
}

for (const scale of SCALES) {
  test.describe(`crossing the gap between two options at a device scale of ${scale}`, () => {
    test.use({ deviceScaleFactor: scale })

    for (const dwell of [0, GAP_DWELL]) {
      test(`keeps the hover pill shown in every frame and takes it to the next option when the pointer goes over the gap in 1 px steps${dwell ? ` and rests ${dwell} ms in it` : ''}`, async ({ page }) => {
        await visit(page, '/')
        const range = group(page, 'Range (raised)')
        await range.scrollIntoViewIfNeeded()
        const pill = hoverPill(range)
        const [from, to] = await Promise.all([box(range.getByRole('radio', { name: 'Week', exact: true })), box(range.getByRole('radio', { name: 'Month', exact: true }))])
        const y = from.y + from.height / 2
        const gapCentre = (from.x + from.width + to.x) / 2
        await page.mouse.move(from.x + from.width / 2, y)
        await expect(pill).toHaveAttribute('data-visible', 'true')
        await page.waitForTimeout(SETTLE)
        const stop = await watchHoverPill(pill)
        let rested = dwell === 0
        for (let x = from.x + from.width - CROSS_EDGE; x <= to.x + CROSS_EDGE; x += CROSS_STEP) {
          await page.mouse.move(x, y)
          await page.waitForTimeout(CROSS_PAUSE)
          if (!rested && x >= gapCentre) {
            await page.waitForTimeout(dwell)
            rested = true
          }
        }
        await expect.poll(async () => Math.abs((await box(pill)).x - to.x)).toBeLessThan(TOLERANCE)
        const frames = await stop()
        expect(frames.length).toBeGreaterThan(MIN_CROSS_FRAMES)
        expect(frames.filter((frame) => frame.opacity <= HOVER_SHOWN), 'frames with the hover pill faded').toEqual([])
        expect(frames.some((frame) => Math.abs(frame.x - from.x) < TOLERANCE), 'a frame on the first option').toBe(true)
        expect(Math.abs((frames.at(-1)?.x ?? 0) - to.x)).toBeLessThan(TOLERANCE)
      })
    }
  })
}
